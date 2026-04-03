"use client";

import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/calendar";

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch {
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const errorMessage = searchParams.get("error");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_70%_90%,rgba(139,92,246,0.05),transparent_50%)]" />
        <div className="grid-background absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo + heading */}
        <motion.div
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="mb-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <div className="liquid-glass-elevated mb-5 flex size-14 items-center justify-center rounded-2xl">
            <CalendarIcon className="size-6 text-white/90" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sign in to Zero
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            AI-powered calendar, built for focus
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="liquid-glass-elevated overflow-hidden rounded-2xl p-5"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          transition={{ ...spring, delay: 0.12 }}
        >
          {(error || errorMessage) && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-3 text-[13px] leading-snug text-red-300">
              {error || errorMessage}
            </div>
          )}

          <motion.button
            className="liquid-glass-input group flex h-12 w-full items-center justify-center gap-3 rounded-xl text-[13px] font-medium text-white transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-40"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
          >
            {isLoading ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                <span className="text-white/70">Signing in…</span>
              </>
            ) : (
              <>
                <svg className="size-[18px]" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-[11px] leading-relaxed text-white/25"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          By continuing you agree to our{" "}
          <Link className="text-white/35 underline decoration-white/10 underline-offset-2 transition-colors hover:text-white/50" href="/terms">
            Terms
          </Link>{" "}
          and{" "}
          <Link className="text-white/35 underline decoration-white/10 underline-offset-2 transition-colors hover:text-white/50" href="/privacy">
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
