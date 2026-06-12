import Link from "next/link";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart2,
  Heart,
  Link2,
  Lock,
  QrCode,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant shortening",
    desc: "Paste a long URL and get a shareable short link in under a second.",
  },
  {
    icon: Target,
    title: "Custom vanity codes",
    desc: "Choose memorable slugs like /launch instead of random characters.",
  },
  {
    icon: BarChart2,
    title: "Click analytics",
    desc: "Track clicks by country, device, browser, and referer over time.",
  },
  {
    icon: Sparkles,
    title: "UTM builder",
    desc: "Attach campaign parameters and preview the final destination URL.",
  },
  {
    icon: Lock,
    title: "Password protection",
    desc: "Gate sensitive links behind a password before visitors are redirected.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    desc: "Download a QR code for every link — perfect for print and events.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-4 w-4" />
            </span>
            Snip
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
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

      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.85_0.08_186),transparent)]"
          aria-hidden
        />
        <div className="container relative mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="space-y-8 text-center lg:text-left">
            <Badge variant="secondary" className="text-sm">
              Free · No credit card required
            </Badge>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Short links with{" "}
                <span className="text-primary">serious analytics</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
                Snip turns long URLs into branded short links you can protect,
                track, and optimize — with UTM campaigns, QR codes, and real-time
                click insights built in.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button size="lg" asChild>
                <Link href={session ? "/dashboard" : "/sign-up"}>
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {!session && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {["Custom codes", "UTM tracking", "Password gates", "QR export"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Live preview
              </p>
              <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                <div className="truncate text-sm text-muted-foreground">
                  https://example.com/blog/launch-announcement?utm_source=newsletter
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-primary">
                    snip.link/launch
                  </span>
                  <Badge variant="secondary">12 clicks</Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg border bg-background p-3">
                  <p className="font-semibold">68%</p>
                  <p className="text-muted-foreground">Mobile</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="font-semibold">US</p>
                  <p className="text-muted-foreground">Top country</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="font-semibold">UTM</p>
                  <p className="text-muted-foreground">Attached</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold">Everything in one dashboard</h2>
            <p className="mt-3 text-muted-foreground">
              Create, edit, and analyze links without switching tools.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-2xl space-y-6 px-4 py-24 text-center">
        <h2 className="font-heading text-4xl font-bold">Ready to snip your first link?</h2>
        <p className="text-muted-foreground">
          Join for free and start shortening, protecting, and tracking links in seconds.
        </p>
        <Button size="lg" asChild>
          <Link href={session ? "/dashboard" : "/sign-up"}>
            Get started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
        © {new Date().getFullYear()} Snip · Built with <Heart className="h-4 w-4 " /> by <Link href="https://github.com/b-aser" className="underline">Aser</Link>
      </footer>
    </div>
  );
}
