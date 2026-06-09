import type { Metadata } from 'next';
import PresentationSlides from '@/components/PresentationSlides';

export const metadata: Metadata = {
  title: 'Allianz · Modelo ML Débito Directo — Revisión Técnica',
  description:
    'Presentación de revisión técnica del modelo de predicción de débito directo de Allianz, construido con machine learning supervisado sobre 452,222 contratos de seguro.',
};

export default function PresentationPage() {
  return <PresentationSlides />;
}
