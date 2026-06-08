'use client';

import { useEffect } from 'react';

// Unregisters any stale service workers left by a previous project on this
// origin (e.g. a CRA app). Without this, the old SW can intercept requests
// and redirect-loop the browser on the first visit.
export default function ServiceWorkerReset() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((reg) => reg.unregister())),
      )
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
  }, []);

  return null;
}
