import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { creatorApi } from "@/lib/creator-api";
import { demoAuth } from "@/lib/demo-auth";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verifying Session — Influencers.com" },
      { name: "description", content: "Authenticating your creator session." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function executeVerification() {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");

      if (!token) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage("No verification token found in URL. Please use the link provided in your email.");
        }
        return;
      }

      try {
        const res = await creatorApi.verifyEmail(token);

        if (!isMounted) return;

        // Persist JWT session tokens
        if (res.access) {
          localStorage.setItem("access_token", res.access);
        }
        if (res.refresh) {
          localStorage.setItem("refresh_token", res.refresh);
        }

        // Persist creator session context
        const user = res.user || {};
        demoAuth.signIn(user.email || "creator@influencers.com");

        localStorage.setItem(
          "influencers.creator-session",
          JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.display_name || user.handle || "Creator",
            handle: user.handle || "creator",
            role: user.role || "CREATOR",
            profile_id: user.profile_id,
          })
        );

        setStatus("success");
        toast.success("Email verified! Welcome to your dashboard.");

        // Seamless 1-click transition straight to creator dashboard
        setTimeout(() => {
          void navigate({ to: "/" });
        }, 1200);

      } catch (err: any) {
        if (!isMounted) return;
        const detail = err.response?.data?.detail;
        const msg = typeof detail === "object" ? JSON.stringify(detail) : (detail || "Invalid or expired verification token.");
        setStatus("error");
        setErrorMessage(msg);
        toast.error(msg);
      }
    }

    void executeVerification();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-coral text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <strong className="text-lg">Influencers.com</strong>
        </div>

        {status === "loading" && (
          <div className="space-y-4 py-6">
            <Loader2 className="mx-auto size-10 animate-spin text-coral" />
            <h2 className="font-display text-2xl font-bold">Verifying your magic link</h2>
            <p className="text-sm text-muted-foreground">
              Authenticating credentials and preparing your creator dashboard...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-soft text-teal">
              <CheckCircle2 className="size-7" />
            </span>
            <h2 className="font-display text-2xl font-bold">Welcome aboard!</h2>
            <p className="text-sm text-muted-foreground">
              Your email was verified successfully. Redirecting straight to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="size-7" />
            </span>
            <h2 className="font-display text-2xl font-bold">Verification Failed</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-4 flex flex-col gap-2.5">
              <Button asChild className="w-full bg-coral text-primary-foreground hover:bg-coral/90">
                <Link to="/signup">Register Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Sign in with Password</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
