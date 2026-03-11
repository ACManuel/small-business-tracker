"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createBusinessUser, deleteBusinessUser } from "../actions/settings-actions";
import { Trash2, UserPlus, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "member">("member");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createBusinessUser({ name, email, password, role });
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuario creado correctamente");
      setName("");
      setEmail("");
      setPassword("");
      setRole("member");
      setShowForm(false);
    }
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`¿Eliminar a ${userName}? Esta acción no se puede deshacer.`))
      return;
    const result = await deleteBusinessUser(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Usuario eliminado");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-xl border bg-background"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                {user.role === "owner" ? "Dueño" : "Miembro"}
              </Badge>
              {user.id !== currentUserId && user.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(user.id, user.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <Button
          variant="outline"
          className="w-full h-12 gap-2"
          onClick={() => setShowForm(true)}
        >
          <UserPlus className="h-4 w-4" />
          Agregar usuario
        </Button>
      ) : (
        <div className="rounded-xl border bg-background p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Nuevo usuario</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Nombre</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: María"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-11"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("member")}
                  className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                    role === "member"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  Miembro
                  <span className="block text-xs font-normal opacity-70">Solo ventas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                    role === "owner"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  Dueño
                  <span className="block text-xs font-normal opacity-70">Acceso completo</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 h-11" disabled={loading}>
                {loading ? "Creando..." : "Crear cuenta"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
