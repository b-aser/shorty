import Link from "next/link";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart2, Link2, Shield, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            ✂️ Shorty
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 max-w-4xl py-24 text-center space-y-6">
        <Badge variant="secondary" className="text-sm">
          Free to use · No credit card required
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
          Short links that{" "}
          <span className="text-primary">mean business</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Shorten, share, and track your links in seconds.
          Get click analytics, device breakdowns, and QR codes — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button size="lg" asChild>
            <Link href={session ? "/dashboard" : "/sign-up"}>
              Start for free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          {!session && (
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40">
        <div className="container mx-auto px-4 max-w-6xl py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Instant shortening",
                desc: "Paste a URL and get a short link in under a second.",
              },
              {
                icon: <BarChart2 className="w-6 h-6 text-primary" />,
                title: "Click analytics",
                desc: "Track clicks by country, device, and browser in real time.",
              },
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: "Link controls",
                desc: "Enable, disable, or set expiry dates on any link.",
              },
              {
                icon: <Link2 className="w-6 h-6 text-primary" />,
                title: "QR codes",
                desc: "Every link gets a QR code you can download instantly.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-background rounded-xl border p-6 space-y-3">
                {f.icon}
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 max-w-2xl py-24 text-center space-y-6">
        <h2 className="text-4xl font-bold">Ready to snip?</h2>
        <p className="text-muted-foreground">
          Join for free and start shortening links in seconds.
        </p>
        <Button size="lg" asChild>
          <Link href={session ? "/dashboard" : "/sign-up"}>
            Get started <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Snip. Built with Next.js, Drizzle & BetterAuth.
      </footer>
    </div>
  );
}