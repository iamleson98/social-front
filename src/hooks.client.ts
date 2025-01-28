import { handleErrorWithSentry, replayIntegration, init } from '@sentry/sveltekit';

// If you don't want to use Session Replay, remove the `Replay` integration,
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
init({
  dsn: 'https://97135dd542d05c29ae05f37d7a100db8@o390090.ingest.us.sentry.io/4508716359942144',
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [replayIntegration()]
});

export const handleError = handleErrorWithSentry();
