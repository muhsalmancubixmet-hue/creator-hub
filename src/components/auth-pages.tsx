import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { creator } from "@/lib/creator-data";
import { demoAuth } from "@/lib/demo-auth";

function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return <div className="grid min-h-screen bg-background lg:grid-cols-2">
    <div className="relative hidden overflow-hidden lg:block"><img src={creator.cover} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" /><div className="absolute bottom-10 left-10 right-10 text-primary-foreground"><p className="font-display text-4xl leading-tight">Discover influencers anywhere in the world.</p><p className="mt-3 text-sm text-primary-foreground/70">Your creator workspace for profile, portfolio and partnerships.</p></div></div>
    <div className="grid place-items-center px-5 py-10"><div className="w-full max-w-sm"><div className="mb-8 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-coral text-primary-foreground"><Sparkles className="size-4" /></span><strong>Influencers.com</strong></div><h1 className="font-display text-4xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{sub}</p><div className="mt-8">{children}</div></div></div>
  </div>;
}

export function LoginPage() {
  const navigate = useNavigate();
  const enter = (email: string) => { demoAuth.signIn(email); void navigate({ to: "/" }); };
  return <Shell title="Welcome back" sub="Sign in to your creator workspace.">
    <Button className="h-14 w-full bg-coral text-base font-extrabold text-primary-foreground shadow-lg hover:bg-coral/90" onClick={() => { enter(creator.email); toast.success(`Signed in as ${creator.name} (demo)`); }}><Zap />One-Click Demo Access (Enter as {creator.name})</Button>
    <div className="my-6 flex items-center gap-3 text-[10px] font-bold text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
    <form className="grid gap-4" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const email = String(f.get("email")); if (!email.includes("@") || !String(f.get("password"))) { toast.error("Enter your email and password"); return; } enter(email); }}>
      <label className="grid gap-2 text-xs font-bold">Email<Input name="email" type="email" placeholder="you@example.com" /></label>
      <label className="grid gap-2 text-xs font-bold">Password<Input name="password" type="password" placeholder="••••••••" /></label>
      <Button type="submit" variant="outline">Sign in</Button>
    </form>
    <p className="mt-6 text-center text-xs text-muted-foreground">New creator? <Link to="/signup" className="font-bold text-foreground underline">Create an account</Link></p>
  </Shell>;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState<string | null>(null);
  return <Shell title={sent ? "Check your inbox" : "Join as a creator"} sub={sent ? `We sent a magic sign-in link to ${sent}.` : "Enter your email and we'll send a magic sign-in link."}>
    {sent ? <div className="creator-card space-y-4 p-5 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-soft text-teal"><Mail /></span><p className="text-sm font-bold">Magic link sent to your inbox — click here to enter</p><Button className="w-full" onClick={() => { demoAuth.signIn(sent); void navigate({ to: "/" }); }}>Open magic link (demo)</Button></div>
      : <form className="grid gap-4" onSubmit={e => { e.preventDefault(); const email = String(new FormData(e.currentTarget).get("email")); if (!email.includes("@")) { toast.error("Enter a valid email"); return; } setSent(email); }}>
        <label className="grid gap-2 text-xs font-bold">Email<Input name="email" type="email" placeholder="you@example.com" /></label>
        <Button type="submit">Send magic link</Button>
      </form>}
    <p className="mt-6 text-center text-xs text-muted-foreground">Already have an account? <Link to="/login" className="font-bold text-foreground underline">Sign in</Link></p>
  </Shell>;
}
