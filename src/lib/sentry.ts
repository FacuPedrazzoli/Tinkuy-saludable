import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry] Event captured:', event);
      return null;
    }
    return event;
  },
});

export const captureException = (
  error: Error,
  context?: Record<string, unknown>
) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (
  message: string,
  level?: Sentry.SeverityLevel
) => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: {
  id?: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

export default Sentry;