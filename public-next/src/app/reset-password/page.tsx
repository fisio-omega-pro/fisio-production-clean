import { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#030507', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
