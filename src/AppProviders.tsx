import { Suspense, lazy, useEffect, useState } from "react";

const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <DeferredUi>{children}</DeferredUi>
);

const DeferredUi = ({ children }: { children: React.ReactNode }) => {
  const [mountUi, setMountUi] = useState(false);

  useEffect(() => {
    const enable = () => setMountUi(true);
    const onIdle = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(enable, { timeout: 6000 });
        return;
      }
      window.setTimeout(enable, 3000);
    };

    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, enable, { passive: true, once: true }));
    window.addEventListener("load", onIdle, { once: true });

    return () => {
      events.forEach((name) => window.removeEventListener(name, enable));
      window.removeEventListener("load", onIdle);
    };
  }, []);

  return (
    <>
      {children}
      {mountUi && (
        <Suspense fallback={null}>
          <Toaster />
          <Sonner />
        </Suspense>
      )}
    </>
  );
};
