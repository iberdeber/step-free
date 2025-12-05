/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

function getSupabaseError(err : any): string // helper method that normalizes Supabase errors
{
  if (!err) return "Unknown error occurred";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error) return err.error;
  return String(err);
}


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      if (isSignIn) {
        const response = await signIn(email, password);
        
        if (response.error) { 
            setError(getSupabaseError(response.error));
            return;
          }
          
        // Successful sign in
        setIsLoggedIn(true);
        setSuccess("Login successful. Happy Travels!"); // gives message ensuring successful login
        setTimeout(() => {router.push("/");}, 1500); // redirects after one second
        
      } else {
        const response = await signUp(email, password);
        if (response.error) {
          setError(response.error);
          return;
        }
        // Show success message for signup
        setSuccess(response.data?.message || "Successfully signed up! Please check your email.");
        // Switch to sign in mode
        setIsSignIn(true);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
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
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
          disabled={isLoading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:border-blue-500"
          disabled={isLoading}
          required
          minLength={8}
        />
        <button
          type="submit"
          className={`${
            isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white p-2 rounded transition flex justify-center items-center`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-block animate-spin mr-2">⌛</span>
          ) : null}
          {isSignIn ? "Sign In" : "Sign Up"}
        </button>
        
        <p
          className="cursor-pointer text-center text-blue-500"
          onClick={() => {
            if (!isLoading) {
              setIsSignIn((prev) => !prev);
              setError("");
              setSuccess("");
            }
          }}
        >
          {isSignIn
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </p>
      </form>
    </div>
  );
}
