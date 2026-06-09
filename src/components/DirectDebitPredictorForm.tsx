'use client';

import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  Customer_segment: string;
  Line_of_business: string;
  Product_type: string;
  Annual_premium: string;
  Payment_frequency: string;
  Customer_age: string;
  Customer_type: string;
  Customer_region: string;
  Customer_province: string;
  Broker_region: string;
  Broker_province: string;
  Broker_cor: string;
  Customer_urbanization: string;
  Broker_urbanization: string;
}

interface PredictionResult {
  prediction: number;
  probability: number;
  is_direct_debit: boolean;
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface TextInputProps {
  name: keyof FormState;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({ name, label, placeholder, type = 'text', value, onChange }: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} <span className="text-blue-600" aria-hidden="true">*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-text"
      />
    </div>
  );
}

interface SelectInputProps {
  name: keyof FormState;
  label: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function SelectInput({ name, label, options, value, onChange }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label} <span className="text-blue-600" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="">Seleccionar…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Option data ──────────────────────────────────────────────────────────────

const SEGMENTS = ['Midcorp', 'Retail', 'SME'];

const LINES_OF_BUSINESS = [
  'A - Motor', 'D - Property', 'E - Liability',
  'I - Property', 'N - Accident', 'P - Liability', 'R - Engineering',
];

const PRODUCT_TYPES = [
  'A01 - TA/PRIVE', 'A02 - TA/PROF.', 'A03 - <= 3,5 T', 'A04 - > 3,5 T',
  'A05 - CYCLO', 'A06 - MOTO', 'A07 - MARCHAND', 'A08 - TRPT AGR',
  'A09 - TAXI/LOC', 'A10 - BUS-CAR', 'A11 - > 12 T', 'A15 - FLOTTE',
  'D01 - RISQ IND', 'E01 - RC OBJ.', 'E04 - RC ENTR.', 'E06 - Liabilit',
  'E16 - Liabilit', 'E30 - RC PROF.', 'E31 - D&O Plan', 'E32 - Cyber Pl',
  'I01 - HABITAT.', 'I02 - COMM.ART', 'I03 - HORECA', 'I04 - AGRICOLE',
  'I05 - BUILDING', 'I08 - BUR/PROF', 'I11 - HP Xpert', 'I12 - Commerce',
  'I13 - Horeca', 'I18 - Bureaux', 'I22 - BIZ PLAN', 'I23 - BIZ PLAN',
  'I28 - BIZ PLAN', 'I72 - BIZ PLAN', 'I73 - BIZ PLAN', 'I82 - Biz Solu',
  'I83 - Biz Sol.', 'I98 - DIVERS', 'N01 - COMPLETE', 'N02 - IND JEUN',
  'N05 - IND CIRC', 'N06 - IND PRIV', 'N07 - IND.COLL', 'P01 - FAMILY P',
  'P02 - RC MED.D', 'P03 - RC PARAM', 'P06 - RC ENSGN', 'P11 - RC GARDE',
  'P13 - RC ORG.C', 'P14 - RC GRD.C', 'P16 - ASSOC.&G', 'P17 - RC ECOLE',
  'P19 - RC MADIV', 'P20 - RC BATO', 'P24 - RC CPARA', 'P98 - RC DIVER',
  'R01 - BRIS MAC', 'R03 - MONT.ESS', 'R04 - RSQ CHAN', 'R07 - RESTART', 'R10 -',
];

const PAYMENT_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-annually', 'Annually'];

const CUSTOMER_AGE_BUCKETS = [
  'A = 18-24', 'B = 25-29', 'C = 30-39', 'D = 40-69', 'S = +69', 'No age',
];

const CUSTOMER_TYPES = ['Enterprise', 'Physical person'];

const REGIONS = ['BRU', 'FLA', 'WAL'];

const CUSTOMER_PROVINCES = ['BRU', 'VAN', 'VBR', 'VLI', 'VOV', 'VWV', 'WBR', 'WHT', 'WLG', 'WNA'];

const BROKER_PROVINCES = ['BRU', 'PTS', 'VAN', 'VBR', 'VLI', 'VOV', 'VWV', 'WBR', 'WHT', 'WLG', 'WNA'];

const URBANIZATION = ['Urban', 'Rural'];

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_FORM: FormState = {
  Customer_segment: '',
  Line_of_business: '',
  Product_type: '',
  Annual_premium: '',
  Payment_frequency: '',
  Customer_age: '',
  Customer_type: '',
  Customer_region: '',
  Customer_province: '',
  Broker_region: '',
  Broker_province: '',
  Broker_cor: '',
  Customer_urbanization: '',
  Broker_urbanization: '',
};

// ── Main component ───────────────────────────────────────────────────────────

export interface DirectDebitPredictorFormProps {
  /** Override the prediction endpoint. Defaults to '/api/predict'. */
  apiEndpoint?: string;
}

export function DirectDebitPredictorForm({
  apiEndpoint = '/api/predict',
}: DirectDebitPredictorFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleText(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          Annual_premium: parseFloat(form.Annual_premium),
          // Customer_age is categorical ('D = 40-69', etc.) — sent as string
          Broker_cor: parseFloat(form.Broker_cor),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error en la predicción. Verifica el servidor.');
        return;
      }

      setResult(data as PredictionResult);
    } catch {
      setError('Error de red — ¿está disponible la API?');
    } finally {
      setLoading(false);
    }
  }

  const pct = result ? Math.round(result.probability * 100) : 0;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── Información de la Póliza ── */}
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Información de la Póliza
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              name="Customer_segment"
              label="Segmento del Cliente"
              options={SEGMENTS}
              value={form.Customer_segment}
              onChange={handleSelect}
            />
            <SelectInput
              name="Line_of_business"
              label="Ramo"
              options={LINES_OF_BUSINESS}
              value={form.Line_of_business}
              onChange={handleSelect}
            />
            <div className="sm:col-span-2">
              <SelectInput
                name="Product_type"
                label="Tipo de Producto"
                options={PRODUCT_TYPES}
                value={form.Product_type}
                onChange={handleSelect}
              />
            </div>
            <TextInput
              name="Annual_premium"
              label="Prima Anual (€)"
              placeholder="ej. 283"
              type="number"
              value={form.Annual_premium}
              onChange={handleText}
            />
            <SelectInput
              name="Payment_frequency"
              label="Frecuencia de Pago"
              options={PAYMENT_FREQUENCIES}
              value={form.Payment_frequency}
              onChange={handleSelect}
            />
          </div>
        </section>

        {/* ── Información del Cliente ── */}
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              name="Customer_age"
              label="Edad"
              options={CUSTOMER_AGE_BUCKETS}
              value={form.Customer_age}
              onChange={handleSelect}
            />
            <SelectInput
              name="Customer_type"
              label="Tipo de Cliente"
              options={CUSTOMER_TYPES}
              value={form.Customer_type}
              onChange={handleSelect}
            />
            <SelectInput
              name="Customer_region"
              label="Región"
              options={REGIONS}
              value={form.Customer_region}
              onChange={handleSelect}
            />
            <SelectInput
              name="Customer_province"
              label="Provincia"
              options={CUSTOMER_PROVINCES}
              value={form.Customer_province}
              onChange={handleSelect}
            />
            <SelectInput
              name="Customer_urbanization"
              label="Urbanización"
              options={URBANIZATION}
              value={form.Customer_urbanization}
              onChange={handleSelect}
            />
          </div>
        </section>

        {/* ── Información del Mediador ── */}
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Información del Mediador
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              name="Broker_region"
              label="Región"
              options={REGIONS}
              value={form.Broker_region}
              onChange={handleSelect}
            />
            <SelectInput
              name="Broker_province"
              label="Provincia"
              options={BROKER_PROVINCES}
              value={form.Broker_province}
              onChange={handleSelect}
            />
            <TextInput
              name="Broker_cor"
              label="Ratio Combinado"
              placeholder="ej. 5619861997"
              type="number"
              value={form.Broker_cor}
              onChange={handleText}
            />
            <SelectInput
              name="Broker_urbanization"
              label="Urbanización"
              options={URBANIZATION}
              value={form.Broker_urbanization}
              onChange={handleSelect}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Calculando…
            </>
          ) : (
            'Ejecutar Predicción'
          )}
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Error en la predicción</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ── Resultado ── */}
      {result && (
        <div className={`rounded-xl border p-6 shadow-sm ${result.is_direct_debit ? 'border-blue-100 bg-blue-50' : 'border-slate-100 bg-white'}`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Resultado de la Predicción</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.is_direct_debit ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {result.is_direct_debit ? (
                <>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Domiciliación
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Sin Domiciliación
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-lg border border-slate-100 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Probabilidad</p>
              <p className="text-3xl font-bold text-slate-900">{pct}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Clase</p>
              <p className="text-3xl font-bold text-slate-900">{result.prediction}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {result.prediction === 1 ? 'Adoptará domiciliación' : 'No adoptará domiciliación'}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs text-slate-400">
              <span>0%</span>
              <span>Confianza del modelo</span>
              <span>100%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${result.is_direct_debit ? 'bg-blue-500' : 'bg-slate-400'}`}
                style={{ width: `${pct}%` }}
                role="meter"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Confianza del modelo: ${pct}%`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
