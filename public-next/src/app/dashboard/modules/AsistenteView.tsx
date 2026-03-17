'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Trash2, Sparkles, Scale } from 'lucide-react';
import { dashboardAPI } from '../services';

const STORAGE_KEY = 'ana_dashboard_chat_v1';
const MAX_CHARS = 1000;
const WELCOME_ANA = 'Hola, soy Ana. Tengo acceso al estado real de tu clínica ahora mismo. Puedo decirte cuántos pacientes tienes, qué citas hay hoy, si Stripe está conectado y cómo sacar partido a cada módulo. ¿Por dónde empezamos?';
const WELCOME_LEX = 'Hola, soy Lex, asesor jurídico especializado en clínicas de fisioterapia en España. Puedo ayudarte con IVA, IRPF, RGPD, contratos, trimestres fiscales y cualquier duda legal relacionada con tu clínica. ¿Qué consulta tienes?';

const SUGGESTIONS_ANA = [
  '¿Cuántos pacientes tengo y cuál es el estado de mi clínica?',
  '¿Cómo activo la campaña de reactivación de inactivos?',
  '¿Cómo importo mis pacientes desde Excel o CSV?',
  '¿Cómo conecto Stripe para cobrar fianzas automáticas?',
];
const SUGGESTIONS_LEX = [
  '¿Las sesiones de fisioterapia están exentas de IVA?',
  '¿Qué modelos fiscales debo presentar como autónomo?',
  '¿Qué obligaciones RGPD tengo con los historiales clínicos?',
  '¿Me conviene más ser autónomo o crear una SL?',
];

type Msg = { role: 'user' | 'ana'; text: string; ts: number };

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet point
    const isBullet = /^[-•·]\s/.test(line.trim());
    const isNumbered = /^\d+\.\s/.test(line.trim());
    const content = <span dangerouslySetInnerHTML={{ __html: boldLine }} />;
    if (isBullet) return <div key={i} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">·</span><span>{content}</span></div>;
    if (isNumbered) return <div key={i} className="flex gap-2 items-start"><span className="text-blue-400 font-bold min-w-[1.2rem]">{line.trim().match(/^\d+/)?.[0]}.</span><span>{content}</span></div>;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <div key={i}>{content}</div>;
  });
};

const loadFromStorage = (): Msg[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [{ role: 'ana', text: WELCOME_ANA, ts: Date.now() }];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ role: 'ana', text: WELCOME_ANA, ts: Date.now() }];
  } catch { return [{ role: 'ana', text: WELCOME_ANA, ts: Date.now() }]; }
};

export const AsistenteView = () => {
  const [mode, setMode] = useState<'ana' | 'lex'>('ana');
  const [messages, setMessages] = useState<Msg[]>(loadFromStorage);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { }
  }, [messages]);

  const buildHistory = useCallback((msgs: Msg[]) =>
    msgs
      .filter(m => m.role === 'user' || m.role === 'ana')
      .map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.text.slice(0, 500) }))
      .slice(-12),
    []
  );

  const switchMode = useCallback((newMode: 'ana' | 'lex') => {
    if (newMode === mode) return;
    setMode(newMode);
    setError(null);
    const welcome = newMode === 'lex' ? WELCOME_LEX : WELCOME_ANA;
    const fresh: Msg[] = [{ role: 'ana', text: welcome, ts: Date.now() }];
    setMessages(fresh);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { }
  }, [mode]);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (text.length > MAX_CHARS) return;

    const newMsg: Msg = { role: 'user', text, ts: Date.now() };
    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = mode === 'lex' ? [] : buildHistory(messages);
      const data = mode === 'lex'
        ? await dashboardAPI.sendChatMessage(text, [], 'lex')
        : await dashboardAPI.sendChatMessage(text, history);
      setMessages(prev => [...prev, { role: 'ana', text: data.reply || 'No pude generar respuesta.', ts: Date.now() }]);
    } catch (e: any) {
      const errMsg = String(e?.message || '').toLowerCase();
      if (errMsg.includes('401')) {
        setError('Sesión expirada. Recarga la página.');
      } else if (errMsg.includes('429')) {
        setError('Demasiadas peticiones. Espera un momento.');
      } else {
        setError('Error de conexión con Ana. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, messages, mode, buildHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = () => {
    const welcome = mode === 'lex' ? WELCOME_LEX : WELCOME_ANA;
    const fresh: Msg[] = [{ role: 'ana', text: welcome, ts: Date.now() }];
    setMessages(fresh);
    setError(null);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { }
  };

  const showSuggestions = messages.length <= 1 && !loading;
  const SUGGESTIONS = mode === 'lex' ? SUGGESTIONS_LEX : SUGGESTIONS_ANA;
  const charsLeft = MAX_CHARS - input.length;

  return (
    <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mode === 'lex' ? 'bg-amber-600' : 'bg-blue-600'}`}>
            {mode === 'lex' ? <Scale size={17} color="#fff" /> : <Bot size={17} color="#fff" />}
          </div>
          <div>
            <span className="text-xs font-black text-white uppercase tracking-widest">{mode === 'lex' ? 'Lex · Asesor Legal' : 'Consultoría Ana'}</span>
            <p className="text-[10px] text-gray-500 mt-0.5">{mode === 'lex' ? 'IVA, IRPF, RGPD, contratos y fiscalidad para tu clínica.' : 'Pregúntame sobre tu clínica, tus datos reales o cómo usar cualquier módulo.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Ana / Lex */}
          <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => switchMode('ana')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'ana' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Bot size={10} className="inline mr-1" />Ana
            </button>
            <button onClick={() => switchMode('lex')} className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'lex' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Scale size={10} className="inline mr-1" />Lex
            </button>
          </div>
          {messages.length > 1 && (
            <button onClick={handleClear} title="Limpiar conversación" className="text-gray-600 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'ana' ? 'justify-start' : 'justify-end'}`}>
            {m.role === 'ana' && (
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2 mt-1 shrink-0 ${mode === 'lex' ? 'bg-amber-600/20' : 'bg-blue-600/20'}`}>
                {mode === 'lex' ? <Scale size={12} className="text-amber-400" /> : <Bot size={12} className="text-blue-400" />}
              </div>
            )}
            <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed space-y-0.5 ${
              m.role === 'ana'
                ? mode === 'lex' ? 'bg-amber-500/10 text-gray-200 rounded-tl-sm border border-amber-500/20' : 'bg-white/[0.04] text-gray-200 rounded-tl-sm border border-white/5'
                : 'bg-blue-600 text-white rounded-tr-sm'
            }`}>
              {m.role === 'ana' ? renderMarkdown(m.text) : <span>{m.text}</span>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 pl-8">
            <div className="flex gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'lex' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'lex' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${mode === 'lex' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ animationDelay: '300ms' }} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${mode === 'lex' ? 'text-amber-500' : 'text-blue-500'}`}>{mode === 'lex' ? 'Lex consultando…' : 'Ana pensando…'}</span>
          </div>
        )}

        {error && (
          <div className="mx-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 font-bold">✕</button>
          </div>
        )}

        {/* Sugerencias iniciales */}
        {showSuggestions && (
          <div className="pt-2 pl-8">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              <Sparkles size={10} /> Preguntas frecuentes
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-[11px] px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-gray-300 hover:bg-blue-600/20 hover:border-blue-500/30 hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white/[0.01] border-t border-white/5">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter nueva línea)"
              rows={1}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none focus:border-blue-500/50 transition leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              disabled={loading}
            />
            {input.length > MAX_CHARS * 0.8 && (
              <span className={`absolute bottom-2 right-3 text-[10px] font-mono ${charsLeft < 50 ? 'text-red-400' : 'text-gray-600'}`}>
                {charsLeft}
              </span>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || input.length > MAX_CHARS}
            className="bg-blue-600 p-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
