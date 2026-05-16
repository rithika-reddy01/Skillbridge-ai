import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function PublicHeader() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            SkillBridge<span className="text-gradient">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/features" className="hover:text-foreground transition">Features</Link>
          <Link to="/about" className="hover:text-foreground transition">About</Link>
          <Link to="/contact" className="hover:text-foreground transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-gradient-brand text-primary-foreground border-0">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-brand text-primary-foreground border-0">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-brand grid place-items-center">
            <Sparkles className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">SkillBridge<span className="text-gradient">AI</span></span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/features" className="hover:text-foreground">Features</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} SkillBridge AI
        </div>
      </div>
    </footer>
  );
}
