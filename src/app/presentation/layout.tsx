import type { ReactNode } from 'react';

export default function PresentationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-white">{children}</div>
  );
}
