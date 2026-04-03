import { useState } from "react";
import { useLogin } from "../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleLogin = () => {
    if (!username || !password) return;
    login({ username, password });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="w-full max-w-sm space-y-6 p-8 bg-stone-900 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-stone-100">Welcome back</h1>
          <p className="text-sm text-stone-400">Sign in to continue your story</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="your_username"
              className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {isError && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">
            {error.message}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={isPending}
          className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-semibold transition"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}