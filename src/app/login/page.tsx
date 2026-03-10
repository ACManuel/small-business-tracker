import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <span className="text-2xl font-bold">MN</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Negocio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control de ventas y gastos
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
