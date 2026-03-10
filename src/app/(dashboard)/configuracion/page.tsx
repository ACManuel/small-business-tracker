import { auth } from "@/lib/auth";
import {
  getBusinessSettings,
  getBusinessUsers,
} from "@/features/settings/actions/settings-actions";
import { BusinessSettingsForm } from "@/features/settings/components/business-settings-form";
import { UsersManager } from "@/features/settings/components/users-manager";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function ConfiguracionPage() {
  const session = await auth();
  const [business, users] = await Promise.all([
    getBusinessSettings(),
    getBusinessUsers(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza tu negocio y gestiona los accesos
        </p>
      </div>

      <Tabs defaultValue="negocio">
        <TabsList className="w-full">
          <TabsTrigger value="negocio" className="flex-1">
            Negocio
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex-1">
            Usuarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="negocio" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del negocio</CardTitle>
              <CardDescription>
                Personaliza el nombre e icono que aparecen en la app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessSettingsForm business={business} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuarios con acceso</CardTitle>
              <CardDescription>
                Agrega o elimina cuentas de familiares que usan la app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersManager
                users={users}
                currentUserId={session?.user?.id ?? ""}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instalar aplicación</CardTitle>
          <CardDescription>
            Agrega la app a la pantalla de inicio de tu celular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PwaInstallButton />
        </CardContent>
      </Card>
    </div>
  );
}
