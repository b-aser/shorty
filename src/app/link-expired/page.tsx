export default function LinkExpired() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <h1 className="text-4xl font-bold">Link Expired</h1>
        <p className="text-muted-foreground">This link has passed its expiry date.</p>
        <a href="/" className="text-primary underline underline-offset-4">Go home</a>
      </div>
    );
  }