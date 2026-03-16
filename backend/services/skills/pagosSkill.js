/**
 * 💳 PAGOS SKILL - Experto en Fianzas y Métodos de Pago
 * 
 * Capacidades:
 * - Explicar proceso de fianza
 * - Proporcionar datos de pago (Bizum, tarjeta)
 * - Generar enlaces de pago Stripe
 * - Resolver dudas sobre precios
 * - Confirmar recepción de pagos
 */

const { Skill } = require('../anaSkillEngine');
const { db } = require('../../config/firebase');

class PagosSkill extends Skill {
  constructor() {
    super('pagos', 'Gestión de Pagos', 'Experto en fianzas y cobros');

    // Intents
    this.addIntent('queryPrice', [
      'cuánto cuesta', 'precio', 'tarifa', 'vale', 'cuánto es',
      'qué precio tiene', 'tarifas', 'honorarios'
    ], 0.9);

    this.addIntent('explainDeposit', [
      'fianza', 'cómo pago', 'para confirmar', 'señal', 'depósito',
      'cómo funciona el pago', 'explicame el proceso', 'pasos para reservar'
    ], 0.85);

    this.addIntent('paymentMethods', [
      'bizum', 'tarjeta', 'cómo pago', 'metodos de pago', 'formas de pago',
      'puedo pagar con', 'pago con', 'transferencia'
    ], 0.85);

    this.addIntent('confirmPayment', [
      'ya pagué', 'envié bizum', 'he pagado', 'justificante', 'captura',
      'confirmación de pago', 'transferencia hecha', 'ya hice el pago'
    ], 0.9);

    this.addIntent('paymentIssue', [
      'no me funciona', 'error al pagar', 'problema con pago', 'falló',
      'no puedo pagar', 'se rechazó', 'denegado'
    ], 0.8);

    // Templates
    this.addResponse('queryPrice', 
      'La sesión cuesta {{precio}}€. Para reservar, pagas fianza de {{fianza}}€ que se descuenta del total.'
    );
    
    this.addResponse('explainDeposit',
      '📋 **Proceso:**\n1️⃣ Eliges hora\n2️⃣ Pagas fianza {{fianza}}€\n3️⃣ Envías justificante\n4️⃣ Cita confirmada ✅\n\nLa fianza se descuenta de los {{precio}}€ de la sesión.'
    );
    
    this.addResponse('paymentMethods',
      '💳 **Opciones:**\n📱 Bizum: {{telefono}}\n💳 Tarjeta: enlace seguro\n🏦 Transferencia: te doy IBAN\n\n¿Cuál prefieres?'
    );
    
    this.addResponse('confirmPayment',
      '✅ Recibido. Verificando...\n\nTu cita quedará confirmada en unos minutos. Te aviso por aquí.'
    );
    
    this.addResponse('paymentIssue',
      'Entiendo. Prueba con otro método:\n📱 Bizum directo: {{telefono}}\n💳 Te envío enlace alternativo\n\n¿O prefieres transferencia?'
    );
  }

  async execute(intentId, message, context, entities) {
    const clinicId = context.clinicId;
    const clinicName = context.clinicName || 'la clínica';
    
    try {
      const config = await this.getClinicConfig(clinicId);
      
      switch (intentId) {
        case 'queryPrice':
          return this.handleQueryPrice(config, clinicName);
        
        case 'explainDeposit':
          return this.handleExplainDeposit(config, clinicName);
        
        case 'paymentMethods':
          return this.handlePaymentMethods(config, clinicName);
        
        case 'confirmPayment':
          return this.handleConfirmPayment(clinicId, message, context, clinicName);
        
        case 'paymentIssue':
          return this.handlePaymentIssue(config, clinicName);
        
        default:
          return this.fallbackResponse(config, clinicName);
      }
    } catch (error) {
      console.error('🔥 [PagosSkill] Error:', error);
      return {
        text: 'Disculpa, tuve un problema con los pagos. ¿Puedes intentar de nuevo?',
        type: 'error',
        success: false
      };
    }
  }

  handleQueryPrice(config, clinicName) {
    const precio = config.precio_sesion || 50;
    const fianza = config.fianza_cita || 20;
    
    return {
      text: `Sesión: ${precio}€. Fianza para reservar: ${fianza}€ (se descuenta del total).\n\n¿Quieres saber cómo pagar?`,
      type: 'price_info',
      success: true,
      data: { precio, fianza }
    };
  }

  handleExplainDeposit(config, clinicName) {
    const precio = config.precio_sesion || 50;
    const fianza = config.fianza_cita || 20;
    
    return {
      text: `📋 **Reserva en 3 pasos:**\n\n1️⃣ Confirmas hora conmigo\n2️⃣ Pagas fianza ${fianza}€ (Bizum/tarjeta)\n3️⃣ Envías captura del pago\n\n✅ Fianza se descuenta de los ${precio}€\n✅ Cita 100% garantizada\n\n¿Te reservo hora?`,
      type: 'deposit_explained',
      success: true,
      data: { precio, fianza, steps: 3 }
    };
  }

  handlePaymentMethods(config, clinicName) {
    const telefono = config.telefono || config.phone || '[consultar teléfono]';
    const fianza = config.fianza_cita || 20;
    const metodos = config.metodos_pago || ['tarjeta', 'bizum'];
    
    let opciones = '';
    if (metodos.includes('bizum')) {
      opciones += `📱 **Bizum:** ${fianza}€ al ${telefono}\n`;
    }
    if (metodos.includes('tarjeta')) {
      opciones += `💳 **Tarjeta:** te envío enlace seguro\n`;
    }
    if (metodos.includes('transferencia')) {
      opciones += `🏦 **Transferencia:** te doy IBAN\n`;
    }
    
    return {
      text: `${opciones}\n¿Cuál prefieres usar?`,
      type: 'payment_methods',
      success: true,
      data: { metodos, telefono, fianza }
    };
  }

  async handleConfirmPayment(clinicId, message, context, clinicName) {
    const userEmail = context.userEmail || entities.emails?.[0];
    
    // Guardar notificación de pago recibido
    try {
      await db.collection('clinicas').doc(clinicId)
        .collection('notificaciones_pagos').add({
          message_preview: message.substring(0, 200),
          user_email: userEmail || null,
          status: 'pending_verification',
          created_at: new Date(),
          source: 'ana_chat'
        });
    } catch (e) {
      console.error('Error saving payment notification:', e);
    }
    
    return {
      text: `✅ **Pago recibido**\n\nVerificando con ${clinicName}...\nTe confirmo la cita en unos minutos.\n\n📱 Guarda este chat para recordatorios.`,
      type: 'payment_received',
      success: true,
      requiresVerification: true
    };
  }

  handlePaymentIssue(config, clinicName) {
    const telefono = config.telefono || '[consultar]';
    
    return {
      text: `Sin problema. Alternativas:\n\n📱 **Bizum directo:** ${telefono}\n🏦 **Transferencia:** te paso IBAN\n💵 **En clínica:** pagas al llegar\n\n¿Cuál te va mejor?`,
      type: 'payment_alternatives',
      success: true
    };
  }

  fallbackResponse(config, clinicName) {
    const fianza = config.fianza_cita || 20;
    
    return {
      text: `Gestiono pagos en ${clinicName}. Fianza: ${fianza}€ para reservar.\n\n¿Necesitas datos para pagar?`,
      type: 'pagos_fallback',
      success: true
    };
  }

  async getClinicConfig(clinicId) {
    try {
      const doc = await db.collection('clinicas').doc(clinicId).get();
      return doc.exists ? doc.data() : {};
    } catch (e) {
      return {};
    }
  }
}

module.exports = { PagosSkill };
