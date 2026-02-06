// Producción: usar siempre HTTPS. Vercel y Cloud Run lo proveen por defecto.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://fisio-backend-omega-740657183492.europe-west1.run.app';

