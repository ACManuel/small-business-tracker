"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Detecta cuando la sesión expira en el cliente y redirige al login.
 * Se monta en el dashboard layout para que cubra todas las páginas protegidas.
 */
export function AuthGuard() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return null;
}
