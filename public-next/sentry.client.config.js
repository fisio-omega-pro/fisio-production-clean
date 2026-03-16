import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
