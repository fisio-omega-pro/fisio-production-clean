'use client'
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Target, Zap, Activity, BarChart3, Lightbulb } from 'lucide-react';

interface HiveMindStats {
  totalExperiences: number;
  successRate: number;
  clinicsContributing: number;
  collectiveConfidence: number;
  topPatterns: Array<{
    pattern: string;
    frequency: number;
    successRate: number;
    diversityScore: number;
  }>;
  recentInsights: Array<{
    type: string;
    solution: string;
    confidence: number;
    timestamp: string;
  }>;
}

export default function HiveMindView() {
  const [stats, setStats] = useState<HiveMindStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    loadHiveMindStats();
  }, []);

  const loadHiveMindStats = async () => {
    try {
      setLoading(true);
      // Simular datos - en producción vendría del backend
      const mockStats: HiveMindStats = {
        totalExperiences: 15420,
        successRate: 87.3,
        clinicsContributing: 1247,
        collectiveConfidence: 92.1,
        topPatterns: [
          { pattern: 'paciente_recuperacion_osteo', frequency: 3420, successRate: 94.2, diversityScore: 0.78 },
          { pattern: 'prospeccion_clinica_pequeña', frequency: 2890, successRate: 89.1, diversityScore: 0.82 },
          { pattern: 'gestion_cita_urgente', frequency: 2156, successRate: 91.7, diversityScore: 0.75 },
          { pattern: 'paciente_primera_vez', frequency: 1876, successRate: 86.4, diversityScore: 0.88 },
          { pattern: 'seguimiento_post_tratamiento', frequency: 1234, successRate: 93.8, diversityScore: 0.71 }
        ],
        recentInsights: [
          { type: 'booking_optimization', solution: 'Ofecer cita 15min antes para reducir cancelaciones', confidence: 94.2, timestamp: '2024-03-03T09:15:00Z' },
          { type: 'patient_retention', solution: 'Mensaje follow-up 24h después del tratamiento', confidence: 91.8, timestamp: '2024-03-03T08:45:00Z' },
          { type: 'prospecting_angle', solution: 'Enfocar en "tiempo ahorrado" para clínicas >3 fisios', confidence: 89.3, timestamp: '2024-03-03T08:30:00Z' },
          { type: 'pricing_strategy', solution: 'Bonos de 5 sesiones con 10% descuento para pacientes recurrentes', confidence: 87.6, timestamp: '2024-03-03T08:15:00Z' }
        ]
      };
      
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading Hive Mind stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
          <span className="text-gray-400">Conectando con la mente colmena...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No se pudo conectar con la mente colmena</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/20">
          <Brain className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Mente Colmena</h2>
          <p className="text-gray-400 text-sm">Inteligencia colectiva de Ana aprendiendo de todas las clínicas</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-gray-400 text-sm">Experiencias Totales</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalExperiences.toLocaleString()}</div>
          <div className="text-xs text-green-400 mt-1">+12% esta semana</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Tasa de Éxito</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.successRate}%</div>
          <div className="text-xs text-green-400 mt-1">+2.3% este mes</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-gray-400 text-sm">Clínicas Contribuyendo</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.clinicsContributing.toLocaleString()}</div>
          <div className="text-xs text-purple-400 mt-1">+23 nuevas</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-gray-400 text-sm">Confianza Colectiva</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.collectiveConfidence}%</div>
          <div className="text-xs text-amber-400 mt-1">Máximo histórico</div>
        </div>
      </div>

      {/* Top Patterns */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-black text-white">Patrones Colectivos Más Exitosos</h3>
        </div>
        
        <div className="space-y-4">
          {stats.topPatterns.map((pattern, index) => (
            <div 
              key={pattern.pattern}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-blue-500/20 transition-all cursor-pointer"
              onClick={() => setSelectedPattern(pattern.pattern)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-500 font-black text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{pattern.pattern.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-gray-400 text-sm">{pattern.frequency} aplicaciones</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-black">{pattern.successRate}%</div>
                  <div className="text-gray-400 text-xs">éxito</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${pattern.successRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Diversidad: {Math.round(pattern.diversityScore * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-black text-white">Insights Colectivos Recientes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.recentInsights.map((insight, index) => (
            <div key={index} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{insight.type.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-xs text-amber-400">{insight.confidence}% confianza</span>
              </div>
              <p className="text-white text-sm mb-2">{insight.solution}</p>
              <div className="text-xs text-gray-400">
                {new Date(insight.timestamp).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPattern(null)}
        >
          <div 
            className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-white mb-4">
              {selectedPattern.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <div className="text-gray-300 mb-6">
              <p>Este patrón ha sido aplicado exitosamente por múltiples clínicas y está siendo aprendido continuamente por la mente colmena de Ana.</p>
              <p className="mt-2">La inteligencia colectiva permite que cada nueva experiencia mejore las respuestas futuras para todas las clínicas.</p>
            </div>
            <button
              onClick={() => setSelectedPattern(null)}
              className="w-full bg-blue-500 text-white rounded-xl py-3 font-bold hover:bg-blue-600 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
