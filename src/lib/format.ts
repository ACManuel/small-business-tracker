const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateLong(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Devuelve "YYYY-MM-DD" usando la hora LOCAL del dispositivo (no UTC)
function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getToday(): string {
  return localDateString(new Date());
}

export function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // retrocede al lunes
  // Crear fecha a medianoche LOCAL para evitar desfase UTC
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return localDateString(monday);
}

export function getStartOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
