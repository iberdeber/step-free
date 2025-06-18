/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = isSignIn
        ? await signIn(email, password)
        : await signUp(email, password);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Redirect after successful authentication
      router.push("/");
    } catch (error: any) {
      setError(error.message || "An error occurred during authentication");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
        <p
          className="cursor-pointer text-center text-blue-500"
          onClick={() => setIsSignIn((prev) => !prev)}
        >
          {isSignIn
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </p>
      </form>
    </div>
  );
}
