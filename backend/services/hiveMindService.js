const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');

/**
 * 🧠 HIVE MIND SERVICE - Mente Colmena de Ana
 * 
 * Ana aprende de TODAS las clínicas simultáneamente
 * y se vuelve exponencialmente más inteligente.
 */

class HiveMindService {
  constructor() {
    this.learningRate = 0.1; // Tasa de aprendizaje
    this.confidenceThreshold = 0.8; // Umbral de confianza
  }

  // 📚 REGISTRAR EXPERIENCIA DE TODAS LAS CLÍNICAS
  async registerCollectiveExperience(clinicId, experience) {
    try {
      const experienceData = {
        clinic_id: clinicId,
        type: experience.type, // 'problem_solved', 'patient_interaction', 'booking_pattern'
        context: experience.context,
        solution: experience.solution,
        outcome: experience.outcome, // 'success', 'failure', 'partial'
        confidence: experience.confidence || 0.5,
        timestamp: Timestamp.now(),
        impact_score: experience.impact_score || 1 // 1-10, qué tan útil fue esta experiencia
      };

      // Guardar en la mente colmena
      await db.collection('ana_hive_mind').add(experienceData);

      // Actualizar estadísticas de aprendizaje
      await this.updateLearningStats(experience.type, experience.outcome);

      console.log(`🧠 [HIVE] Experiencia registrada: ${experience.type} - ${experience.outcome}`);
      return { success: true };
    } catch (error) {
      console.error('🔥 [HIVE] Error registrando experiencia:', error);
      return { success: false, error: error.message };
    }
  }

  // 🎯 OBTENER SABIDURÍA COLECTIVA PARA UN PROBLEMA
  async getCollectiveWisdom(problemContext, clinicId) {
    try {
      // Buscar experiencias similares en TODAS las clínicas
      const similarExperiences = await db.collection('ana_hive_mind')
        .where('type', '==', 'problem_solved')
        .where('context', 'array-contains-any', [problemContext.keywords])
        .where('outcome', '==', 'success')
        .where('confidence', '>=', this.confidenceThreshold)
        .orderBy('impact_score', 'desc')
        .limit(10)
        .get();

      if (similarExperiences.empty) {
        return { wisdom: null, suggestions: [] };
      }

      // Analizar patrones y extraer sabiduría colectiva
      const wisdom = this.extractCollectiveWisdom(similarExperiences);
      
      console.log(`🧠 [HIVE] Sabiduría encontrada: ${wisdom.patterns.length} patrones`);
      return wisdom;
    } catch (error) {
      console.error('🔥 [HIVE] Error obteniendo sabiduría:', error);
      return { wisdom: null, suggestions: [] };
    }
  }

  // 📊 EXTRAER PATRONES COLECTIVOS
  extractCollectiveWisdom(experiences) {
    const patterns = {};
    const solutions = {};
    const clinics = new Set();

    experiences.docs.forEach(doc => {
      const exp = doc.data();
      clinics.add(exp.clinic_id);

      // Agrupar por patrones de contexto
      const contextKey = exp.context.join('_');
      if (!patterns[contextKey]) {
        patterns[contextKey] = {
          frequency: 0,
          success_rate: 0,
          best_solutions: [],
          avg_confidence: 0,
          clinics_involved: []
        };
      }

      patterns[contextKey].frequency++;
      patterns[contextKey].clinics_involved.push(exp.clinic_id);
      patterns[contextKey].avg_confidence += exp.confidence;

      if (exp.outcome === 'success') {
        patterns[contextKey].success_rate++;
        patterns[contextKey].best_solutions.push({
          solution: exp.solution,
          confidence: exp.confidence,
          impact_score: exp.impact_score,
          clinic_id: exp.clinic_id
        });
      }
    });

    // Calcular estadísticas
    Object.keys(patterns).forEach(key => {
      const pattern = patterns[key];
      pattern.success_rate = (pattern.success_rate / pattern.frequency) * 100;
      pattern.avg_confidence = pattern.avg_confidence / pattern.frequency;
      pattern.diversity_score = pattern.clinics_involved.length / experiences.docs.length;
    });

    return {
      patterns,
      total_clinics: clinics.size,
      total_experiences: experiences.docs.length,
      collective_confidence: this.calculateCollectiveConfidence(patterns)
    };
  }

  // 🎯 PREDICCIÓN BASADA EN APRENDIZAJE COLECTIVO
  async predictOptimalAction(context, clinicId) {
    try {
      // Buscar patrones similares en el colectivo
      const wisdom = await this.getCollectiveWisdom(context, clinicId);
      
      if (!wisdom.wisdom) {
        return { prediction: null, confidence: 0 };
      }

      // Encontrar el patrón más relevante
      const bestPattern = Object.values(wisdom.wisdom.patterns)
        .sort((a, b) => (b.success_rate * b.avg_confidence) - (a.success_rate * a.avg_confidence))[0];

      if (!bestPattern || bestPattern.success_rate < 70) {
        return { prediction: null, confidence: 0 };
      }

      // Seleccionar la mejor solución del patrón
      const bestSolution = bestPattern.best_solutions
        .sort((a, b) => (b.confidence * b.impact_score) - (a.confidence * a.impact_score))[0];

      return {
        prediction: bestSolution.solution,
        confidence: bestSolution.confidence * (bestPattern.success_rate / 100),
        pattern_info: {
          success_rate: bestPattern.success_rate,
          diversity_score: bestPattern.diversity_score,
          clinics_involved: bestPattern.clinics_involved.length
        }
      };
    } catch (error) {
      console.error('🔥 [HIVE] Error en predicción:', error);
      return { prediction: null, confidence: 0 };
    }
  }

  // 📈 ACTUALIZAR ESTADÍSTICAS DE APRENDIZAJE
  async updateLearningStats(experienceType, outcome) {
    const statsRef = db.collection('ana_learning_stats').doc('collective_stats');
    
    await statsRef.set({
      total_experiences: FieldValue.increment(1),
      [`${experienceType}_total`]: FieldValue.increment(1),
      [`${experienceType}_${outcome}`]: FieldValue.increment(1),
      last_updated: Timestamp.now()
    }, { merge: true });
  }

  // 🎯 CALCULAR CONFIANZA COLECTIVA
  calculateCollectiveConfidence(patterns) {
    const totalPatterns = Object.keys(patterns).length;
    if (totalPatterns === 0) return 0;

    const avgSuccessRate = Object.values(patterns)
      .reduce((sum, pattern) => sum + pattern.success_rate, 0) / totalPatterns;
    
    const avgDiversity = Object.values(patterns)
      .reduce((sum, pattern) => sum + pattern.diversity_score, 0) / totalPatterns;

    return (avgSuccessRate * avgDiversity) / 100;
  }

  // 🚀 AUTO-MEJORA CONTINUA
  async continuousImprovement() {
    try {
      // Analizar experiencias recientes y ajustar parámetros
      const recentExperiences = await db.collection('ana_hive_mind')
        .where('timestamp', '>=', Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))) // Última semana
        .get();

      if (recentExperiences.empty) return;

      // Ajustar tasa de aprendizaje basada en éxito
      const successRate = recentExperiences.docs
        .filter(doc => doc.data().outcome === 'success').length / recentExperiences.docs.length;

      if (successRate > 0.8) {
        this.learningRate = Math.min(this.learningRate * 1.1, 0.3); // Aumentar aprendizaje
      } else if (successRate < 0.6) {
        this.learningRate = Math.max(this.learningRate * 0.9, 0.05); // Reducir aprendizaje
      }

      console.log(`🧠 [HIVE] Auto-mejora: tasa de aprendizaje ajustada a ${this.learningRate}`);
    } catch (error) {
      console.error('🔥 [HIVE] Error en auto-mejora:', error);
    }
  }

  // 🎯 OBTENER INSIGHTS COLECTIVOS
  async getCollectiveInsights() {
    try {
      const insights = await db.collection('ana_hive_mind')
        .aggregate([
          { $group: { 
            _id: '$type', 
            count: { $sum: 1 },
            success_rate: { 
              $avg: { $cond: [{ $eq: ['$outcome', 'success'] }, 1, 0] }
            }
          }},
          { $sort: { count: -1 } }
        ]);

      return insights;
    } catch (error) {
      console.error('🔥 [HIVE] Error obteniendo insights:', error);
      return [];
    }
  }
}

// Instancia global del Hive Mind
const hiveMindService = new HiveMindService();

module.exports = {
  hiveMindService,
  registerCollectiveExperience: (clinicId, experience) => hiveMindService.registerCollectiveExperience(clinicId, experience),
  getCollectiveWisdom: (context, clinicId) => hiveMindService.getCollectiveWisdom(context, clinicId),
  predictOptimalAction: (context, clinicId) => hiveMindService.predictOptimalAction(context, clinicId),
  continuousImprovement: () => hiveMindService.continuousImprovement(),
  getCollectiveInsights: () => hiveMindService.getCollectiveInsights()
};
