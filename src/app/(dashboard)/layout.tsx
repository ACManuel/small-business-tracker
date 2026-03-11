import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BottomNav } from "@/features/navigation/components/bottom-nav";
import { TopBar } from "@/features/navigation/components/top-bar";
import { AuthGuard } from "@/components/auth-guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const businessId = session.user?.businessId;
  const userRole = session.user?.role;
  let businessName = "Mi Negocio";
  let businessLogoUrl: string | null = null;
  let businessLogoBgColor = "#000000";

  if (businessId) {
    const [biz] = await db
      .select({ name: businesses.name, logoUrl: businesses.logoUrl, logoBgColor: businesses.logoBgColor })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    if (biz) {
      businessName = biz.name;
      businessLogoUrl = biz.logoUrl;
      businessLogoBgColor = biz.logoBgColor ?? "#000000";
    }
  }

  return (
    <div className="min-h-dvh bg-muted/30 pb-20">
      <AuthGuard />
      <TopBar
        userName={session.user?.name ?? "Usuario"}
        businessName={businessName}
        businessLogoUrl={businessLogoUrl}
        businessLogoBgColor={businessLogoBgColor}
        role={userRole}
      />
      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
      <BottomNav role={userRole} />
    </div>
  );
}
