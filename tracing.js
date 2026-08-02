const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'authentication-user-dashboard-app',
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),

  logExporter: new OTLPLogExporter({ url: `${OTLP_ENDPOINT}/v1/logs` }),

  traceExporter: new OTLPTraceExporter({ url: `${OTLP_ENDPOINT}/v1/traces` }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: `${OTLP_ENDPOINT}/v1/metrics` }),
    exportIntervalMillis: 15000,
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // noisy, low value
    }),
  ],
});

sdk.start();

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down cleanly'))
      .catch((err) => console.error('Error shutting down OpenTelemetry SDK', err))
      .finally(() => process.exit(0));
  });
}

module.exports = sdk;