"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateBusinessSettings } from "../actions/settings-actions";
import { BusinessLogo } from "./business-logo";
import { ImagePlus, X } from "lucide-react";

const PRESET_COLORS = [
  "#000000", "#1e293b", "#7c3aed", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#0284c7",
  "#db2777", "#ffffff",
];

type Business = { name: string; logoUrl?: string | null; logoBgColor?: string | null } | null;

export function BusinessSettingsForm({ business }: { business: Business }) {
  const [name, setName] = useState(business?.name ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(business?.logoUrl ?? null);
  const [logoBgColor, setLogoBgColor] = useState(business?.logoBgColor ?? "#000000");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await updateBusinessSettings({ name, logoUrl, logoBgColor });
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Configuración guardada");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <Label>Logo del negocio</Label>
        <div className="flex items-center gap-4">
          <BusinessLogo name={name || "Mi Negocio"} logoUrl={logoUrl} bgColor={logoBgColor} size="lg" />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Subir imagen
            </Button>
            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => {
                  setLogoUrl(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
                Quitar imagen
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {logoUrl ? "Imagen personalizada" : "Mostrando iniciales por defecto"}
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Color de fondo del logo</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => setLogoBgColor(color)}
              className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
              style={{
                backgroundColor: color,
                borderColor: logoBgColor === color ? "oklch(var(--ring))" : "transparent",
                boxShadow: color === "#ffffff" ? "inset 0 0 0 1px #e2e8f0" : undefined,
              }}
            />
          ))}
          <button
            type="button"
            title="Color personalizado"
            onClick={() => colorInputRef.current?.click()}
            className="w-7 h-7 rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground text-xs font-bold hover:border-muted-foreground transition-colors"
          >
            +
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={logoBgColor}
            onChange={(e) => setLogoBgColor(e.target.value)}
            className="sr-only"
          />
          <span className="text-xs text-muted-foreground ml-1 font-mono">{logoBgColor}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-name">Nombre del negocio</Label>
        <Input
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: La Fresona"
          className="h-12"
          maxLength={60}
          required
        />
        <p className="text-xs text-muted-foreground">
          Las iniciales del nombre se usan como logo por defecto
        </p>
      </div>

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
