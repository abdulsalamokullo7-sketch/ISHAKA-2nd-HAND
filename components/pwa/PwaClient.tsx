"use client";

import { useCallback, useEffect, useState } from "react";
import { APP_NAME } from "@/lib/constants";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ishaka-pwa-install-dismissed";

/** Registers the service worker + shows install UI (Android: native prompt; iOS: instructions). */
export function PwaClient() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setShowPrompt(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const check = () => {
      setStandalone(
        mq.matches ||
          (window.navigator as Navigator & { standalone?: boolean })
            .standalone === true,
      );
    };
    check();
    mq.addEventListener("change", check);
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream,
    );
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* non-fatal */
      });
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  if (standalone || dismissed || !showPrompt) return null;

  if (deferred) {
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-[190] mx-auto max-w-md rounded-2xl border border-isha-border bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] md:bottom-6 md:left-auto md:right-6 md:mx-0"
        role="dialog"
        aria-label="Install app"
      >
        <p className="text-sm font-bold text-isha-text">Install {APP_NAME}</p>
        <p className="mt-1 text-xs text-isha-text-muted">
          Add to your home screen for a full-screen app experience.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="flex-1 rounded-xl bg-isha-primary px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-isha-primary-dark"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-isha-border px-4 py-2.5 text-sm font-semibold text-isha-text hover:bg-isha-muted"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (ios) {
    return (
      <div
        className="fixed bottom-20 left-4 right-4 z-[190] mx-auto max-w-md rounded-2xl border border-isha-border bg-white p-4 shadow-lg md:bottom-6 md:left-auto md:right-6 md:mx-0"
        role="status"
      >
        <p className="text-sm font-bold text-isha-text">Install on iPhone</p>
        <p className="mt-1 text-xs leading-relaxed text-isha-text-muted">
          Tap{" "}
          <span className="font-semibold text-isha-text">Share</span>{" "}
          <span aria-hidden>□↑</span> then{" "}
          <span className="font-semibold text-isha-text">Add to Home Screen</span>.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-xl border border-isha-border py-2 text-sm font-semibold text-isha-text hover:bg-isha-muted"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return null;
}
