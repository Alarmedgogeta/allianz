import type { Metadata } from 'next';
import PresentationSlidesV2 from '@/components/PresentationSlidesV2';

export const metadata: Metadata = {
  title: 'Allianz · Direct Debit ML Model — Technical Review',
  description:
    'Technical review of the Allianz direct debit adoption prediction model, built with supervised machine learning across 452,222 insurance contracts.',
};

export default function PresentationV2Page() {
  return <PresentationSlidesV2 />;
}
