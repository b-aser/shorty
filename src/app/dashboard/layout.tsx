import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-muted/40" suppressHydrationWarning>
      <Navbar user={session.user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}