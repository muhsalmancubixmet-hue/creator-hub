import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { creator } from "@/lib/creator-data";
import { demoAuth } from "@/lib/demo-auth";
import { authService } from "@/lib/auth-service";
import { creatorApi } from "@/lib/creator-api";

function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={creator.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <p className="font-display text-4xl leading-tight">Discover influencers anywhere in the world.</p>
          <p className="mt-3 text-sm text-primary-foreground/70">Your creator workspace for profile, portfolio and partnerships.</p>
        </div>
      </div>
      <div className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-coral text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <strong>Influencers.com</strong>
          </div>
          <h1 className="font-display text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));

    if (!email.includes("@") || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email, password });
      demoAuth.signIn(email);
      toast.success("Welcome back!");
      void navigate({ to: "/" });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell title="Welcome back" sub="Sign in to your creator workspace.">
      <form className="grid gap-4" onSubmit={handleLogin}>
        <label className="grid gap-2 text-xs font-bold">
          Email
          <Input name="email" type="email" placeholder="you@example.com" required autoFocus />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Password
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
        <Button type="submit" className="w-full bg-coral font-bold text-primary-foreground hover:bg-coral/90" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        New creator? <Link to="/signup" className="font-bold text-foreground underline">Create an account</Link>
      </p>
    </Shell>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const username = String(f.get("username")).trim().replace(/^@/, "");

    if (!email.includes("@") || !username) {
      toast.error("Please enter both email and username.");
      return;
    }

    setLoading(true);
    try {
      await creatorApi.registerCreator({
        email,
        username,
      });
      setSent(email);
      toast.success("Account created! Magic login link sent to your email.");
    } catch (err: any) {
      let errorMsg = "Registration failed. Please try again.";
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMsg = "Request timed out. The server took too long to respond. Please try again.";
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.detail === "string") {
          errorMsg = data.detail;
        } else if (Array.isArray(data.email) && data.email.length > 0) {
          errorMsg = data.email[0];
        } else if (Array.isArray(data.username) && data.username.length > 0) {
          errorMsg = data.username[0];
        } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
          errorMsg = data.non_field_errors[0];
        } else if (typeof data === "object") {
          const firstVal = Object.values(data)[0];
          errorMsg = Array.isArray(firstVal) ? String(firstVal[0]) : (typeof firstVal === "string" ? firstVal : JSON.stringify(data));
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      title={sent ? "Check your inbox" : "Join as a creator"}
      sub={sent ? `We dispatched a magic login link to ${sent}.` : "Enter your email and username to create your creator workspace."}
    >
      {sent ? (
        <div className="creator-card space-y-4 p-5 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-soft text-teal">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="text-base font-bold">Magic Link Dispatched</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We sent a welcome email to <strong className="text-foreground">{sent}</strong> with your one-click dashboard login button and credentials.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Click <strong>Log In to Dashboard</strong> in your email to sign in instantly.
          </p>
          <Button
            className="w-full bg-coral text-primary-foreground hover:bg-coral/90"
            onClick={() => void navigate({ to: "/login" })}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSignup}>
          <label className="grid gap-2 text-xs font-bold">
            Username
            <Input name="username" placeholder="e.g. mayasharma" required autoFocus />
          </label>
          <label className="grid gap-2 text-xs font-bold">
            Email
            <Input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <Button type="submit" disabled={loading} className="mt-2 h-11 bg-coral text-primary-foreground hover:bg-coral/90">
            {loading ? "Creating account..." : "Register & Send Magic Link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account? <Link to="/login" className="font-bold text-foreground underline">Sign in</Link>
      </p>
    </Shell>
  );
}
