'use client';

import { useEffect, useRef, useState } from 'react';
import type { RevealApi } from 'reveal.js';
import { DirectDebitPredictorForm } from './DirectDebitPredictorForm';

/* ───────────────────────────────────────────────────────────────────────────
   CSS — Allianz brand tokens copied from the PPTX
   Dark bg:  #1E2761   Gold accent: #C9A227 / #E3C766
   Light bg: #FFFFFF   Body text on dark: #FFFFFF / #CADCFC
   Body text on white: #1E2761
──────────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

  :root {
    --dark:   #1E2761;
    --gold:   #C9A227;
    --gold2:  #E3C766;
    --light-blue: #CADCFC;
    --sky:    #4A7FC1;
    --white:  #FFFFFF;
    --muted:  #8BA5CC;
    --gray:   #5A6072;
    --green:  #22C55E;
    --red:    #E05252;
  }

  /* ── Reveal base ──────────────────────────────────────────── */
  .reveal-viewport { background: var(--dark) !important; }
  .reveal {
    font-family: 'Inter', system-ui, sans-serif !important;
    font-size: 16px !important;
    color: var(--white) !important;
  }
  .reveal .slides section { height: 100% !important; box-sizing: border-box !important; padding: 0 !important; }
  .reveal .progress { color: var(--gold) !important; }
  .reveal .controls { color: var(--gold) !important; }
  .reveal .slide-number { display: none !important; }
  .deck-slide-number { position: absolute; right: 1rem; bottom: 1rem; color: var(--muted); font-size: .7rem; z-index: 5; pointer-events: none; }
  .reveal h1, .reveal h2, .reveal h3 { text-transform: none !important; }

  /* ── Slide containers ─────────────────────────────────────── */
  .s-dark { background: var(--dark); width: 100%; height: 100%; position: relative; overflow: hidden; }
  .s-light { background: var(--white); width: 100%; height: 100%; position: relative; overflow: hidden; }

  /* ── Background decoration on dark slides ─────────────────── */
  .s-dark > * {
    position: relative;
    z-index: 1;
  }
  .s-dark::before {
    content: '';
    position: absolute;
    z-index: 0;
    width: 46%;
    height: 83%;
    border-radius: 50%;
    background: #151B47;
    top: -29%;
    right: -10%;
    pointer-events: none;
  }
  .s-dark::after {
    content: '';
    position: absolute;
    z-index: 0;
    width: 34%;
    height: 61%;
    border-radius: 50%;
    background: #151B47;
    top: 48%;
    right: -2%;
    pointer-events: none;
  }

  /* ── Typography ───────────────────────────────────────────── */
  .t-eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--light-blue); }
  .t-title-white { font-family: 'Playfair Display', Georgia, serif; font-size: 3rem; font-weight: 700; color: var(--white); line-height: 1.15; }
  .t-title-gold  { font-family: 'Playfair Display', Georgia, serif; font-size: 3rem; font-weight: 700; color: var(--gold2); line-height: 1.15; }
  .t-section { font-size: 1.1rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); }
  .t-slide-h2-dark  { font-family: 'Playfair Display', Georgia, serif; font-size: 1.6rem; font-weight: 700; color: var(--white); line-height: 1.25; }
  .t-slide-h2-light { font-family: 'Playfair Display', Georgia, serif; font-size: 1.5rem; font-weight: 700; color: var(--dark); line-height: 1.25; }
  .t-body-dark  { font-size: .82rem; line-height: 1.6; color: rgba(255,255,255,.88); }
  .t-body-light { font-size: .82rem; line-height: 1.6; color: var(--gray); }
  .t-bold-dark  { font-weight: 700; color: var(--white); }
  .t-bold-light { font-weight: 700; color: var(--dark); }

  /* ── Metric cards ─────────────────────────────────────────── */
  .metric-box-dark  { text-align: center; }
  .metric-box-light { text-align: center; }
  .metric-num-big  { font-family: 'Playfair Display', Georgia, serif; font-size: 2.8rem; font-weight: 700; line-height: 1; }
  .metric-num-med  { font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; font-weight: 700; line-height: 1; }
  .metric-lbl { font-size: .68rem; letter-spacing: 1.5px; text-transform: uppercase; margin-top: .3rem; }

  /* ── Cards on white slides ─────────────────────────────────── */
  .card-w { background: #F4F7FF; border: 1px solid rgba(30,39,97,.12); border-radius: 12px; padding: .9rem 1rem; }
  .card-w-border-l { border-left: 4px solid var(--gold); }

  /* ── Step circles ─────────────────────────────────────────── */
  .step-num { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--dark); color: var(--gold); font-weight: 700; font-size: 1rem; flex-shrink: 0; }
  .step-num-gold { background: var(--gold); color: var(--dark); }

  /* ── Confusion matrix ─────────────────────────────────────── */
  .cm-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; padding: .5rem; }
  .cm-tn { background: rgba(30,39,97,.06); border: 1px solid rgba(30,39,97,.15); }
  .cm-fp { background: rgba(224,82,82,.08); border: 1px solid rgba(224,82,82,.3); }
  .cm-fn { background: rgba(224,82,82,.08); border: 1px solid rgba(224,82,82,.3); }
  .cm-tp { background: rgba(34,197,94,.10); border: 1px solid rgba(34,197,94,.4); }
  .cm-num { font-size: 1.4rem; font-weight: 700; }
  .cm-lbl { font-size: .62rem; text-transform: uppercase; letter-spacing: 1px; margin-top: .15rem; }

  /* ── Bar chart ────────────────────────────────────────────── */
  .bar-track { background: rgba(0,0,0,.08); border-radius: 4px; height: 22px; overflow: hidden; width: 100%; }
  .bar-fill-gold { background: var(--gold); border-radius: 4px; height: 100%; display: flex; align-items: center; padding-left: .4rem; color: var(--dark); font-size: .7rem; font-weight: 700; white-space: nowrap; }
  .bar-fill-dark { background: var(--dark); border-radius: 4px; height: 100%; }
  .bar-fill-gray { background: #9AA0B0; border-radius: 4px; height: 100%; }

  /* ── Vertical bar chart (slide 5) ─────────────────────────── */
  .vbar-wrap { display: flex; align-items: flex-end; gap: .5rem; height: 120px; }
  .vbar-col  { display: flex; flex-direction: column; align-items: center; flex: 1; }
  .vbar-fill { width: 100%; border-radius: 4px 4px 0 0; }
  .vbar-lbl  { font-size: .65rem; text-align: center; margin-top: .25rem; color: var(--gray); }
  .vbar-val  { font-size: .7rem; font-weight: 700; margin-bottom: .15rem; }

  /* ── Funnel / narrowing list (slide 10) ─────────────────────── */
  .funnel-step { display: flex; align-items: center; padding: .5rem .8rem; border-radius: 8px; margin-bottom: .35rem; font-size: .8rem; font-weight: 600; }

  /* ── Footer bar ───────────────────────────────────────────── */
  .slide-footer { position: absolute; bottom: 0; left: 0; right: 0; height: 4%; display: flex; align-items: center; padding: 0 3%; font-size: .58rem; }
  .footer-dark  { background: rgba(0,0,0,.2); color: var(--muted); }
  .footer-light { background: rgba(30,39,97,.06); color: var(--gray); border-top: 1px solid rgba(30,39,97,.1); }

  /* ── Insight box on dark slides ────────────────────────────── */
  .insight-box-dark { background: rgba(201,162,39,.12); border: 1px solid rgba(201,162,39,.4); border-left: 4px solid var(--gold); border-radius: 8px; padding: .75rem 1rem; }
  .insight-box-light { background: rgba(30,39,97,.05); border: 1px solid rgba(30,39,97,.15); border-left: 4px solid var(--dark); border-radius: 8px; padding: .75rem 1rem; }

  /* ── Two-column recommendation boxes (slide 11) ───────────── */
  .rec-box { background: rgba(255,255,255,.06); border: 1px solid rgba(201,162,39,.25); border-radius: 12px; padding: .85rem 1rem; }
  .rec-title { font-weight: 700; font-size: .88rem; color: var(--gold2); margin-bottom: .4rem; }

  /* ── Interactive demo slide ───────────────────────────────── */
  .demo-shell { position: absolute; left: 5%; top: 20%; width: 90%; height: 69%; display: grid; grid-template-columns: 1fr 2.1fr; gap: 1rem; }
  .demo-panel { border: 1px solid rgba(30,39,97,.12); border-radius: 10px; background: #F4F7FF; padding: 1rem; }
  .demo-form { height: 100%; overflow: auto; border: 1px solid rgba(30,39,97,.12); border-radius: 10px; background: #F8FAFF; padding: .75rem; overscroll-behavior: contain; }
  .demo-form .space-y-5 { display: flex; flex-direction: column; gap: .65rem; }
  .demo-form form.space-y-5 { gap: .65rem; }
  .demo-form .predictor-group { padding: .85rem !important; border-radius: 8px !important; }
  .demo-form h2 { margin-bottom: .65rem !important; font-size: .58rem !important; letter-spacing: 1.4px !important; }
  .demo-form label { font-size: .64rem !important; }
  .demo-form input,
  .demo-form select { height: 2rem !important; border-radius: 6px !important; font-size: .68rem !important; }
  .demo-form button[type='submit'] { height: 2.35rem !important; border-radius: 8px !important; background: var(--gold) !important; color: var(--dark) !important; font-size: .7rem !important; }
  .demo-form [role='alert'],
  .demo-form form + div { border-radius: 8px !important; padding: .85rem !important; }
`;

/* ─── Footer component ────────────────────────────────────────────────────── */
function Footer({ dark, section, num }: { dark?: boolean; section: string; num: number }) {
  const cls = dark ? 'slide-footer footer-dark' : 'slide-footer footer-light';
  return (
    <div className={cls}>
      <span style={{ flex: 1 }}>Allianz&nbsp;·&nbsp;Predicción de Direct Debit con ML</span>
      <span style={{ flex: 1, textAlign: 'center' }}>{section}</span>
      <span style={{ flex: 1, textAlign: 'right' }}>{num}</span>
    </div>
  );
}

/* ─── Logo placeholder (Allianz eagle) ────────────────────────────────────── */
function AllianzLogo({ invert }: { invert?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
      <img src="/pptx-assets/image-1-1.png" alt="Allianz" style={{ height: 32, filter: invert ? 'brightness(0) invert(1)' : 'none' }} />
    </div>
  );
}

export default function PresentationSlidesV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<RevealApi | null>(null);
  const [slideLabel, setSlideLabel] = useState('1 / 13');

  useEffect(() => {
    let mounted = true;
    let handleSlideChanged: (() => void) | null = null;
    const updateSlideLabel = (deck: RevealApi) => {
      const slides = Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>('.slides > section:not([data-visibility="uncounted"])') ?? [],
      );
      const currentSlide = deck.getCurrentSlide() as HTMLElement | undefined;
      const current = currentSlide?.parentElement?.classList.contains('stack')
        ? currentSlide.parentElement
        : currentSlide;
      const index = Math.max(slides.indexOf(current as HTMLElement), 0) + 1;
      setSlideLabel(`${index} / ${slides.length}`);
    };
    const injectCss = (href: string, id: string) => {
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet'; link.href = href;
      document.head.appendChild(link);
    };
    const init = async () => {
      injectCss('https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reset.css', 'rvl-rst-v2');
      injectCss('https://cdn.jsdelivr.net/npm/reveal.js@6.0.1/dist/reveal.css', 'rvl-css-v2');
      const { default: Reveal } = await import('reveal.js');
      if (!mounted || !containerRef.current) return;
      const deck = new Reveal(containerRef.current, {
        hash: true,
        slideNumber: false,
        progress: true,
        controls: true,
        center: false, transition: 'fade', transitionSpeed: 'fast',
        backgroundTransition: 'fade', width: 1280, height: 720,
        margin: 0.02, minScale: 0.15, maxScale: 2.0,
      });
      await deck.initialize();
      handleSlideChanged = () => updateSlideLabel(deck);
      deck.on('slidechanged', handleSlideChanged);
      if (mounted) {
        deckRef.current = deck;
        updateSlideLabel(deck);
      }
    };
    // eslint-disable-next-line no-void
    void init();
    return () => {
      mounted = false;
      if (handleSlideChanged) {
        deckRef.current?.off('slidechanged', handleSlideChanged);
      }
      deckRef.current?.destroy();
      deckRef.current = null;
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="reveal" ref={containerRef}>
        <div className="slides">

          {/* ══════════════════════════════════════════════════════════
               SLIDE 1 · PORTADA
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-dark" style={{ padding: '0' }}>
              {/* Logo top-left */}
              <div style={{ position: 'absolute', left: '6.4%', top: '12.7%' }}>
                <AllianzLogo />
              </div>
              {/* Eyebrow */}
              <div className="t-eyebrow" style={{ position: 'absolute', left: '13.9%', top: '14.1%', width: '67.5%' }}>
                ALLIANZ BENELUX&nbsp;&nbsp;·&nbsp;&nbsp;DATA &amp; ANALYTICS OFFICE
              </div>
              {/* Main title */}
              <div className="t-title-white" style={{ position: 'absolute', left: '6.4%', top: '30%', width: '75%' }}>
                Predicción de Direct Debit
              </div>
              <div className="t-title-gold" style={{ position: 'absolute', left: '6.4%', top: '42%', width: '75%' }}>
                con Machine Learning
              </div>
              {/* Subtitle */}
              <div className="t-body-dark" style={{ position: 'absolute', left: '6.6%', top: '58%', width: '73.5%', fontSize: '.92rem', lineHeight: 1.7 }}>
                Cómo identificar a los contratos con mayor potencial de adopción para priorizar campañas comerciales, fortalecer el flujo de efectivo y acortar el ciclo de conversión de caja.
              </div>
              {/* Presentado a */}
              <div style={{ position: 'absolute', left: '6.6%', top: '82%', width: '63.7%' }}>
                <span className="t-body-dark"><span style={{ color: 'var(--gold)', fontWeight: 700 }}>Presentado a:&nbsp;&nbsp;</span>Junta Directiva&nbsp;·&nbsp;Chief Data &amp; Analytics Officer</span>
              </div>
              {/* Equipo */}
              <div style={{ position: 'absolute', left: '70.5%', top: '82%', width: '22.5%', textAlign: 'right' }}>
                <span className="t-body-dark"><span style={{ color: 'var(--gold)', fontWeight: 700 }}>Equipo&nbsp;&nbsp;</span>Data Analytics</span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 2 · LA PREGUNTA DE NEGOCIO
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-dark">
              <div className="t-section" style={{ position: 'absolute', left: '6%', top: '9.3%' }}>LA PREGUNTA DE NEGOCIO</div>
              <div className="t-slide-h2-dark" style={{ position: 'absolute', left: '6%', top: '15.3%', width: '88%', fontSize: '1.55rem' }}>
                Solo el 21% de los contratos de Allianz se pagan por Direct Debit,<br />frente al 65% del mercado.
              </div>

              {/* Metric 1: 21% */}
              <div style={{ position: 'absolute', left: '7.1%', top: '39%', width: '26%', textAlign: 'center' }}>
                <div className="metric-num-big" style={{ color: '#F87171' }}>21%</div>
                <div className="metric-lbl" style={{ color: 'var(--muted)' }}>Adopción actual de<br />Direct Debit en Allianz</div>
              </div>
              {/* Metric 2: 65% */}
              <div style={{ position: 'absolute', left: '36.8%', top: '39%', width: '26%', textAlign: 'center' }}>
                <div className="metric-num-big" style={{ color: 'var(--gold2)' }}>65%</div>
                <div className="metric-lbl" style={{ color: 'var(--muted)' }}>Promedio del mercado<br />asegurador</div>
              </div>
              {/* Metric 3: 44 pts */}
              <div style={{ position: 'absolute', left: '66.4%', top: '39%', width: '26%', textAlign: 'center' }}>
                <div className="metric-num-big" style={{ color: 'var(--green)' }}>44 pts</div>
                <div className="metric-lbl" style={{ color: 'var(--muted)' }}>Brecha de oportunidad<br />por capturar</div>
              </div>

              {/* Insight box */}
              <div className="insight-box-dark" style={{ position: 'absolute', left: '6%', top: '68%', width: '88%' }}>
                <div style={{ fontWeight: 700, color: 'var(--gold2)', marginBottom: '.3rem', fontSize: '.9rem' }}>
                  El reto no es lanzar una campaña masiva.
                </div>
                <div className="t-body-dark">
                  Allianz quiere una forma inteligente de identificar a los contratos más prometedores y concentrar el esfuerzo comercial donde la probabilidad de conversión es alta.
                </div>
              </div>
              <Footer dark num={2} section="La pregunta de negocio" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 3 · POR QUÉ IMPORTA
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>POR QUÉ IMPORTA</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                El valor de negocio de Direct Debit para Allianz
              </div>

              {/* 4 value columns */}
              {[
                { icon: '💰', title: 'Flujo de efectivo confiable', body: 'Allianz sabe con precisión cuándo y cuánto entra, mejorando el forecast y la planeación financiera.', left: '4.5%' },
                { icon: '⏱️', title: 'Ciclo de caja más corto', body: 'Acorta el período de cobro de cuentas por cobrar y reduce el tiempo que el efectivo queda inmovilizado (CCC).', left: '27%' },
                { icon: '📉', title: 'Menor costo operativo', body: 'Reduce el esfuerzo manual de facturación y cobranza, simplificando el proceso administrativo.', left: '49.5%' },
                { icon: '🔒', title: 'Mayor retención', body: 'Los pagos continúan salvo solicitud explícita del cliente, lo que disminuye la tasa de cancelación (churn).', left: '72%' },
              ].map((v) => (
                <div key={v.title} style={{ position: 'absolute', left: v.left, top: '28%', width: '21%' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '.4rem' }}>{v.icon}</div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.85rem', marginBottom: '.35rem' }}>{v.title}</div>
                  <div className="t-body-light" style={{ fontSize: '.78rem' }}>{v.body}</div>
                </div>
              ))}

              {/* CRISP-DM note */}
              <div className="insight-box-light" style={{ position: 'absolute', left: '4.5%', top: '70%', width: '91%' }}>
                <span style={{ fontWeight: 700, color: 'var(--dark)' }}>Marco estratégico (CRISP-DM).&nbsp;&nbsp;</span>
                <span className="t-body-light">El modelo predictivo es la fase de modelado de un proyecto que termina en una estrategia accionable: una lista priorizada de contratos para que Marketing y Comercial actúen con foco, no a ciegas.</span>
              </div>
              <Footer num={3} section="Contexto de negocio" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 4 · NUESTRO ENFOQUE
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>NUESTRO ENFOQUE</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                De datos crudos a un modelo accionable
              </div>

              {/* 5-step pipeline */}
              {[
                { num: 1, title: 'Limpieza', body: 'Duplicados eliminados, target validado (0/1), tipos numéricos corregidos. Se conserva «No age» = empresas.', left: '4.5%' },
                { num: 2, title: 'Anti-fuga', body: 'Se eliminan IDs de cliente, contrato y broker para que el modelo aprenda patrones, no memorice registros.', left: '22.5%' },
                { num: 3, title: 'Feature engineering', body: 'Variables con lógica de negocio: frecuencia de pago, pagos por año, log de prima y conteos de relación.', left: '40.5%' },
                { num: 4, title: 'Encoding', body: 'Imputación y escalado de numéricas; One-Hot Encoding de categóricas para el entrenamiento.', left: '58.5%' },
                { num: 5, title: 'Modelado', body: 'Baselines + Regresión Logística vs. Random Forest y XGBoost, evaluados sobre el mismo conjunto de prueba.', left: '76.5%' },
              ].map((step) => (
                <div key={step.num} style={{ position: 'absolute', left: step.left, top: '26%', width: '17%' }}>
                  <div className="step-num step-num-gold" style={{ marginBottom: '.5rem' }}>{step.num}</div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.82rem', marginBottom: '.3rem' }}>{step.title}</div>
                  <div className="t-body-light" style={{ fontSize: '.75rem' }}>{step.body}</div>
                </div>
              ))}

              {/* Connecting arrows between steps */}
              {[1,2,3,4].map((i) => (
                <div key={i} style={{ position: 'absolute', left: `${22.5 + (i-1)*18}%`, top: '29.5%', color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>→</div>
              ))}

              {/* Note box */}
              <div className="insight-box-light" style={{ position: 'absolute', left: '4.5%', top: '70%', width: '91%' }}>
                <span style={{ fontWeight: 700, color: 'var(--dark)' }}>Variables clave creadas:&nbsp;&nbsp;</span>
                <span className="t-body-light" style={{ fontSize: '.78rem' }}>
                  Monthly_mandatory_direct_debit (Allianz obliga Direct Debit en contratos mensuales)&nbsp;·&nbsp;Payments_per_year&nbsp;·&nbsp;Annual_premium_log1p&nbsp;·&nbsp;conteos cliente/broker&nbsp;·&nbsp;cercanía geográfica cliente-broker.
                </span>
              </div>
              <Footer num={4} section="Metodología" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 5 · RESULTADOS PRINCIPALES
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>RESULTADOS PRINCIPALES</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                XGBoost: desempeño de grado productivo
              </div>

              {/* 4 metric boxes */}
              {[
                { val: '98.5%', lbl: 'ACCURACY',  left: '4.5%',  top: '28%', color: 'var(--dark)' },
                { val: '99.8%', lbl: 'PRECISION', left: '26%',   top: '28%', color: '#0079C0' },
                { val: '93.2%', lbl: 'RECALL',    left: '4.5%',  top: '56%', color: 'var(--dark)' },
                { val: '96.4%', lbl: 'F1-SCORE',  left: '26%',   top: '56%', color: 'var(--gold)' },
              ].map((m) => (
                <div key={m.lbl} style={{ position: 'absolute', left: m.left, top: m.top, width: '18%', textAlign: 'center' }}>
                  <div className="metric-num-med" style={{ color: m.color, fontSize: '2.4rem' }}>{m.val}</div>
                  <div className="metric-lbl" style={{ color: 'var(--gray)', fontSize: '.65rem', letterSpacing: '2px' }}>{m.lbl}</div>
                </div>
              ))}

              {/* ROC-AUC & AP */}
              <div style={{ position: 'absolute', left: '4.5%', top: '78%', width: '40%' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ background: 'var(--dark)', color: 'var(--white)', fontWeight: 700, fontSize: '.85rem', padding: '.2rem .7rem', borderRadius: 4 }}>ROC-AUC 0.982</span>
                  <span style={{ background: 'var(--gold)', color: 'var(--dark)', fontWeight: 700, fontSize: '.75rem', padding: '.2rem .7rem', borderRadius: 4 }}>Average Precision 0.973</span>
                </div>
              </div>

              {/* F1-Score bar chart */}
              <div style={{ position: 'absolute', left: '47%', top: '24%', width: '49%' }}>
                <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.8rem', marginBottom: '.7rem' }}>
                  Comparación contra los baselines (F1-Score)
                </div>
                {[
                  { label: 'XGBoost', val: 0.9638, color: 'var(--gold)', textColor: 'var(--dark)' },
                  { label: 'Reg. Logística', val: 0.9635, color: 'var(--dark)', textColor: 'var(--white)' },
                  { label: 'Baseline\n(clase mayoritaria)', val: 0, color: '#9AA0B0', textColor: 'var(--white)' },
                ].map((b) => (
                  <div key={b.label} style={{ marginBottom: '.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--gray)', marginBottom: '.2rem' }}>
                      <span>{b.label.replace('\n', ' ')}</span>
                      <span style={{ fontWeight: 700 }}>{b.val > 0 ? (b.val * 100).toFixed(1) + '%' : '0%'}</span>
                    </div>
                    <div className="bar-track" style={{ height: 28 }}>
                      <div style={{ width: `${b.val * 100}%`, background: b.color, height: '100%', borderRadius: 4, minWidth: b.val > 0 ? 4 : 0 }} />
                    </div>
                  </div>
                ))}
                <div className="insight-box-light" style={{ marginTop: '.6rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--dark)' }}>El modelo aporta valor real.&nbsp;&nbsp;</span>
                  <span className="t-body-light" style={{ fontSize: '.74rem' }}>El baseline acierta 79% solo prediciendo la clase mayoritaria, pero no detecta ni un solo caso de Direct Debit (F1 = 0).</span>
                </div>
              </div>
              <Footer num={5} section="Resultados · Métricas" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 6 · CALIDAD DE LAS PREDICCIONES
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>CALIDAD DE LAS PREDICCIONES</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                Matriz de confusión: muy pocos errores costosos
              </div>

              {/* Confusion matrix */}
              <div style={{ position: 'absolute', left: '2%', top: '26%', width: '55%' }}>
                {/* Labels */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 4, fontWeight: 700, fontSize: '.72rem', color: 'var(--dark)', textAlign: 'center', marginBottom: 4 }}>
                  <div />
                  <div style={{ background: 'rgba(30,39,97,.08)', padding: '.3rem', borderRadius: '6px 0 0 0' }}>No DD</div>
                  <div style={{ background: 'rgba(30,39,97,.08)', padding: '.3rem', borderRadius: '0 6px 0 0' }}>Direct Debit</div>
                </div>
                {/* Row: No DD */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 4, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 700, fontSize: '.72rem', color: 'var(--dark)', paddingRight: '.4rem' }}>No DD</div>
                  <div className="cm-cell cm-tn">
                    <div className="cm-num" style={{ color: 'var(--dark)' }}>71,394</div>
                    <div className="cm-lbl" style={{ color: 'var(--gray)' }}>Verdaderos negativos</div>
                  </div>
                  <div className="cm-cell cm-fp">
                    <div className="cm-num" style={{ color: 'var(--red)' }}>31</div>
                    <div className="cm-lbl" style={{ color: 'var(--red)' }}>Falsos positivos</div>
                  </div>
                </div>
                {/* Row: Direct Debit */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 700, fontSize: '.72rem', color: 'var(--dark)', paddingRight: '.4rem' }}>Direct<br />Debit</div>
                  <div className="cm-cell cm-fn">
                    <div className="cm-num" style={{ color: 'var(--red)' }}>1,298</div>
                    <div className="cm-lbl" style={{ color: 'var(--red)' }}>Falsos negativos</div>
                  </div>
                  <div className="cm-cell cm-tp">
                    <div className="cm-num" style={{ color: '#16A34A' }}>17,709</div>
                    <div className="cm-lbl" style={{ color: '#16A34A' }}>Verdaderos positivos</div>
                  </div>
                </div>
                {/* Axis labels */}
                <div style={{ textAlign: 'center', marginTop: '.35rem', fontSize: '.65rem', color: 'var(--gray)' }}>← Predicción →</div>
                <div style={{ position: 'absolute', left: 0, top: '55%', transform: 'rotate(-90deg) translateX(-50%)', fontSize: '.65rem', color: 'var(--gray)', transformOrigin: 'left center', whiteSpace: 'nowrap' }}>← Real →</div>
              </div>

              {/* Interpretation */}
              <div style={{ position: 'absolute', left: '58%', top: '26%', width: '38%', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div className="card-w" style={{ borderLeft: '3px solid #22C55E' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.82rem', marginBottom: '.2rem' }}>Solo 31 falsos positivos</div>
                  <div className="t-body-light" style={{ fontSize: '.76rem' }}>Casi nunca recomienda contactar a un cliente equivocado → precision del 99.8% y eficiencia de campaña.</div>
                </div>
                <div className="card-w" style={{ borderLeft: '3px solid var(--red)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.82rem', marginBottom: '.2rem' }}>1,298 falsos negativos</div>
                  <div className="t-body-light" style={{ fontSize: '.76rem' }}>Algunas oportunidades reales aún no se detectan → recall del 93.2%, margen de mejora identificado.</div>
                </div>
                <div className="card-w" style={{ borderLeft: '3px solid var(--dark)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.82rem', marginBottom: '.2rem' }}>Foco comercial limpio</div>
                  <div className="t-body-light" style={{ fontSize: '.76rem' }}>La lista de contactos generada es altamente confiable: minimiza el desperdicio de presupuesto de marketing.</div>
                </div>
              </div>
              <Footer num={6} section="Resultados · Errores" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 7 · PODER DE DISCRIMINACIÓN
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>PODER DE DISCRIMINACIÓN</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                Curvas ROC y Precision-Recall
              </div>

              {/* ROC Curve */}
              <div style={{ position: 'absolute', left: '4.5%', top: '26%', width: '43%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.85rem' }}>Curva ROC</div>
                  <div style={{ background: 'var(--dark)', color: 'var(--gold2)', fontWeight: 700, fontSize: '1.1rem', padding: '.15rem .6rem', borderRadius: 6 }}>0.98</div>
                </div>
                <img src="/pptx-assets/image-7-1.png" alt="Curva ROC" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(30,39,97,.1)' }} />
                <div className="t-body-light" style={{ marginTop: '.5rem', fontSize: '.76rem' }}>
                  AUC de 0.98: separa de forma excelente los contratos que usan Direct Debit de los que no.
                </div>
              </div>

              {/* PR Curve */}
              <div style={{ position: 'absolute', left: '53%', top: '26%', width: '43%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.85rem' }}>Curva Precision-Recall</div>
                  <div style={{ background: 'var(--gold)', color: 'var(--dark)', fontWeight: 700, fontSize: '1.1rem', padding: '.15rem .6rem', borderRadius: 6 }}>0.97</div>
                </div>
                <img src="/pptx-assets/image-7-2.png" alt="Curva Precision-Recall" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(30,39,97,.1)' }} />
                <div className="t-body-light" style={{ marginTop: '.5rem', fontSize: '.76rem' }}>
                  AP de 0.97: mantiene alta precisión incluso al capturar gran parte de los positivos — clave con datos desbalanceados.
                </div>
              </div>
              <Footer num={7} section="Resultados · Discriminación" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 8 · QUÉ IMPULSA LA DECISIÓN
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>QUÉ IMPULSA LA DECISIÓN</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                Variables más influyentes en la adopción
              </div>

              {/* Feature importance horizontal bar chart */}
              <div style={{ position: 'absolute', left: '4%', top: '26%', width: '52%' }}>
                <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.75rem', marginBottom: '.6rem' }}>Importancia relativa (XGBoost)</div>
                {[
                  { label: 'Frecuencia mensual',                val: 0.8105, color: 'var(--gold)' },
                  { label: 'Direct Debit mensual obligatorio',  val: 0.1574, color: 'var(--dark)' },
                  { label: 'Pagos por año',                     val: 0.0189, color: '#4A7FC1' },
                  { label: 'Otras variables',                   val: 0.0126, color: '#9AA0B0' },
                  { label: 'Frecuencia trimestral',             val: 0.0006, color: '#9AA0B0' },
                ].map((f) => (
                  <div key={f.label} style={{ marginBottom: '.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--gray)', marginBottom: '.18rem' }}>
                      <span>{f.label}</span>
                      <span style={{ fontWeight: 700 }}>{(f.val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div style={{ width: `${f.val / 0.8105 * 100}%`, background: f.color, height: '100%', borderRadius: 4, minWidth: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Interpretation */}
              <div style={{ position: 'absolute', left: '59%', top: '26%', width: '38%', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div className="card-w card-w-border-l">
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.84rem', marginBottom: '.3rem' }}>
                    La forma de pago lo explica casi todo
                  </div>
                  <div className="t-body-light" style={{ fontSize: '.76rem' }}>
                    La frecuencia mensual concentra el 81% de la importancia. Tiene sentido: Allianz obliga Direct Debit en contratos mensuales, así que el modelo aprende esta regla operativa.
                  </div>
                </div>
                <div className="card-w" style={{ borderLeft: '4px solid #4A7FC1' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.84rem', marginBottom: '.3rem' }}>
                    Recomendación técnica
                  </div>
                  <div className="t-body-light" style={{ fontSize: '.76rem' }}>
                    Para una versión más exigente, entrenar un modelo sin las variables de pago mensual para descubrir patrones secundarios (segmento, broker, geografía) y enriquecer la estrategia comercial.
                  </div>
                </div>
              </div>
              <Footer num={8} section="Resultados · Interpretabilidad" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 9 · DECISIÓN DE MODELO
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>DECISIÓN DE MODELO</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                XGBoost vs. Random Forest: el tipo de error decide
              </div>

              {/* Random Forest card */}
              <div className="card-w" style={{ position: 'absolute', left: '4.5%', top: '27%', width: '41%', borderTop: '3px solid var(--gray)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1rem' }}>Random Forest</div>
                  <div style={{ background: 'var(--gray)', color: 'var(--white)', fontWeight: 700, fontSize: '.62rem', padding: '.15rem .5rem', borderRadius: 4, letterSpacing: 1 }}>CONSERVADOR</div>
                </div>
                {[
                  ['Accuracy', '98.54%'],
                  ['Precision', '100.0%'],
                  ['Recall', '93.04%'],
                  ['ROC-AUC', '0.980'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,39,97,.08)', padding: '.28rem 0', fontSize: '.8rem' }}>
                    <span style={{ color: 'var(--gray)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem', fontSize: '.78rem' }}>
                  <span style={{ color: 'var(--gray)' }}>Falsos positivos <strong style={{ color: 'var(--dark)' }}>0</strong></span>
                  <span style={{ color: 'var(--gray)' }}>Falsos neg. <strong style={{ color: 'var(--red)' }}>1,323</strong></span>
                </div>
              </div>

              {/* XGBoost card */}
              <div className="card-w" style={{ position: 'absolute', left: '54%', top: '27%', width: '41%', borderTop: '3px solid var(--gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '1rem' }}>XGBoost</div>
                  <div style={{ background: 'var(--gold)', color: 'var(--dark)', fontWeight: 700, fontSize: '.62rem', padding: '.15rem .5rem', borderRadius: 4, letterSpacing: 1 }}>SELECCIONADO</div>
                </div>
                {[
                  ['Accuracy', '98.53%'],
                  ['Precision', '99.83%'],
                  ['Recall', '93.17%'],
                  ['ROC-AUC', '0.982'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,39,97,.08)', padding: '.28rem 0', fontSize: '.8rem' }}>
                    <span style={{ color: 'var(--gray)' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: v === '0.982' ? 'var(--gold)' : 'var(--dark)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem', fontSize: '.78rem' }}>
                  <span style={{ color: 'var(--gray)' }}>Falsos positivos <strong style={{ color: 'var(--red)' }}>31</strong></span>
                  <span style={{ color: 'var(--gray)' }}>Falsos neg. <strong style={{ color: 'var(--red)' }}>1,298</strong></span>
                </div>
              </div>

              {/* Decision rationale */}
              <div className="insight-box-light" style={{ position: 'absolute', left: '4.5%', top: '70%', width: '91%' }}>
                <span style={{ fontWeight: 700, color: 'var(--dark)' }}>Elegimos XGBoost.&nbsp;&nbsp;</span>
                <span className="t-body-light" style={{ fontSize: '.78rem' }}>
                  Ambos modelos son válidos y casi idénticos en exactitud. Random Forest es más conservador (0 falsos positivos); XGBoost detecta más oportunidades reales con mejor recall, ROC-AUC y Average Precision. Como el objetivo es <strong style={{ color: 'var(--dark)' }}>capturar el mayor número de oportunidades de conversión</strong>, XGBoost es la opción más alineada al negocio.
                </span>
              </div>
              <Footer num={9} section="Decisión de modelo" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 10 · RESULTADO DE NEGOCIO
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>RESULTADO DE NEGOCIO</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                Una lista priorizada, lista para activar
              </div>

              {/* Candidate contracts box */}
              <div className="card-w card-w-border-l" style={{ position: 'absolute', left: '4.5%', top: '26%', width: '44%' }}>
                <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.9rem', marginBottom: '.5rem' }}>
                  📋 Contratos candidatos a Direct Debit
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Contratos que hoy NO usan Direct Debit pero tienen alta probabilidad de adoptarlo.',
                    'Probabilidad estimada entre ~0.50 y ~0.71 para los principales candidatos.',
                    'Concentrados en segmento Retail, con frecuencia de pago Quarterly.',
                    'Líneas predominantes: Liability, Property, Accident y Motor.',
                  ].map((item) => (
                    <li key={item} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', padding: '.3rem 0', borderBottom: '1px solid rgba(30,39,97,.08)', fontSize: '.78rem', color: 'var(--gray)' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Funnel */}
              <div style={{ position: 'absolute', left: '53%', top: '26%', width: '43%' }}>
                <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.85rem', marginBottom: '.8rem', textAlign: 'center' }}>
                  De campaña masiva a foco quirúrgico
                </div>
                {[
                  { label: 'Toda la base de contratos', w: '100%', bg: 'rgba(30,39,97,.12)', color: 'var(--dark)' },
                  { label: 'Sin Direct Debit hoy', w: '80%', bg: 'rgba(30,39,97,.20)', color: 'var(--dark)' },
                  { label: 'Alta probabilidad (modelo)', w: '60%', bg: 'var(--dark)', color: 'var(--white)' },
                  { label: 'Campaña priorizada', w: '40%', bg: 'var(--gold)', color: 'var(--dark)' },
                ].map((step) => (
                  <div key={step.label} style={{ display: 'flex', justifyContent: 'center', marginBottom: '.3rem' }}>
                    <div className="funnel-step" style={{ width: step.w, background: step.bg, color: step.color, justifyContent: 'center', fontSize: '.75rem', padding: '.4rem .8rem', transition: 'width .3s' }}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              <Footer num={10} section="Resultado de negocio" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 11 · RECOMENDACIÓN
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-dark">
              <div className="t-section" style={{ position: 'absolute', left: '6%', top: '9.3%', color: 'var(--gold)' }}>RECOMENDACIÓN</div>
              <div className="t-slide-h2-dark" style={{ position: 'absolute', left: '6%', top: '14.7%', width: '88%', fontSize: '1.5rem' }}>
                Implementar XGBoost para dirigir campañas de Direct Debit
              </div>

              {/* 4 recommendation boxes */}
              <div style={{ position: 'absolute', left: '6%', top: '37%', width: '88%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: '🚀', title: 'Activar', body: 'Entregar la lista priorizada a Marketing y Comercial para una campaña piloto enfocada en los candidatos de mayor probabilidad.' },
                  { icon: '📐', title: 'Medir incrementalidad', body: 'Diseñar un grupo de control para cuantificar la conversión real atribuible al modelo y el impacto en el CCC.' },
                  { icon: '🔬', title: 'Robustecer el modelo', body: 'Reentrenar sin las variables de pago mensual para descubrir señales secundarias y reducir la dependencia de una regla operativa.' },
                  { icon: '📈', title: 'Monitorear y escalar', body: 'Vigilar el recall en producción, recalibrar periódicamente y extender el enfoque a otras líneas y mercados Benelux.' },
                ].map((r) => (
                  <div key={r.title} className="rec-box">
                    <div style={{ fontSize: '1.2rem', marginBottom: '.3rem' }}>{r.icon}</div>
                    <div className="rec-title">{r.title}</div>
                    <div className="t-body-dark" style={{ fontSize: '.78rem' }}>{r.body}</div>
                  </div>
                ))}
              </div>
              <Footer dark num={11} section="Recomendación · Siguientes pasos" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 12 · DEMO INTERACTIVA
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-light">
              <div className="t-section" style={{ position: 'absolute', left: '4.5%', top: '5.6%', color: 'var(--dark)' }}>DEMO INTERACTIVA</div>
              <div className="t-slide-h2-light" style={{ position: 'absolute', left: '4.5%', top: '10%', width: '91%' }}>
                Probar el predictor de Direct Debit en vivo
              </div>

              <div className="demo-shell">
                <div className="demo-panel">
                  <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '.9rem', marginBottom: '.55rem' }}>
                    Del modelo a una decisión operativa
                  </div>
                  <div className="t-body-light" style={{ fontSize: '.76rem', lineHeight: 1.65, marginBottom: '.8rem' }}>
                    Ingresa los atributos de un contrato y ejecuta la predicción para obtener la probabilidad estimada de adopción de domiciliación bancaria.
                  </div>
                  {[
                    ['Entrada', 'Datos de póliza, cliente y mediador'],
                    ['Modelo', 'XGBoost entrenado con variables codificadas'],
                    ['Salida', 'Probabilidad, clase y confianza'],
                  ].map(([label, body]) => (
                    <div key={label} style={{ borderTop: '1px solid rgba(30,39,97,.1)', padding: '.55rem 0' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</div>
                      <div className="t-body-light" style={{ fontSize: '.72rem' }}>{body}</div>
                    </div>
                  ))}
                </div>

                <div className="demo-form" onWheel={(event) => event.stopPropagation()}>
                  <DirectDebitPredictorForm useDivSections />
                </div>
              </div>
              <Footer num={12} section="Demo interactiva" />
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
               SLIDE 13 · CIERRE
          ══════════════════════════════════════════════════════════ */}
          <section>
            <div className="s-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              {/* Logo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <img src="/pptx-assets/image-12-1.png" alt="Allianz" style={{ height: 52 }} />
              </div>

              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: 'var(--white)', marginBottom: '.8rem', maxWidth: '70%', lineHeight: 1.3 }}>
                Convertir datos en flujo de efectivo
              </div>
              <div className="t-body-dark" style={{ maxWidth: '65%', fontSize: '.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,.8)', marginBottom: '2rem' }}>
                Un modelo de grado productivo (98.5% accuracy, ROC-AUC 0.98) que transforma la pregunta del consejo en una lista accionable: campañas con foco, menos gasto desperdiciado y un ciclo de caja más corto.
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--gold2)', marginBottom: '.4rem' }}>
                Gracias&nbsp;·&nbsp;Preguntas y discusión
              </div>
              <div className="t-body-dark" style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                Equipo de Data Analytics&nbsp;·&nbsp;Allianz Benelux Data &amp; Analytics Office
              </div>
            </div>
          </section>

        </div>
        <div className="deck-slide-number">{slideLabel}</div>
      </div>
    </>
  );
}
