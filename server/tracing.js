const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { TraceIdRatioBasedSampler } = require('@opentelemetry/sdk-trace-base'); // <-- NEW
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

// Determine sampling rate (default to 10% in production to save costs/performance)
// Set OTEL_SAMPLING_RATE=1.0 for 100% sampling, or 0.1 for 10%.
const samplingRate = parseFloat(process.env.OTEL_SAMPLING_RATE || '0.1');

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'authentication-user-dashboard-app',
    // Use env var for version instead of npm_package_version
    [ATTR_SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '0.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),

  // -------- CRITICAL ADDITION: SAMPLING --------
  sampler: new TraceIdRatioBasedSampler(samplingRate),

  logExporter: new OTLPLogExporter({
    url: `${OTLP_ENDPOINT}/v1/logs`,
    timeoutMillis: 5000, // <-- NEW: Prevent hanging
  }),

  traceExporter: new OTLPTraceExporter({
    url: `${OTLP_ENDPOINT}/v1/traces`,
    timeoutMillis: 5000, // <-- NEW: Prevent hanging
  }),

  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${OTLP_ENDPOINT}/v1/metrics`,
      timeoutMillis: 5000, // <-- NEW: Prevent hanging
    }),
    exportIntervalMillis: 15000, // 15s 
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy, low-value instrumentations to save CPU
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

sdk.start();

// -------- IMPROVED GRACEFUL SHUTDOWN --------
function shutdownSDK() {
  console.log('Shutting down OpenTelemetry SDK...');
  // Force exit after 5 seconds even if shutdown hangs
  const timeout = setTimeout(() => {
    console.error('OpenTelemetry shutdown timed out, forcing exit.');
    process.exit(0);
  }, 5000);

  sdk.shutdown()
    .then(() => {
      console.log('OpenTelemetry SDK shut down cleanly');
      clearTimeout(timeout);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error shutting down OpenTelemetry SDK', err);
      clearTimeout(timeout);
      process.exit(1);
    });
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, shutdownSDK);
}

module.exports = sdk;