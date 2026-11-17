import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { creatorApi } from "@/lib/creator-api";

export const Route = createFileRoute("/revoke")({
  head: () => ({
    meta: [
      { title: "Revoke Registration — Influencers.com" },
      { name: "description", content: "Revoke unconfirmed creator registration." },
    ],
  }),
  component: RevokePage,
});

function RevokePage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function executeRevocation() {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");

      if (!token) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage("No revocation token provided in the link.");
        }
        return;
      }

      try {
        await creatorApi.revokeRegistration(token);
        if (!isMounted) return;
        setStatus("success");
        toast.info("Registration successfully revoked.");
      } catch (err: any) {
        if (!isMounted) return;
        const detail = err.response?.data?.detail;
        const msg =
          typeof detail === "object"
            ? JSON.stringify(detail)
            : detail || "Invalid or expired revocation link.";
        setStatus("error");
        setErrorMessage(msg);
      }
    }

    void executeRevocation();

    return () => {
      isMounted = false;
    };
  }, []);

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
            <h2 className="font-display text-2xl font-bold">Revoking Registration</h2>
            <p className="text-sm text-muted-foreground">
              Cancelling pending account and protecting your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-6">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-soft text-teal">
              <ShieldCheck className="size-7" />
            </span>
            <h2 className="font-display text-2xl font-bold">Registration Revoked</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The pending account associated with this email has been cancelled and deactivated. No
              further action is required.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full bg-coral text-primary-foreground hover:bg-coral/90">
                <Link to="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="size-7" />
            </span>
            <h2 className="font-display text-2xl font-bold">Revocation Link Invalid</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
