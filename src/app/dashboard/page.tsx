import { getSession } from "@/lib/session";
import { getLinksByUser } from "@/lib/services/links";
import { CreateLinkForm } from "@/components/create-link-form";
import { LinksTable } from "@/components/links-table";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const links = await getLinksByUser(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Links</h1>
        <p className="text-muted-foreground mt-1">
          {links.length} link{links.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <CreateLinkForm />
      <LinksTable links={links as any} />
    </div>
  );
}