import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <span className="font-semibold tracking-tight">TheLeadMachine</span>
        <Button asChild size="sm">
          <a href="#cta">Book a call</a>
        </Button>
      </div>
    </header>
  );
}
