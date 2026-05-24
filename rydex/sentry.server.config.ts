import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ab78ac9d9d81b37821ee03b7286b551d@o4511445346222080.ingest.us.sentry.io/4511445349629952",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
  
});
