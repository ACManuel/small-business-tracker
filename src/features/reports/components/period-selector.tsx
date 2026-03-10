"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Period = "week" | "month";

export function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex bg-muted rounded-lg p-1 gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1 h-8 text-xs",
          value === "week" && "bg-background shadow-sm"
        )}
        onClick={() => onChange("week")}
      >
        Esta semana
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1 h-8 text-xs",
          value === "month" && "bg-background shadow-sm"
        )}
        onClick={() => onChange("month")}
      >
        Este mes
      </Button>
    </div>
  );
}
