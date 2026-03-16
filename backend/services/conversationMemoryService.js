/**
 * 🧠 CONVERSATION MEMORY SERVICE
 * 
 * Sistema de memoria persistente por conversación.
 * Ana recuerda el contexto completo de cada interacción.
 */

const { db, Timestamp } = require('../config/firebase');

class ConversationMemoryService {
  constructor() {
    this.maxHistoryLength = 20; // Mensajes a recordar
    this.contextExpirationHours = 24; // Memoria activa 24h
  }

  /**
   * Obtiene o crea una sesión de conversación
   */
  async getOrCreateSession(clinicId, userIdentifier, channel = 'chat') {
    const sessionId = this.generateSessionId(clinicId, userIdentifier);
    
    try {
      const sessionRef = db.collection('ana_conversations').doc(sessionId);
      const session = await sessionRef.get();
      
      if (session.exists) {
        const data = session.data();
        
        // Verificar si la sesión expiró
        const lastActivity = data.last_activity?.toDate() || new Date(0);
        const hoursSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastActivity > this.contextExpirationHours) {
          // Sesión expirada, crear nueva
          await this.archiveSession(sessionId, data);
          return this.createNewSession(sessionRef, clinicId, userIdentifier, channel);
        }
        
        // Sesión activa, actualizar
        await sessionRef.update({
          last_activity: Timestamp.now(),
          interaction_count: FieldValue.increment(1)
        });
        
        return {
          sessionId,
          isNew: false,
          history: data.messages || [],
          context: data.context || {},
          metadata: data.metadata || {}
        };
      }
      
      // Nueva sesión
      return this.createNewSession(sessionRef, clinicId, userIdentifier, channel);
      
    } catch (error) {
      console.error('🔥 [Memory] Error getting session:', error);
      return this.createFallbackSession(clinicId, userIdentifier);
    }
  }

  /**
   * Crea nueva sesión
   */
  async createNewSession(sessionRef, clinicId, userIdentifier, channel) {
    const sessionData = {
      clinic_id: clinicId,
      user_identifier: userIdentifier,
      channel: channel,
      created_at: Timestamp.now(),
      last_activity: Timestamp.now(),
      messages: [],
      context: {
        intents: [],
        entities: {},
        user_preferences: {},
        pending_actions: []
      },
      metadata: {
        interaction_count: 1,
        skills_used: [],
        outcomes: []
      }
    };
    
    await sessionRef.set(sessionData);
    
    return {
      sessionId: sessionRef.id,
      isNew: true,
      history: [],
      context: sessionData.context,
      metadata: sessionData.metadata
    };
  }

  /**
   * Añade mensaje al historial
   */
  async addMessage(sessionId, role, text, metadata = {}) {
    try {
      const message = {
        role, // 'user' o 'assistant'
        text: text.substring(0, 1000), // Limitar longitud
        timestamp: Timestamp.now(),
        metadata: {
          skill: metadata.skill,
          intent: metadata.intent,
          confidence: metadata.confidence,
          processing_time: metadata.processingTime
        }
      };
      
      const sessionRef = db.collection('ana_conversations').doc(sessionId);
      
      // Usar arrayUnion para añadir, luego limpiar si es necesario
      await sessionRef.update({
        messages: FieldValue.arrayUnion(message),
        last_activity: Timestamp.now()
      });
      
      // Si el historial es muy largo, truncarlo
      await this.trimHistoryIfNeeded(sessionId);
      
    } catch (error) {
      console.error('🔥 [Memory] Error adding message:', error);
    }
  }

  /**
   * Actualiza contexto de conversación
   */
  async updateContext(sessionId, contextUpdates) {
    try {
      const sessionRef = db.collection('ana_conversations').doc(sessionId);
      
      // Construir objeto de actualización
      const updates = {};
      Object.entries(contextUpdates).forEach(([key, value]) => {
        updates[`context.${key}`] = value;
      });
      updates['last_activity'] = Timestamp.now();
      
      await sessionRef.update(updates);
      
    } catch (error) {
      console.error('🔥 [Memory] Error updating context:', error);
    }
  }

  /**
   * Actualiza metadata de sesión
   */
  async updateMetadata(sessionId, metadataUpdates) {
    try {
      const sessionRef = db.collection('ana_conversations').doc(sessionId);
      
      const updates = {};
      Object.entries(metadataUpdates).forEach(([key, value]) => {
        if (key === 'skills_used' && Array.isArray(value)) {
          // Agregar skill a array sin duplicados
          updates[`metadata.skills_used`] = FieldValue.arrayUnion(...value);
        } else if (key === 'outcomes' && Array.isArray(value)) {
          updates[`metadata.outcomes`] = FieldValue.arrayUnion(...value);
        } else {
          updates[`metadata.${key}`] = value;
        }
      });
      
      await sessionRef.update(updates);
      
    } catch (error) {
      console.error('🔥 [Memory] Error updating metadata:', error);
    }
  }

  /**
   * Obtiene resumen del contexto actual
   */
  async getContextSummary(sessionId) {
    try {
      const session = await db.collection('ana_conversations').doc(sessionId).get();
      
      if (!session.exists) {
        return { history: [], context: {}, isEmpty: true };
      }
      
      const data = session.data();
      
      return {
        history: data.messages?.slice(-10) || [], // Últimos 10 mensajes
        context: data.context || {},
        metadata: data.metadata || {},
        isEmpty: false,
        messageCount: data.messages?.length || 0,
        sessionDuration: this.calculateSessionDuration(data)
      };
      
    } catch (error) {
      console.error('🔥 [Memory] Error getting context:', error);
      return { history: [], context: {}, isEmpty: true };
    }
  }

  /**
   * Extrae entidades del contexto acumulado
   */
  extractEntitiesFromHistory(history) {
    const entities = {
      dates: new Set(),
      times: new Set(),
      emails: new Set(),
      names: new Set(),
      services: new Set()
    };
    
    history.forEach(msg => {
      if (msg.metadata?.entities) {
        Object.entries(msg.metadata.entities).forEach(([type, values]) => {
          if (entities[type] && Array.isArray(values)) {
            values.forEach(v => entities[type].add(v));
          }
        });
      }
    });
    
    // Convertir Sets a Arrays
    return {
      dates: Array.from(entities.dates),
      times: Array.from(entities.times),
      emails: Array.from(entities.emails),
      names: Array.from(entities.names),
      services: Array.from(entities.services)
    };
  }

  /**
   * Detecta intención implícita basada en historial
   */
  detectImplicitIntent(history) {
    if (history.length === 0) return null;
    
    const lastMessages = history.slice(-3);
    const lastAssistantMessage = lastMessages.find(m => m.role === 'assistant');
    const lastUserMessages = lastMessages.filter(m => m.role === 'user');
    
    // Si el asistente preguntó por algo específico y el usuario respondió
    if (lastAssistantMessage && lastUserMessages.length > 0) {
      const assistantText = lastAssistantMessage.text.toLowerCase();
      const lastUserText = lastUserMessages[lastUserMessages.length - 1].text.toLowerCase();
      
      // Patrones de seguimiento
      if (assistantText.includes('hora') && lastUserText.match(/\d{1,2}/)) {
        return { intent: 'agenda.requestSlot', confidence: 0.9 };
      }
      
      if (assistantText.includes('día') && (lastUserText.includes('hoy') || lastUserText.includes('mañana'))) {
        return { intent: 'agenda.checkAvailability', confidence: 0.85 };
      }
      
      if (assistantText.includes('pagar') || assistantText.includes('bizum')) {
        return { intent: 'pagos.confirmPayment', confidence: 0.8 };
      }
    }
    
    return null;
  }

  /**
   * Limpia historial si es muy largo
   */
  async trimHistoryIfNeeded(sessionId) {
    try {
      const sessionRef = db.collection('ana_conversations').doc(sessionId);
      const session = await sessionRef.get();
      
      if (!session.exists) return;
      
      const data = session.data();
      if (data.messages?.length > this.maxHistoryLength * 1.5) {
        // Mantener solo los últimos N mensajes
        const trimmedMessages = data.messages.slice(-this.maxHistoryLength);
        await sessionRef.update({
          messages: trimmedMessages,
          'context.archived_summary': `Conversación anterior: ${data.messages.length - this.maxHistoryLength} mensajes`
        });
      }
    } catch (error) {
      console.error('🔥 [Memory] Error trimming history:', error);
    }
  }

  /**
   * Archiva sesión antigua
   */
  async archiveSession(sessionId, sessionData) {
    try {
      await db.collection('ana_conversations_archive').add({
        ...sessionData,
        archived_at: Timestamp.now(),
        original_session_id: sessionId
      });
      
      console.log(`📦 [Memory] Sesión archivada: ${sessionId}`);
    } catch (error) {
      console.error('🔥 [Memory] Error archiving session:', error);
    }
  }

  /**
   * Genera ID de sesión único
   * IMPORTANTE: Normaliza email/teléfono para que sea consistente entre canales
   */
  generateSessionId(clinicId, userIdentifier) {
    if (!userIdentifier || userIdentifier === 'unknown' || userIdentifier === 'anonymous') {
      return `${clinicId}_anonymous_${Date.now()}`;
    }
    
    // Normalizar email: convertir a lowercase y sanitizar
    let cleanId = String(userIdentifier).toLowerCase().trim();
    
    // Si es email, usar solo la parte antes del @ + dominio sin puntos
    if (cleanId.includes('@')) {
      const [local, domain] = cleanId.split('@');
      cleanId = `${local}_at_${domain.replace(/\./g, '_')}`;
    }
    
    // Si es teléfono, quitar espacios, guiones y paréntesis
    cleanId = cleanId.replace(/[\s\-\(\)]/g, '');
    
    // Sanitizar caracteres especiales restantes
    cleanId = cleanId.replace(/[^a-z0-9_]/g, '_').substring(0, 50);
    
    return `${clinicId}_${cleanId}`;
  }

  /**
   * Fallback si Firestore falla
   */
  createFallbackSession(clinicId, userIdentifier) {
    return {
      sessionId: `fallback_${Date.now()}`,
      isNew: true,
      history: [],
      context: {},
      metadata: {},
      isFallback: true
    };
  }

  /**
   * Calcula duración de sesión en horas
   */
  calculateSessionDuration(data) {
    const created = data.created_at?.toDate();
    const last = data.last_activity?.toDate();
    
    if (created && last) {
      return (last.getTime() - created.getTime()) / (1000 * 60 * 60);
    }
    return 0;
  }

  /**
   * Limpieza periódica de sesiones viejas
   */
  async cleanupOldSessions(maxAgeDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    try {
      const oldSessions = await db.collection('ana_conversations')
        .where('last_activity', '<', Timestamp.fromDate(cutoffDate))
        .limit(100)
        .get();
      
      const batch = db.batch();
      oldSessions.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`🧹 [Memory] Limpieza: ${oldSessions.docs.length} sesiones eliminadas`);
      
    } catch (error) {
      console.error('🔥 [Memory] Error en limpieza:', error);
    }
  }
}

// Instancia global
const memoryService = new ConversationMemoryService();

module.exports = {
  ConversationMemoryService,
  memoryService,
  
  // Métodos principales
  getOrCreateSession: (clinicId, userId, channel) => memoryService.getOrCreateSession(clinicId, userId, channel),
  addMessage: (sessionId, role, text, meta) => memoryService.addMessage(sessionId, role, text, meta),
  updateContext: (sessionId, context) => memoryService.updateContext(sessionId, context),
  getContextSummary: (sessionId) => memoryService.getContextSummary(sessionId),
  extractEntitiesFromHistory: (history) => memoryService.extractEntitiesFromHistory(history),
  detectImplicitIntent: (history) => memoryService.detectImplicitIntent(history)
};

// Importar FieldValue para operaciones
const { FieldValue } = require('../config/firebase');
