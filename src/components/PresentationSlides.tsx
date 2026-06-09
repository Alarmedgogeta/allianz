'use client';

import { type SyntheticEvent, useEffect, useRef } from 'react';
import type { RevealApi } from 'reveal.js';
import { DirectDebitPredictorForm } from '@/components/DirectDebitPredictorForm';

const PRESENTATION_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --az-blue:   #003781;
    --az-light:  #0079C0;
    --az-sky:    #0065A8;
    --az-teal:   #0096B4;
    --bg-dark:   #FFFFFF;
    --bg-card:   #F8FAFC;
    --bg-card2:  #EEF2F7;
    --txt:       #1E293B;
    --txt-muted: #64748B;
    --green:     #16A34A;
    --yellow:    #B45309;
    --red:       #DC2626;
    --orange:    #EA580C;
    --border:    rgba(0,55,129,0.10);
  }

  .reveal-viewport { background: #FFFFFF !important; }

  .reveal {
    font-family: 'Inter', system-ui, sans-serif !important;
    font-size: 16px !important;
    color: var(--txt) !important;
  }

  .reveal .slides section {
    text-align: left !important;
    padding: 0 3rem !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }

  .reveal h1 { font-size: 2.6rem !important; font-weight: 700 !important; line-height: 1.15 !important; color: var(--az-blue) !important; letter-spacing: -0.5px !important; }
  .reveal h2 { font-size: 1.7rem !important; font-weight: 600 !important; color: var(--az-light) !important; margin-bottom: .6rem !important; letter-spacing: -0.3px !important; }
  .reveal h3 { font-size: 1.05rem !important; font-weight: 600 !important; color: var(--az-sky) !important; text-transform: uppercase !important; letter-spacing: 1.5px !important; margin-bottom: .4rem !important; }
  .reveal p, .reveal li { font-size: .92rem !important; line-height: 1.7 !important; color: var(--txt) !important; }
  .reveal strong { color: var(--az-light) !important; font-weight: 600 !important; }
  .reveal em { color: var(--yellow) !important; font-style: normal !important; }
  .reveal code { font-family: 'JetBrains Mono', monospace !important; font-size: .78rem !important; background: rgba(0,121,192,.09) !important; color: var(--az-light) !important; padding: .1em .35em !important; border-radius: 4px !important; }

  .reveal .progress { color: var(--az-light) !important; }
  .reveal .controls { color: var(--az-light) !important; }
  .reveal .slide-number { background: transparent !important; color: var(--txt-muted) !important; font-size: .7rem !important; }

  /* --- utility classes --- */
  .chip { display: inline-block; padding: .2rem .65rem; border-radius: 99px; font-size: .72rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; }
  .chip-blue  { background: rgba(0,55,129,.08); color: var(--az-blue); border: 1px solid rgba(0,55,129,.25); }
  .chip-green { background: rgba(22,163,74,.10); color: var(--green); border: 1px solid rgba(22,163,74,.35); }
  .chip-yellow{ background: rgba(180,83,9,.08); color: var(--yellow); border: 1px solid rgba(180,83,9,.25); }
  .chip-red   { background: rgba(220,38,38,.08); color: var(--red); border: 1px solid rgba(220,38,38,.30); }

  .divider { width: 48px; height: 3px; background: linear-gradient(90deg, var(--az-light), var(--az-sky)); border-radius: 2px; margin: .6rem 0 1.1rem; }

  .card  { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1.1rem 1.3rem; }
  .card-sm { background: var(--bg-card2); border: 1px solid var(--border); border-radius: 10px; padding: .8rem 1rem; }

  .metric-big   { font-size: 3.2rem; font-weight: 700; line-height: 1; }
  .metric-label { font-size: .78rem; color: var(--txt-muted); text-transform: uppercase; letter-spacing: 1px; margin-top: .25rem; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .8rem; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: .7rem; }

  .bar-wrap { width: 100%; background: rgba(0,0,0,.08); border-radius: 4px; height: 10px; overflow: hidden; margin-top: .4rem; }
  .bar-fill { height: 100%; border-radius: 4px; }

  ul.clean { list-style: none; padding: 0; margin: 0; }
  ul.clean li { padding: .45rem 0; border-bottom: 1px solid rgba(0,0,0,.06); display: flex; align-items: flex-start; gap: .6rem; }
  ul.clean li:last-child { border-bottom: none; }
  ul.clean li::before { content: "›"; color: var(--az-light); font-size: 1rem; flex-shrink: 0; margin-top: .02rem; }

  .highlight-box { background: linear-gradient(135deg,rgba(0,121,192,.07),rgba(0,121,192,.03)); border: 1px solid rgba(0,121,192,.20); border-left: 4px solid var(--az-light); border-radius: 10px; padding: 1rem 1.2rem; margin: .7rem 0; }
  .quote { font-size: 1.05rem; font-weight: 500; color: var(--txt); font-style: italic; line-height: 1.6; }

  table.styled { width: 100%; border-collapse: collapse; font-size: .8rem; }
  table.styled th { background: rgba(0,55,129,.08); color: var(--az-blue); padding: .55rem .75rem; text-transform: uppercase; font-size: .68rem; letter-spacing: .8px; text-align: left; }
  table.styled td { padding: .5rem .75rem; border-bottom: 1px solid rgba(0,0,0,.07); }
  table.styled tr:last-child td { border-bottom: none; }
  table.styled tr.winner td { background: rgba(22,163,74,.06); }
  table.styled .star { color: var(--yellow); font-size: 1rem; }

  /* --- title slide --- */
  .slide-title { display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 0 3.5rem !important; background: radial-gradient(ellipse at 70% 30%,rgba(0,121,192,.08) 0%,transparent 65%); }
  .slide-title .eyebrow { font-size: .72rem; letter-spacing: 2.5px; text-transform: uppercase; color: var(--az-sky); margin-bottom: .8rem; }
  .slide-title .meta-row { display: flex; gap: .7rem; margin-top: 1.4rem; flex-wrap: wrap; }

  /* --- section break --- */
  .slide-section { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center !important; height: 100%; background: radial-gradient(ellipse at 50% 40%,rgba(0,55,129,.07) 0%,transparent 70%); }
  .slide-section .section-number { font-size: 5rem; font-weight: 700; color: rgba(0,55,129,.10); line-height: 1; margin-bottom: -.5rem; }
  .slide-section h2 { font-size: 2.2rem !important; color: var(--az-blue) !important; }
  .slide-section p { color: var(--txt-muted); max-width: 520px; }

  /* --- body slide --- */
  .slide-body { display: flex; flex-direction: column; padding: 2.2rem 3rem !important; height: 100%; box-sizing: border-box; }
  .slide-body h2 { margin-bottom: .2rem; }
  .slide-body .content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .slide-demo { display: grid !important; grid-template-rows: auto auto auto minmax(0, 1fr); overflow: hidden !important; }
  .slide-demo > .content { height: 100% !important; min-height: 0 !important; justify-content: flex-start !important; }

  .badge-winner { display: inline-flex; align-items: center; gap: .3rem; background: linear-gradient(135deg,rgba(22,163,74,.18),rgba(22,163,74,.08)); border: 1px solid rgba(22,163,74,.4); color: var(--green); font-size: .72rem; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; padding: .2rem .6rem; border-radius: 99px; }
  .vs-arrow { display: flex; align-items: center; justify-content: center; color: var(--txt-muted); font-size: .9rem; padding: 0 .2rem; }

  /* --- form slide isolation (must appear after .reveal rules so cascade wins) --- */
  .slide-form-reset h2 { font-size: .75rem !important; font-weight: 600 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: .1em !important; margin-bottom: 1.25rem !important; line-height: 1.4 !important; }
  .slide-form-reset p, .slide-form-reset li { font-size: .875rem !important; line-height: 1.5 !important; color: inherit !important; }
  .slide-form-reset li { border-bottom: none !important; padding: 0 !important; display: revert !important; }
  .slide-form-reset li::before { display: none !important; }
  .slide-form-reset strong { color: inherit !important; }
  .slide-form-reset em { color: inherit !important; }
  .slide-form-reset { scrollbar-gutter: stable; -webkit-overflow-scrolling: touch; touch-action: pan-y; pointer-events: auto !important; }
  .slide-form-reset :is(input, select, button, textarea, label) { pointer-events: auto !important; }

`;

export default function PresentationSlides() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<RevealApi | null>(null);
  const stopRevealCapture = (event: SyntheticEvent): void => {
    event.stopPropagation();
  };

  useEffect(() => {
    let mounted = true;

    const injectCss = (href: string, id: string): void => {
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    const initDeck = async (): Promise<void> => {
      injectCss(
        'https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reset.css',
        'rvl-reset',
      );
      injectCss(
        'https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reveal.css',
        'rvl-main',
      );

      const { default: Reveal } = await import('reveal.js');

      if (!mounted || !containerRef.current) return;

      const deck = new Reveal(containerRef.current, {
        hash: true,
        slideNumber: 'c/t',
        progress: true,
        controls: true,
        center: false,
        transition: 'fade',
        transitionSpeed: 'fast',
        backgroundTransition: 'fade',
        width: 1200,
        height: 675,
        margin: 0.04,
        minScale: 0.2,
        maxScale: 2.0,
      });

      await deck.initialize();
      if (mounted) {
        deckRef.current = deck;
      }
    };

    // eslint-disable-next-line no-void
    void initDeck();

    return () => {
      mounted = false;
      if (deckRef.current) {
        deckRef.current.destroy();
        deckRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRESENTATION_CSS }} />

      <div className="reveal" ref={containerRef}>
        <div className="slides">
          {/* ── DIAPOSITIVA 1 · TÍTULO ───────────────────────── */}
          <section className="slide-title">
            <div className="eyebrow">
              Allianz Data Office · Revisión Técnica · 2026
            </div>
            <h1>
              Predicción de Adopción de
              <br />
              Débito Directo con Machine Learning
            </h1>
            <div className="divider" />
            <p
              style={{
                maxWidth: 560,
                color: 'var(--txt-muted)',
                fontSize: '.9rem',
                lineHeight: 1.8,
              }}
            >
              Proyecto de clasificación binaria supervisada sobre{' '}
              <strong>452,222 contratos de seguro</strong> para identificar
              candidatos de conversión y priorizar campañas de captación.
            </p>
            <div className="meta-row">
              <span className="chip chip-blue">Metodología CRISP-DM</span>
              <span className="chip chip-blue">5 Modelos Comparados</span>
              <span className="chip chip-green">XGBoost · ROC-AUC 97.87%</span>
              <span className="chip chip-yellow">
                Top 5K · Lift de Conversión 4×
              </span>
            </div>
          </section>

          {/* ── DIAPOSITIVA 2 · RESUMEN EJECUTIVO ───────────── */}
          <section className="slide-body">
            <h3>Resumen</h3>
            <h2>Resumen Ejecutivo</h2>
            <div className="divider" />
            <div className="content">
              <div className="highlight-box">
                <p className="quote">
                  &ldquo;Allianz Benelux tiene una tasa de adopción de débito
                  directo de ~21% — menos de un tercio del promedio de mercado
                  de ~65%. Cada punto porcentual ganado se traduce directamente
                  en mayor previsibilidad del flujo de caja y menores costos de
                  cobranza.&rdquo;
                </p>
              </div>
              <div className="grid-3" style={{ marginTop: '1.1rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="metric-big" style={{ color: 'var(--red)' }}>
                    21%
                  </div>
                  <div className="metric-label">Adopción Actual</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div
                    className="metric-big"
                    style={{ color: 'var(--yellow)' }}
                  >
                    65%
                  </div>
                  <div className="metric-label">Promedio del Mercado</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="metric-big" style={{ color: 'var(--green)' }}>
                    44 pts
                  </div>
                  <div className="metric-label">Brecha por Cerrar</div>
                </div>
              </div>
              <ul className="clean" style={{ marginTop: '1rem' }}>
                <li>
                  El débito directo mejora la{' '}
                  <strong>previsibilidad del flujo de caja</strong>, reduce el
                  costo de cobranza manual y acorta el ciclo de cuentas por
                  cobrar.
                </li>
                <li>
                  Entrenamos y comparamos{' '}
                  <strong>cinco modelos de clasificación</strong> sobre 452K
                  contratos reales siguiendo el framework CRISP-DM.
                </li>
                <li>
                  <strong>XGBoost</strong> fue seleccionado como modelo de
                  producción (ROC-AUC 97.87%). Los 5,000 contratos mejor
                  puntuados muestran un <em>lift de conversión 4×</em> sobre la
                  línea base del portafolio.
                </li>
              </ul>
            </div>
          </section>

          {/* ── DIAPOSITIVA 3 · SECCIÓN: DATOS ──────────────── */}
          <section className="slide-section">
            <div className="section-number">01</div>
            <h2>Comprensión de los Datos</h2>
            <p>
              Escala del conjunto de datos, estructura, hallazgos de calidad y
              patrones clave del análisis exploratorio.
            </p>
          </section>

          {/* ── DIAPOSITIVA 4 · DATASET A ESCALA ────────────── */}
          <section className="slide-body">
            <h3>Comprensión de los Datos</h3>
            <h2>El Conjunto de Datos a Escala</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1.2rem' }}>
                <div>
                  <div
                    className="grid-2"
                    style={{ gap: '.7rem', marginBottom: '.8rem' }}
                  >
                    <div className="card" style={{ textAlign: 'center' }}>
                      <div
                        className="metric-big"
                        style={{ fontSize: '2.2rem', color: 'var(--az-light)' }}
                      >
                        452K
                      </div>
                      <div className="metric-label">Contratos de Seguro</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                      <div
                        className="metric-big"
                        style={{ fontSize: '2.2rem', color: 'var(--az-light)' }}
                      >
                        16
                      </div>
                      <div className="metric-label">Variables</div>
                    </div>
                  </div>
                  <div className="card-sm" style={{ marginBottom: '.7rem' }}>
                    <strong>Unidad de análisis:</strong> una fila = un contrato
                    de seguro.
                    <br />
                    <span
                      style={{ color: 'var(--txt-muted)', fontSize: '.82rem' }}
                    >
                      Un mismo cliente puede tener múltiples contratos.
                    </span>
                  </div>
                  <div className="card-sm">
                    <strong>Hallazgos de calidad de datos</strong>
                    <ul className="clean" style={{ marginTop: '.4rem' }}>
                      <li>
                        Valores nulos &lt; 0.001% — datos faltantes negligibles
                      </li>
                      <li>64 filas duplicadas exactas eliminadas</li>
                      <li>
                        Outliers de <code>Broker_cor</code> acotados en P95 (máx
                        era 6 × 10¹⁶)
                      </li>
                      <li>
                        <code>Annual_premium</code> con transformación log —
                        sesgo derecho pronunciado
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="card" style={{ height: '100%' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Variables Clave
                    </p>
                    <table className="styled">
                      <tbody>
                        <tr>
                          <td>
                            <code>Payment_frequency</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Customer_segment</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Customer_type</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Line_of_business</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Customer_region</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Annual_premium</code>
                          </td>
                          <td>Numérica</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Broker_cor</code>
                          </td>
                          <td>Numérica (razón)</td>
                        </tr>
                        <tr>
                          <td>
                            <code>Customer_age</code>
                          </td>
                          <td>Categórica</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 5 · DESBALANCE DE CLASES ────────── */}
          <section className="slide-body">
            <h3>Comprensión de los Datos</h3>
            <h2>Desbalance de Clases — Por Qué la Exactitud Sola Engaña</h2>
            <div className="divider" />
            <div className="content">
              <div
                className="grid-2"
                style={{ gap: '1.2rem', alignItems: 'start' }}
              >
                <div>
                  <div className="card" style={{ marginBottom: '.8rem' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Distribución del Conjunto de Entrenamiento
                    </p>
                    <div style={{ marginBottom: '.5rem' }}>
                      <div
                        style={{
                          fontSize: '.8rem',
                          color: 'var(--txt-muted)',
                          marginBottom: '.3rem',
                        }}
                      >
                        Sin Débito Directo{' '}
                        <strong style={{ color: 'var(--red)' }}>79%</strong>
                      </div>
                      <div className="bar-wrap">
                        <div
                          className="bar-fill"
                          style={{ width: '79%', background: 'var(--red)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '.8rem',
                          color: 'var(--txt-muted)',
                          marginBottom: '.3rem',
                        }}
                      >
                        Con Débito Directo{' '}
                        <strong style={{ color: 'var(--green)' }}>21%</strong>
                      </div>
                      <div className="bar-wrap">
                        <div
                          className="bar-fill"
                          style={{ width: '21%', background: 'var(--green)' }}
                        />
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--txt-muted)',
                        marginTop: '.7rem',
                      }}
                    >
                      Proporción de desbalance: <strong>3.76 : 1</strong>{' '}
                      (285,696 vs. 76,028 en entrenamiento)
                    </p>
                  </div>
                  <div className="highlight-box">
                    <strong>Trampa de la línea base ingenua</strong>
                    <p style={{ fontSize: '.82rem', marginTop: '.3rem' }}>
                      Un modelo que siempre predice &ldquo;Sin Débito
                      Directo&rdquo; alcanzaría <em>~79% de exactitud</em> sin
                      aprender nada útil.
                    </p>
                  </div>
                </div>
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Nuestra Estrategia
                    </p>
                    <ul className="clean">
                      <li>
                        <strong>class_weight=&apos;balanced&apos;</strong> en
                        todos los clasificadores de sklearn para penalizar la
                        clase mayoritaria
                      </li>
                      <li>
                        <strong>scale_pos_weight = 3.76</strong> para XGBoost,
                        equivalente a la proporción de desbalance
                      </li>
                      <li>
                        Métricas primarias: <strong>ROC-AUC</strong>,{' '}
                        <strong>F1-Score</strong>, <strong>Recall</strong>
                      </li>
                      <li>
                        División estratificada entrenamiento/prueba para
                        preservar proporciones de clases
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 6 · EDA ──────────────────────────── */}
          <section className="slide-body">
            <h3>Comprensión de los Datos</h3>
            <h2>EDA — Patrones de Negocio Clave</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div>
                  {[
                    {
                      label: 'Señal Dominante',
                      title: 'Frecuencia de Pago',
                      body: 'Los contratos mensuales se acercan al 100% de débito directo — es una regla de negocio de Allianz, no una señal aprendible. Esto genera un riesgo de fuga de datos que requiere análisis dedicado.',
                    },
                    {
                      label: 'Segmento de Cliente',
                      title: 'Retail · PYME · Mid-Corp',
                      body: 'Cada segmento muestra tasas de adopción distintas — la estrategia de campaña debe diferenciarse por segmento.',
                    },
                    {
                      label: 'Tipo de Cliente',
                      title: 'Personas vs. Empresas',
                      body: 'Los clientes empresariales prefieren el control manual de pagos. Los asegurados individuales son el principal objetivo de conversión.',
                    },
                  ].map((item) => (
                    <div
                      className="card-sm"
                      style={{ marginBottom: '.7rem' }}
                      key={item.label}
                    >
                      <p
                        style={{
                          fontSize: '.72rem',
                          color: 'var(--az-sky)',
                          textTransform: 'uppercase',
                          letterSpacing: '.8px',
                          marginBottom: '.3rem',
                        }}
                      >
                        {item.label}
                      </p>
                      <strong>{item.title}</strong>
                      <p style={{ fontSize: '.82rem', marginTop: '.25rem' }}>
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  {[
                    {
                      label: 'Geografía',
                      title: 'Región y Urbanización',
                      body: 'Las regiones belgas (BRU, WAL, FLA) y los niveles de urbanización muestran variación — las zonas urbanas exhiben patrones de adopción distintos a las rurales.',
                    },
                    {
                      label: 'Prima Anual',
                      title: 'Sesgo Derecho Pronunciado',
                      body: 'Máx. ~€3M vs. media ~€513. Transformación log aplicada antes del modelado. Los clientes de prima alta pueden preferir el control manual de pago.',
                    },
                    {
                      label: 'Línea de Negocio',
                      title: 'Efectos Estructurales del Producto',
                      body: 'Las líneas de Auto y Propiedad muestran tasas de débito directo estructuralmente más altas. El contexto del producto importa para campañas segmentadas.',
                    },
                  ].map((item) => (
                    <div
                      className="card-sm"
                      style={{ marginBottom: '.7rem' }}
                      key={item.label}
                    >
                      <p
                        style={{
                          fontSize: '.72rem',
                          color: 'var(--az-sky)',
                          textTransform: 'uppercase',
                          letterSpacing: '.8px',
                          marginBottom: '.3rem',
                        }}
                      >
                        {item.label}
                      </p>
                      <strong>{item.title}</strong>
                      <p style={{ fontSize: '.82rem', marginTop: '.25rem' }}>
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 7 · SECCIÓN: MODELADO ───────────── */}
          <section className="slide-section">
            <div className="section-number">02</div>
            <h2>Modelado</h2>
            <p>
              Ingeniería de características, pipeline de preprocesamiento, cinco
              clasificadores — justificación y configuración.
            </p>
          </section>

          {/* ── DIAPOSITIVA 8 · PIPELINE ─────────────────────── */}
          <section className="slide-body">
            <h3>Modelado</h3>
            <h2>
              Ingeniería de Características y Pipeline de Preprocesamiento
            </h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div>
                  <div className="card" style={{ marginBottom: '.8rem' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Características Construidas
                    </p>
                    <ul className="clean">
                      <li>
                        <code>Premium_log</code> — transformación log1p reduce
                        el sesgo derecho
                      </li>
                      <li>
                        <code>Is_monthly_payment</code> — indicador binario de
                        frecuencia mensual
                      </li>
                      <li>
                        <code>Broker_profitable</code> — indicador binario
                        cuando COR del Broker &lt; 100%
                      </li>
                    </ul>
                  </div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Pasos de Preprocesamiento
                    </p>
                    <ul className="clean">
                      <li>
                        <strong>Categórica</strong>: imputar →{' '}
                        <code>&apos;Unknown&apos;</code> → One-Hot Encoding
                      </li>
                      <li>
                        <strong>Numérica</strong>: imputar → mediana →
                        StandardScaler
                      </li>
                      <li>
                        Columnas ID excluidas:{' '}
                        <code>Broker_account_number</code>,{' '}
                        <code>Contract_number</code>, <code>Customer_ID</code>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="card" style={{ height: '100%' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Arquitectura del Pipeline sklearn
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '.5rem',
                        marginTop: '.3rem',
                      }}
                    >
                      <div className="card-sm" style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '.82rem',
                            color: 'var(--az-light)',
                          }}
                        >
                          ColumnTransformer
                        </span>
                        <br />
                        <span
                          style={{
                            fontSize: '.72rem',
                            color: 'var(--txt-muted)',
                          }}
                        >
                          Ramas Categórica + Numérica
                        </span>
                      </div>
                      <div
                        style={{
                          textAlign: 'center',
                          color: 'var(--txt-muted)',
                        }}
                      >
                        ↓
                      </div>
                      <div className="card-sm" style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '.82rem',
                            color: 'var(--az-light)',
                          }}
                        >
                          Clasificador
                        </span>
                        <br />
                        <span
                          style={{
                            fontSize: '.72rem',
                            color: 'var(--txt-muted)',
                          }}
                        >
                          DT / RF / LR / SVM / XGBoost
                        </span>
                      </div>
                      <div
                        style={{
                          textAlign: 'center',
                          color: 'var(--txt-muted)',
                        }}
                      >
                        ↓
                      </div>
                      <div className="card-sm" style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '.82rem',
                            color: 'var(--az-light)',
                          }}
                        >
                          predict_proba( )
                        </span>
                        <br />
                        <span
                          style={{
                            fontSize: '.72rem',
                            color: 'var(--txt-muted)',
                          }}
                        >
                          Puntajes de probabilidad para todos los contratos
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--txt-muted)',
                        marginTop: '.8rem',
                      }}
                    >
                      División estratificada 80/20 — 361,725 entrenamiento ·
                      90,432 prueba.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 9 · 5 MODELOS ────────────────────── */}
          <section className="slide-body">
            <h3>Modelado</h3>
            <h2>Cinco Clasificadores — Justificación</h2>
            <div className="divider" />
            <div className="content">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '.65rem',
                }}
              >
                {[
                  {
                    name: 'Árbol de Decisión',
                    badge: 'Profundidad 5',
                    badgeCls: 'chip-blue',
                    desc: 'Altamente interpretable — las divisiones se traducen directamente en reglas de negocio. Usado como modelo de explicabilidad para formación de brokers. Riesgo: propenso al sobreajuste sin restricciones de profundidad.',
                  },
                  {
                    name: 'Bosque Aleatorio',
                    badge: '200 Árboles',
                    badgeCls: 'chip-blue',
                    desc: 'El promedio del conjunto reduce el sobreajuste. Proporciona importancias de variables para interpretación de negocio. Más lento en conjuntos de datos muy grandes.',
                  },
                  {
                    name: 'Regresión Logística',
                    badge: 'Base',
                    badgeCls: 'chip-blue',
                    desc: 'Línea base interpretable sólida — los coeficientes muestran dirección y magnitud. Ideal para comunicar a partes interesadas no técnicas. Asume frontera de decisión lineal.',
                  },
                  {
                    name: 'SVM (Kernel RBF)',
                    badge: 'Muestra 50K',
                    badgeCls: 'chip-yellow',
                    desc: 'Captura fronteras de decisión no lineales. Entrenado en muestra estratificada de 50K por costo O(n²). El conjunto de prueba sigue siendo 90K completo para evaluación justa.',
                  },
                ].map((m) => (
                  <div className="card-sm" key={m.name}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '.3rem',
                      }}
                    >
                      <strong style={{ fontSize: '.88rem' }}>{m.name}</strong>
                      <span className={`chip ${m.badgeCls}`}>{m.badge}</span>
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--txt-muted)' }}>
                      {m.desc}
                    </p>
                  </div>
                ))}
                <div
                  className="card-sm"
                  style={{
                    gridColumn: 'span 2',
                    borderColor: 'rgba(22,163,74,.3)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '.3rem',
                    }}
                  >
                    <strong style={{ fontSize: '.88rem' }}>XGBoost</strong>
                    <span className="badge-winner">★ Modelo Seleccionado</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--txt-muted)' }}>
                    El gradient boosting corrige iterativamente los errores
                    residuales. Mejor en su clase para datos tabulares con
                    características one-hot codificadas dispersas. 300
                    estimadores, learning_rate=0.05, max_depth=4.
                    scale_pos_weight=3.76 maneja el desbalance de clases
                    nativamente.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 10 · SECCIÓN: RESULTADOS ─────────── */}
          <section className="slide-section">
            <div className="section-number">03</div>
            <h2>Evaluación y Resultados</h2>
            <p>
              Comparación de modelos, matrices de confusión, importancia de
              variables y el descubrimiento de fuga de datos.
            </p>
          </section>

          {/* ── DIAPOSITIVA 11 · COMPARACIÓN DE MODELOS ──────── */}
          <section className="slide-body">
            <h3>Evaluación</h3>
            <h2>
              Comparación de Modelos — Conjunto de Prueba Completo (90,432
              filas)
            </h2>
            <div className="divider" />
            <div className="content">
              <table className="styled">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Exactitud</th>
                    <th>Precisión</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="winner">
                    <td>
                      <strong>XGBoost</strong> <span className="star">★</span>
                    </td>
                    <td>98.52%</td>
                    <td>99.97%</td>
                    <td>92.98%</td>
                    <td>96.35%</td>
                    <td>
                      <strong style={{ color: 'var(--green)' }}>97.87%</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Bosque Aleatorio</td>
                    <td>98.52%</td>
                    <td>100.00%</td>
                    <td>92.97%</td>
                    <td>96.36%</td>
                    <td>97.73%</td>
                  </tr>
                  <tr>
                    <td>Regresión Logística</td>
                    <td>98.52%</td>
                    <td>100.00%</td>
                    <td>92.97%</td>
                    <td>96.35%</td>
                    <td>97.67%</td>
                  </tr>
                  <tr>
                    <td>Árbol de Decisión</td>
                    <td>98.50%</td>
                    <td>99.86%</td>
                    <td>92.98%</td>
                    <td>96.30%</td>
                    <td>97.47%</td>
                  </tr>
                  <tr>
                    <td>SVM (muestra 50K)</td>
                    <td>98.52%</td>
                    <td>100.00%</td>
                    <td>92.95%</td>
                    <td>96.35%</td>
                    <td>96.94%</td>
                  </tr>
                </tbody>
              </table>
              <div className="highlight-box" style={{ marginTop: '.9rem' }}>
                <strong>Por qué las métricas convergen:</strong>
                <p style={{ fontSize: '.83rem', marginTop: '.25rem' }}>
                  Los cinco modelos convergen cerca del 98.5% de exactitud y
                  96.3% de F1 — confirmando que el conjunto de datos contiene
                  una señal estructural fuerte (particularmente{' '}
                  <code>Payment_frequency</code>). El ROC-AUC es el desempate
                  decisivo, donde el <em>97.87%</em> de XGBoost toma la
                  delantera.
                </p>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 12 · FUGA DE DATOS ───────────────── */}
          <section className="slide-body">
            <h3>Evaluación</h3>
            <h2>Descubrimiento de Fuga de Datos — Análisis Estrategia B</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1.2rem' }}>
                <div>
                  <div
                    className="highlight-box"
                    style={{ borderLeftColor: 'var(--yellow)' }}
                  >
                    <strong style={{ color: 'var(--yellow)' }}>Hallazgo</strong>
                    <p style={{ fontSize: '.85rem', marginTop: '.3rem' }}>
                      <code>Payment_frequency = Monthly</code> está casi
                      perfectamente correlacionada con el débito directo por una{' '}
                      <strong>regla de negocio de Allianz</strong>: los
                      contratos mensuales <em>deben</em> usar débito directo.
                      Esto es una regla, no un patrón aprendible — fuga de datos
                      casi total.
                    </p>
                  </div>
                  <div className="card" style={{ marginTop: '.8rem' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Estrategia B — Eliminar Variables de Frecuencia
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '.7rem',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        className="card-sm"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        <div
                          style={{
                            fontSize: '1.6rem',
                            fontWeight: 700,
                            color: 'var(--green)',
                          }}
                        >
                          97.87%
                        </div>
                        <div className="metric-label">
                          Estrategia A<br />
                          (con frecuencia)
                        </div>
                      </div>
                      <div className="vs-arrow">→</div>
                      <div
                        className="card-sm"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        <div
                          style={{
                            fontSize: '1.6rem',
                            fontWeight: 700,
                            color: 'var(--yellow)',
                          }}
                        >
                          75.56%
                        </div>
                        <div className="metric-label">
                          Estrategia B<br />
                          (sin frecuencia)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Interpretación
                    </p>
                    <ul className="clean">
                      <li>
                        La Estrategia A es válida para puntuar contratos
                        existentes donde la frecuencia de pago es conocida.
                      </li>
                      <li>
                        La Estrategia B (AUC 75.56%) revela las{' '}
                        <strong>
                          señales conductuales y demográficas reales
                        </strong>{' '}
                        — segmento, región, producto, calidad del broker.
                      </li>
                      <li>
                        Para campañas dirigidas a contratos no mensuales,{' '}
                        <em>la Estrategia B</em> es el modelo operacionalmente
                        significativo.
                      </li>
                      <li>
                        Ambos modelos se mantienen y despliegan para sus
                        respectivos casos de uso.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 13 · IMPORTANCIA DE VARIABLES ────── */}
          <section className="slide-body">
            <h3>Evaluación</h3>
            <h2>¿Qué Impulsa la Adopción del Débito Directo?</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div>
                  <p
                    style={{
                      fontSize: '.8rem',
                      color: 'var(--txt-muted)',
                      marginBottom: '.6rem',
                    }}
                  >
                    Principales variables por importancia del modelo (Estrategia
                    A)
                  </p>
                  {[
                    {
                      name: 'Payment_frequency_Monthly',
                      width: '88%',
                      gradient: `linear-gradient(90deg,var(--az-light),var(--az-sky))`,
                      note: '★ dominante',
                    },
                    {
                      name: 'Customer_segment',
                      width: '42%',
                      gradient: 'var(--az-light)',
                      note: '',
                    },
                    {
                      name: 'Customer_type',
                      width: '35%',
                      gradient: 'var(--az-light)',
                      note: '',
                    },
                    {
                      name: 'Line_of_business',
                      width: '28%',
                      gradient: 'var(--az-light)',
                      note: '',
                    },
                    {
                      name: 'Premium_log',
                      width: '22%',
                      gradient: 'var(--az-teal)',
                      note: '',
                    },
                    {
                      name: 'Broker_profitable',
                      width: '16%',
                      gradient: 'var(--az-teal)',
                      note: '',
                    },
                    {
                      name: 'Customer_region',
                      width: '12%',
                      gradient: 'var(--az-teal)',
                      note: '',
                    },
                  ].map((f) => (
                    <div key={f.name} style={{ marginBottom: '.4rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '.8rem',
                        }}
                      >
                        <span>
                          <code>{f.name}</code>
                        </span>
                        {f.note && (
                          <span style={{ color: 'var(--yellow)' }}>
                            {f.note}
                          </span>
                        )}
                      </div>
                      <div className="bar-wrap">
                        <div
                          className="bar-fill"
                          style={{ width: f.width, background: f.gradient }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Interpretación de Negocio
                    </p>
                    <ul className="clean">
                      <li>
                        <strong>Frecuencia de pago</strong>: Refleja la regla de
                        negocio — operacionalmente significativa para
                        puntuación, no para nueva estrategia de adopción.
                      </li>
                      <li>
                        <strong>Segmento de cliente</strong>: Retail, PYME y
                        Mid-Corp requieren campañas diferenciadas.
                      </li>
                      <li>
                        <strong>Tipo de cliente</strong>: Los asegurados
                        individuales son el principal objetivo de conversión;
                        las empresas prefieren el control manual.
                      </li>
                      <li>
                        <strong>Línea de negocio</strong>: Las líneas de Auto y
                        Propiedad tienen ventajas estructurales de DD.
                      </li>
                      <li>
                        <strong>Rentabilidad del broker</strong>: Los brokers de
                        alto rendimiento (COR &lt; 100%) recomiendan activamente
                        el DD a sus clientes.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 14 · SECCIÓN: RECOMENDACIONES ────── */}
          <section className="slide-section">
            <div className="section-number">04</div>
            <h2>Recomendaciones de Negocio</h2>
            <p>
              Puntuación del portafolio, diseño de campaña, estrategia de
              segmentación y participación del broker.
            </p>
          </section>

          {/* ── DIAPOSITIVA 15 · PUNTUACIÓN DEL PORTAFOLIO ───── */}
          <section className="slide-body">
            <h3>Recomendaciones</h3>
            <h2>Puntuación del Portafolio — Segmentación Priorizada</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1.2rem' }}>
                <div>
                  <div
                    className="highlight-box"
                    style={{ marginBottom: '.8rem' }}
                  >
                    <p className="quote" style={{ fontSize: '.9rem' }}>
                      Cada contrato sin débito directo fue puntuado
                      individualmente. Los 5,000 contratos mejor puntuados
                      alcanzan una probabilidad de conversión predicha{' '}
                      <em>4× mayor</em> que la línea base del portafolio.
                    </p>
                  </div>
                  <div className="grid-2" style={{ gap: '.7rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                      <div
                        className="metric-big"
                        style={{ fontSize: '2rem', color: 'var(--green)' }}
                      >
                        24.97%
                      </div>
                      <div className="metric-label">
                        Top 5,000 contratos
                        <br />
                        prob. predicha prom.
                      </div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                      <div
                        className="metric-big"
                        style={{ fontSize: '2rem', color: 'var(--txt-muted)' }}
                      >
                        6.22%
                      </div>
                      <div className="metric-label">
                        Línea base del portafolio
                        <br />
                        prob. predicha prom.
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Cómo Usar los Puntajes
                    </p>
                    <ul className="clean">
                      <li>
                        Ordenar todos los contratos no-DD por probabilidad
                        predicha (descendente)
                      </li>
                      <li>
                        Definir niveles de captación: <strong>Top 5K</strong>{' '}
                        (prioridad), 5K–20K (secundario), 20K+ (canal masivo)
                      </li>
                      <li>
                        Cada nivel recibe un canal de comunicación y mensaje
                        diferenciado
                      </li>
                      <li>
                        El puntaje de probabilidad alimenta los dashboards de
                        brokers para conversaciones personalizadas
                      </li>
                      <li>
                        Re-puntuar el portafolio completo trimestralmente a
                        medida que se agregan nuevos contratos
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 16 · DISEÑO DEL PILOTO ───────────── */}
          <section className="slide-body">
            <h3>Recomendaciones</h3>
            <h2>Piloto Controlado — Diseño de Campaña</h2>
            <div className="divider" />
            <div className="content">
              <div
                className="grid-2"
                style={{ gap: '1.2rem', alignItems: 'start' }}
              >
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Estructura del Piloto A/B
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '.6rem',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        className="card-sm"
                        style={{ borderColor: 'rgba(22,163,74,.4)' }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--green)',
                          }}
                        >
                          5,000
                        </div>
                        <div
                          style={{
                            fontSize: '.75rem',
                            color: 'var(--green)',
                            margin: '.2rem 0',
                          }}
                        >
                          Grupo Tratamiento
                        </div>
                        <p
                          style={{
                            fontSize: '.78rem',
                            color: 'var(--txt-muted)',
                          }}
                        >
                          Contratos mejor puntuados por el modelo — captación
                          dirigida
                        </p>
                      </div>
                      <div
                        className="card-sm"
                        style={{ borderColor: 'rgba(0,0,0,.12)' }}
                      >
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--txt-muted)',
                          }}
                        >
                          5,000
                        </div>
                        <div
                          style={{
                            fontSize: '.75rem',
                            color: 'var(--txt-muted)',
                            margin: '.2rem 0',
                          }}
                        >
                          Grupo Control
                        </div>
                        <p
                          style={{
                            fontSize: '.78rem',
                            color: 'var(--txt-muted)',
                          }}
                        >
                          Contratos no-DD seleccionados aleatoriamente — sin
                          captación
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: '.9rem',
                        paddingTop: '.7rem',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <p style={{ fontSize: '.82rem' }}>
                        <strong>Duración:</strong> 90 días
                      </p>
                      <p style={{ fontSize: '.82rem', marginTop: '.3rem' }}>
                        <strong>Métrica de éxito:</strong> Δ tasa de conversión
                        (tratamiento − control)
                      </p>
                      <p style={{ fontSize: '.82rem', marginTop: '.3rem' }}>
                        <strong>Resultado:</strong> Calibrar umbral del modelo,
                        disparador de reentrenamiento
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="card">
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Por Qué un Piloto Controlado Primero
                    </p>
                    <ul className="clean">
                      <li>
                        Valida el lift predicho contra la{' '}
                        <strong>respuesta real de la campaña</strong> antes del
                        despliegue al portafolio completo
                      </li>
                      <li>
                        Genera datos de respuesta etiquetados para{' '}
                        <strong>modelado de uplift</strong> en la Fase 2
                      </li>
                      <li>
                        Permite calibrar el umbral — el punto de corte óptimo es
                        basado en datos, no asumido
                      </li>
                      <li>
                        Genera confianza interna en el modelo antes de
                        decisiones presupuestarias a nivel CFO
                      </li>
                    </ul>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '.7rem' }}>
                    <strong style={{ fontSize: '.85rem' }}>
                      Señal económica esperada:
                    </strong>
                    <p style={{ fontSize: '.82rem', marginTop: '.25rem' }}>
                      Si el grupo Top 5K convierte al 15% vs. 5% del grupo
                      control, eso representa 500 nuevos contratos de débito
                      directo en un solo ciclo de campaña.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 17 · ESTRATEGIA POR SEGMENTO ─────── */}
          <section className="slide-body">
            <h3>Recomendaciones</h3>
            <h2>Estrategia de Campaña por Segmento</h2>
            <div className="divider" />
            <div className="content">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '.8rem',
                  marginBottom: '.9rem',
                }}
              >
                {[
                  {
                    seg: 'Individuos Retail',
                    body: 'Los pagadores no mensuales son el objetivo de conversión más natural. Ya están cómodos con pagos digitales recurrentes. La captación directa vía email o notificación de app es más efectiva.',
                  },
                  {
                    seg: 'PYME y Mid-Corp',
                    body: 'Orientados a finanzas — prefieren el control de facturas. Abordaje vía gestores de cuenta y brokers. El mensaje debe enfocarse en reducción de carga administrativa y certeza de pago, no en conveniencia.',
                  },
                  {
                    seg: 'Pagadores Trimestrales',
                    body: 'Ya aceptan pagos automáticos periódicos — el grupo de conversión más fuerte para el siguiente paso. Captar en la renovación con una oferta de cambio a DD en un clic.',
                  },
                ].map((s) => (
                  <div className="card-sm" key={s.seg}>
                    <p
                      style={{
                        fontSize: '.72rem',
                        color: 'var(--az-sky)',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                        marginBottom: '.35rem',
                      }}
                    >
                      {s.seg}
                    </p>
                    <p style={{ fontSize: '.82rem' }}>{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <p
                  style={{
                    fontSize: '.78rem',
                    color: 'var(--txt-muted)',
                    marginBottom: '.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.8px',
                  }}
                >
                  Estrategia de Involucramiento del Broker
                </p>
                <div className="grid-2" style={{ gap: '.8rem' }}>
                  <ul className="clean">
                    <li>
                      Compartir{' '}
                      <strong>dashboards de conversión de DD por broker</strong>{' '}
                      comparados con el promedio del mercado
                    </li>
                    <li>
                      Capacitar a los brokers para plantear el DD en
                      conversaciones de <strong>renovación de póliza</strong>
                    </li>
                  </ul>
                  <ul className="clean">
                    <li>
                      Introducir{' '}
                      <strong>incentivos de calidad de servicio</strong>{' '}
                      vinculados a la tasa de adopción de DD por broker
                    </li>
                    <li>
                      Líneas de Auto y Propiedad: mayor potencial estructural —
                      priorizar estas líneas en briefings de brokers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 18 · SECCIÓN: LIMITACIONES ───────── */}
          <section className="slide-section">
            <div className="section-number">05</div>
            <h2>Limitaciones y Próximos Pasos</h2>
            <p>
              Restricciones conocidas, factores de riesgo y la hoja de ruta
              hacia producción.
            </p>
          </section>

          {/* ── DIAPOSITIVA 19 · LIMITACIONES ────────────────── */}
          <section className="slide-body">
            <h3>Limitaciones y Próximos Pasos</h3>
            <h2>Limitaciones Conocidas</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '.8rem' }}>
                {[
                  {
                    color: 'var(--yellow)',
                    title: 'Fuga de la Variable Frecuencia de Pago',
                    body: 'La correlación Mensual → DD refleja una regla de negocio, no una señal aprendible. Los resultados de la Estrategia A deben interpretarse con esta advertencia. La Estrategia B (AUC 75.56%) es la medida real de predictibilidad de adopción voluntaria.',
                  },
                  {
                    color: 'var(--orange)',
                    title: 'Instantánea Estática del Conjunto de Datos',
                    body: 'Este conjunto de datos representa un punto en el tiempo. El modelo se degradará a medida que evolucione el portafolio. El reentrenamiento trimestral está presupuestado en los próximos pasos.',
                  },
                  {
                    color: 'var(--red)',
                    title: 'Sin Historial de Respuesta a Campañas',
                    body: 'Predecimos propensión, no uplift causal. El piloto resuelve esto generando datos de respuesta etiquetados para un modelo de uplift real en la Fase 2.',
                  },
                  {
                    color: 'var(--red)',
                    title: 'Calidad de Datos de Broker_cor',
                    body: 'Los valores extremos atípicos (hasta 6 × 10¹⁶) indican un error de extracción de datos en origen. El acotamiento en P95 es pragmático — ingeniería de datos debe investigar la causa raíz.',
                  },
                ].map((lim) => (
                  <div
                    className="card-sm"
                    style={{ borderLeft: `3px solid ${lim.color}` }}
                    key={lim.title}
                  >
                    <strong style={{ fontSize: '.85rem', color: lim.color }}>
                      {lim.title}
                    </strong>
                    <p
                      style={{
                        fontSize: '.8rem',
                        marginTop: '.3rem',
                        color: 'var(--txt-muted)',
                      }}
                    >
                      {lim.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 20 · PRÓXIMOS PASOS ──────────────── */}
          <section className="slide-body">
            <h3>Limitaciones y Próximos Pasos</h3>
            <h2>Hoja de Ruta hacia Producción</h2>
            <div className="divider" />
            <div className="content">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5,1fr)',
                  gap: '.6rem',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                {[
                  {
                    icon: '📊',
                    title: 'Análisis SHAP',
                    body: 'Explicaciones a nivel de contrato individual para conversaciones de brokers',
                  },
                  {
                    icon: '🧪',
                    title: 'Modelado de Uplift',
                    body: 'Modelo causal real tras recopilar los datos del piloto A/B',
                  },
                  {
                    icon: '⚙️',
                    title: 'Ajuste de Hiperparámetros',
                    body: 'GridSearchCV / Optuna sobre XGBoost y Bosque Aleatorio',
                  },
                  {
                    icon: '🚀',
                    title: 'Despliegue en API',
                    body: 'Endpoint FastAPI o Azure ML / AWS SageMaker',
                  },
                  {
                    icon: '🔄',
                    title: 'Reentrenamiento Trimestral',
                    body: 'Actualización programada a medida que se acumulan nuevos contratos',
                  },
                ].map((step) => (
                  <div className="card-sm" key={step.title}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '.3rem' }}>
                      {step.icon}
                    </div>
                    <strong style={{ fontSize: '.78rem' }}>{step.title}</strong>
                    <p
                      style={{
                        fontSize: '.72rem',
                        color: 'var(--txt-muted)',
                        marginTop: '.2rem',
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="highlight-box">
                <div className="grid-2" style={{ gap: '.8rem' }}>
                  <div>
                    <strong>Artefacto del modelo</strong>
                    <p style={{ fontSize: '.82rem', marginTop: '.2rem' }}>
                      Pipeline XGBoost serializado con <code>joblib</code> —
                      incluye todos los pasos de preprocesamiento. Listo para
                      integración en la Plataforma de Datos de Allianz.
                    </p>
                  </div>
                  <div>
                    <strong>Modelo Estrategia B</strong>
                    <p style={{ fontSize: '.82rem', marginTop: '.2rem' }}>
                      Modelo secundario (sin variables de frecuencia) preservado
                      por separado para puntuación de adopción voluntaria y
                      dashboards de insight para brokers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 21 · VALOR DE NEGOCIO Y CTA ──────── */}
          <section
            className="slide-body"
            style={{
              background:
                'radial-gradient(ellipse at 30% 60%,rgba(0,121,192,.08) 0%,transparent 60%)',
            }}
          >
            <h3>Conclusión</h3>
            <h2>Valor de Negocio y Próxima Acción Recomendada</h2>
            <div className="divider" />
            <div className="content">
              <div className="grid-2" style={{ gap: '1.2rem' }}>
                <div>
                  <div className="card" style={{ marginBottom: '.8rem' }}>
                    <p
                      style={{
                        fontSize: '.78rem',
                        color: 'var(--txt-muted)',
                        marginBottom: '.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      Qué Habilita Este Modelo
                    </p>
                    <ul className="clean">
                      <li>
                        <strong>Previsibilidad del flujo de caja</strong> para
                        el equipo de Finanzas
                      </li>
                      <li>
                        <strong>Reducción de costos de cobranza manual</strong>{' '}
                        para Operaciones
                      </li>
                      <li>
                        <strong>Acortamiento del ciclo de cobro</strong> para
                        Tesorería
                      </li>
                      <li>
                        <strong>Empoderamiento del broker</strong> con
                        conversaciones de cliente basadas en datos
                      </li>
                      <li>
                        <strong>Mejor experiencia del cliente</strong> mediante
                        el pago automático de primas
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div
                    className="highlight-box"
                    style={{ marginBottom: '.8rem' }}
                  >
                    <strong>Próxima Acción Recomendada</strong>
                    <p
                      style={{
                        fontSize: '.85rem',
                        marginTop: '.4rem',
                        lineHeight: 1.7,
                      }}
                    >
                      Lanzar el <strong>piloto controlado de 90 días</strong>:
                      contactar los 5,000 contratos mejor puntuados y comparar
                      la conversión real contra un grupo de control de 5,000
                      contratos. Esto valida el ROI económico antes de
                      comprometerse con el despliegue al portafolio completo.
                    </p>
                  </div>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div
                      className="metric-big"
                      style={{ color: 'var(--green)' }}
                    >
                      97.87%
                    </div>
                    <div className="metric-label">XGBoost ROC-AUC</div>
                    <div
                      style={{
                        marginTop: '.6rem',
                        fontSize: '.8rem',
                        color: 'var(--txt-muted)',
                      }}
                    >
                      452,222 contratos · 5 modelos comparados · CRISP-DM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 22 · DEMO INTERACTIVA ───────────── */}
          <section className="slide-body slide-demo">
            <h3>Demo Interactiva</h3>
            <h2>Prueba el Modelo XGBoost en Vivo</h2>
            <div className="divider" />
            <div
              className="content"
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                gap: '1.1rem',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Context panel */}
              <div
                style={{
                  width: '30%',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.7rem',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <div className="highlight-box" style={{ margin: 0 }}>
                  <strong>Cómo funciona</strong>
                  <p
                    style={{
                      fontSize: '.8rem',
                      marginTop: '.3rem',
                      color: 'var(--txt-muted)',
                    }}
                  >
                    Ingresa las características del contrato. El modelo XGBoost
                    calcula en tiempo real la probabilidad de que el cliente
                    adopte débito directo.
                  </p>
                </div>
                <div className="card-sm">
                  <p
                    style={{
                      fontSize: '.7rem',
                      color: 'var(--az-sky)',
                      textTransform: 'uppercase',
                      letterSpacing: '.8px',
                      marginBottom: '.35rem',
                    }}
                  >
                    Endpoint
                  </p>
                  <code>POST /api/predict</code>
                </div>
                <div className="card-sm" style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '.7rem',
                      color: 'var(--az-sky)',
                      textTransform: 'uppercase',
                      letterSpacing: '.8px',
                      marginBottom: '.4rem',
                    }}
                  >
                    Campos requeridos
                  </p>
                  {[
                    'Segmento del cliente',
                    'Ramo y producto',
                    'Prima anual',
                    'Frecuencia de pago',
                    'Tipo y edad del cliente',
                    'Región / provincia',
                    'Ratio combinado (broker)',
                  ].map((f) => (
                    <div
                      key={f}
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--txt-muted)',
                        padding: '.2rem 0',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.4rem',
                      }}
                    >
                      <span style={{ color: 'var(--az-light)' }}>›</span>
                      {f}
                    </div>
                  ))}
                </div>
                <div
                  className="card-sm"
                  style={{ textAlign: 'center', padding: '.5rem' }}
                >
                  <span className="chip chip-green">
                    XGBoost · ROC-AUC 97.87%
                  </span>
                </div>
              </div>

              {/* Scrollable form */}
              <div
                className="slide-form-reset"
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore – RevealJS prevents swipe on this element
                data-prevent-swipe="true"
                onClickCapture={stopRevealCapture}
                onKeyDownCapture={stopRevealCapture}
                onPointerDownCapture={stopRevealCapture}
                onTouchMoveCapture={stopRevealCapture}
                onTouchStartCapture={stopRevealCapture}
                onWheelCapture={stopRevealCapture}
                style={{
                  flex: 1,
                  minHeight: 0,
                  maxHeight: '100%',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  color: '#1e293b',
                  paddingRight: '.25rem',
                }}
              >
                <DirectDebitPredictorForm />
              </div>
            </div>
          </section>

          {/* ── DIAPOSITIVA 23 · PREGUNTAS ───────────────────── */}
          <section className="slide-section">
            <div className="section-number" style={{ fontSize: '3rem' }}>
              Q&amp;A
            </div>
            <h2>Preguntas y Discusión</h2>
            <p>
              Los detalles técnicos, las decisiones metodológicas y los próximos
              pasos están abiertos a revisión.
            </p>
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '.7rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span className="chip chip-blue">
                Notebook: allianz-predict-direct-debit.ipynb
              </span>
              <span className="chip chip-green">Modelo: best_model.joblib</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
