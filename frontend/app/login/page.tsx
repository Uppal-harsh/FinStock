"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Phone, Smartphone, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep("otp");
      } else {
        setError(data.detail || "Failed to send OTP. Please check your number.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store token and user data
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push("/");
        router.refresh();
      } else {
        setError(data.detail || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Unable to verify OTP. Please try later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card p-8 shadow-2xl backdrop-blur-sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            {step === "phone" ? <Smartphone className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <h2 className="mt-6 text-3xl font-bold font-[var(--font-space)] tracking-tight">
            {step === "phone" ? "Welcome Back" : "One-Time Password"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {step === "phone" 
              ? "Identify yourself via mobile to access intelligence" 
              : `We've sent a 6-digit code to your mobile`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form 
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} 
              className="mt-8 space-y-6"
            >
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted/60">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+91 99999 99999"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20 text-center">
                  {error}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Secure OTP
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP} 
              className="mt-8 space-y-6"
            >
              <div className="space-y-2 text-center">
                <label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-muted/60">
                  Authentication Code
                </label>
                <div className="flex justify-center gap-2">
                   <Input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="0 0 0 0 0 0"
                    className="text-center text-3xl font-mono tracking-[0.5em] py-8 w-full"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded border border-destructive/20 text-center">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Verify and Login
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full text-xs text-muted hover:text-primary transition-colors text-center"
                >
                  Back to mobile entry
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-center text-[10px] text-muted/60 uppercase tracking-[0.2em] leading-relaxed">
            Secure Authentication powered by Twilio Verify<br/>
            Forensics Intelligence is strictly restricted
          </p>
        </div>
      </motion.div>
    </div>
  );
}
