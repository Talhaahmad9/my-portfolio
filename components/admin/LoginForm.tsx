"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.error ?? "Login failed. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  const handleEnterPress = (key: string): void => {
    if (key === "Enter") {
      void handleLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-orangeWeb/20 bg-oxfordBlue p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-orangeWeb/20 p-2 text-orangeWeb">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-orangeWeb">Admin</p>
            <h1 className="text-2xl font-semibold text-white">Talha Ahmad</h1>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-platinum">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => handleEnterPress(event.key)}
              autoComplete="email"
              className="w-full rounded-md border border-platinum/25 bg-black px-3 py-2.5 text-platinum outline-none transition-colors placeholder:text-platinum/50 focus:border-orangeWeb"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-platinum">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => handleEnterPress(event.key)}
                autoComplete="current-password"
                className="w-full rounded-md border border-platinum/25 bg-black px-3 py-2.5 pr-10 text-platinum outline-none transition-colors placeholder:text-platinum/50 focus:border-orangeWeb"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-platinum/80 transition-colors hover:text-orangeWeb"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="button"
            onClick={() => void handleLogin()}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-orangeWeb px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
