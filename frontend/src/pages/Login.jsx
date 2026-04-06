import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin, useRegister, useMe } from "../hooks/useAuth";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

export default function Login() {
  const navigate = useNavigate();
  const { data: user, isLoading: userIsLoading } = useMe();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin({
    onSuccess: () => navigate("/", { replace: true }),
  });

  const registerMutation = useRegister({
    onSuccess: () => {
      loginMutation.mutate({ username, password });
    },
  });

  const handleSubmit = () => {
    if (!username || !password) return;

    if (isRegistering) {
      if (!email || password.length < 8) return;
      registerMutation.mutate({ username, email, password });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isPasswordTooShort = isRegistering && password.length > 0 && password.length < 8;
  const isPending = loginMutation.isPending || registerMutation.isPending;
  const isError = loginMutation.isError || registerMutation.isError;
  const error = loginMutation.error || registerMutation.error;

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <SiteHeader isLoading={userIsLoading} user={user} />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 p-8 bg-stone-900 rounded-2xl shadow-xl border border-stone-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-stone-100">
              {isRegistering ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-sm text-stone-400">
              {isRegistering ? "Join the story today" : "Sign in to continue your story"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 transition"
              />

              {isRegistering && (
                <p className={`text-[10px] mt-1 font-medium italic ${
                  isPasswordTooShort ? "text-red-400" : "text-stone-500"
                }`}>
                  Minimum 8 characters required.
                </p>
              )}

            </div>
          </div>

          {isError && (
            <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">
              {error.message}
            </p>
          )}

          <div className="space-y-4 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold transition shadow-lg shadow-amber-900/10"
            >
              {isPending ? "Processing..." : isRegistering ? "Create account" : "Sign in"}
            </button>

            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-sm text-stone-500 hover:text-stone-300 transition font-medium"
            >
              {isRegistering ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}