import { siteConfig } from "@/site.config";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground">{siteConfig.tagline}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-label="Contact details" className="rounded-xl border p-4" />
        <aside aria-label="QR code preview" className="rounded-xl border p-4 md:sticky md:top-4" />
      </div>
    </main>
  );
}
