"use client";

import { useState, Suspense } from "react"; // ✅ Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

// 1. Rename your existing component to "RegisterContent"
// and remove the 'export default'
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-Login immediately
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created, but failed to sign in automatically.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSocialSignUp = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Visuals & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#d9633c] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full border-[100px] border-white/50" />
          <div className="absolute top-[-10%] left-[-15%] w-[90vw] h-[90vw] rounded-full border-[80px] border-white/40" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight">Analyz</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-regular tracking-tight mb-4 leading-tight">
            Go ahead, start your "journey".
          </h1>
          <p className="text-white text-lg leading-relaxed">
            Join the internet's favorite club of freelancers and business
            owners—because what could possibly go wrong?
          </p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex items-center justify-center p-8 bg-white text-black">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-medium tracking-tight mb-2">
              Create your account
            </h2>
            <p className="text-gray-500">
              Join the party. Set up your account with social or email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => handleSocialSignUp("google")}
              className="flex items-center justify-center gap-2 border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <FcGoogle size={20} />
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignUp("github")}
              className="flex items-center justify-center gap-2 border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <FaGithub size={20} />
              GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
