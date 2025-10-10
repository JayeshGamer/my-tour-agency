"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, AlertCircle, Compass, ArrowRight } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { toast } from "react-hot-toast";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
        toast.error(signUpError.message || "Signup failed");
      } else if (data) {
        toast.success("Account created successfully!");
        // Auto sign in after successful signup
        try {
          const { data: signInData, error: signInError } = await signIn.email({
            email,
            password,
          });

          if (signInError) {
            toast.error("Account created but failed to sign in. Please try logging in.");
            router.push("/login");
          } else if (signInData) {
            router.push("/");
            router.refresh();
          }
        } catch (signInErr) {
          console.error("Auto sign-in error:", signInErr);
          toast.error("Account created successfully. Please sign in.");
          router.push("/login");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const { data, error: authError } = await signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (authError) {
        setError("Failed to sign up with Google: " + authError.message);
        toast.error("Google sign-up failed");
      }
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      setError("Failed to sign up with Google. Please try again.");
      toast.error("Google sign-up failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#030712]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Centered Form Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-12">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 group mb-8">
            <Compass className="h-8 w-8 text-[#030712] dark:text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-bold text-[#030712] dark:text-white">TravelCo</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-black/5 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-[#030712] dark:text-white">Create Account</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Join us and start exploring</p>
            </div>

            {/* Google Sign Up */}
            <Button
              variant="outline"
              className="w-full h-11 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-[#030712] dark:text-white hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-black/10 dark:bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-500 dark:text-gray-400 font-medium">Or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-[#030712] dark:text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 pl-10 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-[#030712] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black/20 dark:focus:border-white/40 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-[#030712] dark:text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-[#030712] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black/20 dark:focus:border-white/40 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-[#030712] dark:text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-[#030712] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black/20 dark:focus:border-white/40 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-[#030712] dark:text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pl-10 bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-[#030712] dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-black/20 dark:focus:border-white/40 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <RainbowButton
                type="submit"
                className="w-full h-11 text-sm font-semibold mt-6"
                disabled={isLoading}
                variant="black"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </RainbowButton>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-[#030712] dark:text-white font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#030712] dark:hover:text-white transition-colors">
            <Compass className="h-3 w-3" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
