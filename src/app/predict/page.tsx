import { DirectDebitPredictorForm } from '@/components/DirectDebitPredictorForm';

export default function PredictPage() {
  return (
    <div className="min-h-dvh bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-4">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            XGBoost · Predicción de Domiciliación
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Predictor de Domiciliación Bancaria
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Ingresa los datos del contrato para predecir si el cliente adoptará
            la domiciliación bancaria.
          </p>
        </div>

        <DirectDebitPredictorForm
          apiEndpoint={`${process.env.NEXT_PUBLIC_PREDICT_API_URL ?? ''}/api/predict`}
        />
      </div>
    </div>
  );
}
