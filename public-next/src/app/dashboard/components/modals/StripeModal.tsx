'use client'
import React, { useState } from 'react';
import { CreditCard, Loader2, Shield, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton } from '../Atoms';
import { dashboardAPI } from '../../services';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  configStatus: any;
  userEmail?: string;
}

export const StripeModal = ({ isOpen, onClose, clinicId, configStatus }: StripeModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectStripe = async () => {
    if (!clinicId?.trim()) {
      setError('No se encontró el ID de la clínica. Recarga la página.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const url = await dashboardAPI.connectStripe();
      if (url) {
        window.location.href = url;
      } else {
        setError('Stripe no devolvió una URL de conexión. Inténtalo de nuevo.');
      }
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('403')) {
        setError('Solo el propietario puede conectar Stripe.');
      } else if (msg.includes('signed up for Connect') || msg.includes('Connect')) {
        setError('Tu cuenta Stripe necesita activar "Connect". Ve a dashboard.stripe.com → Connect y actívalo, luego vuelve a intentar.');
      } else if (msg.includes('503')) {
        setError('Stripe no está configurado en el servidor. Contacta con soporte: ayuda@fisiotool.com');
      } else {
        setError(msg || 'Error al conectar con Stripe. Inténtalo de nuevo.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conectar Cuenta Bancaria">
      <div className="flex flex-col gap-6 py-4 font-sans">

        <div className="bg-green-600/5 p-4 rounded-2xl border border-green-500/20 flex gap-4 items-center">
          <Shield size={24} className="text-green-500 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <strong>Stripe</strong> es la plataforma de pagos más segura del mundo.<br />
            Permite a tus clientes pagar con tarjeta, Bizum y transferencia.<br />
            Tú recibes el dinero directamente en tu cuenta bancaria.
          </p>
        </div>

        {configStatus?.hasStripe ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">¡Cuenta Conectada!</h3>
            <p className="text-green-300 text-sm mb-4">
              Tu cuenta Stripe está activa y lista para procesar pagos.
            </p>
            <ActionButton
              onClick={onClose}
              style={{ background: '#10b981', color: '#fff' }}
            >
              Cerrar
            </ActionButton>
          </div>
        ) : (
          <>
            <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={16} />
                ¿Qué podrás hacer con Stripe?
              </h4>
              <ul className="text-[10px] text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Cobrar citas y bonos automáticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Generar enlaces de pago para tu asistente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Aceptar Bizum, tarjeta y transferencia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Recibir dinero en 24-48h en tu cuenta</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-300 leading-relaxed">
                <strong>Proceso de conexión:</strong><br />
                1. Serás redirigido a Stripe (seguro)<br />
                2. Crea tu cuenta o inicia sesión<br />
                3. Vincula tu cuenta bancaria<br />
                4. Vuelve automáticamente aquí
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <ActionButton
              onClick={handleConnectStripe}
              disabled={isConnecting}
              style={{ background: '#6366f1', color: '#fff' }}
              className="w-full py-4"
            >
              {isConnecting ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  <span>Conectando con Stripe...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <ExternalLink size={20} />
                  <span>Conectar Cuenta Stripe</span>
                </div>
              )}
            </ActionButton>
          </>
        )}

      </div>
    </Modal>
  );
};
