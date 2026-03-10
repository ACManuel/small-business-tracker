"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada (modo standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    // Capturar evento de instalación (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setInstallEvent(null);
      setInstalled(true);
    }
  };

  if (isInstalled || installed) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Smartphone className="h-5 w-5 shrink-0 text-green-500" />
        <span>La app ya está instalada en este dispositivo.</span>
      </div>
    );
  }

  if (isIos) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3 text-sm">
          <Share className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">Instalar en iPhone / iPad</p>
            <p className="text-muted-foreground">
              Abre esta página en <strong>Safari</strong>, toca el botón{" "}
              <strong>Compartir</strong> (
              <span className="font-mono text-xs bg-muted px-1 rounded">⬆</span>
              ) y luego <strong>"Agregar a pantalla de inicio"</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!installEvent) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Smartphone className="h-5 w-5 shrink-0" />
        <span>
          Para instalar la app, abre esta página en{" "}
          <strong>Chrome</strong> en tu dispositivo Android.
        </span>
      </div>
    );
  }

  return (
    <Button onClick={handleInstall} className="w-full gap-2">
      <Download className="h-4 w-4" />
      Instalar app en este dispositivo
    </Button>
  );
}
