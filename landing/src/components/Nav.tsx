import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#211a29]/90 backdrop-blur-md px-2 py-2 shadow-2xl">
        <span className="font-heading font-bold tracking-tight pl-3 pr-2 text-sm">MoneyMachine</span>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Button asChild variant="outline" size="sm" className="rounded-full border-white/15 bg-transparent ml-1">
          <a href="/app">Dashboard</a>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <a href="#cta">Book a call</a>
        </Button>
      </div>
    </header>
  );
}
