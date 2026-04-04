import { useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import SiteHeader from "./Header";
import SiteFooter from "./Footer";

export default function UserCard({ user }) {
  const navigate = useNavigate();
  const logout = useLogout({
    onSuccess: () => navigate("/", { replace: true }),
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={false} user={user} />

      {/* --- body --- */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm p-8 bg-stone-900 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-500 uppercase tracking-wider">
              Logged in as
            </p>
            <h2 className="text-2xl font-bold text-stone-100">{user.username}</h2>
          </div>

          <div className="space-y-2 text-sm text-stone-400 bg-stone-800 rounded-lg p-4 font-mono">
            <p><span className="text-stone-500">id:</span> {user.id}</p>
            <p><span className="text-stone-500">username:</span> {user.username}</p>
            <p><span className="text-stone-500">email:</span> {user.email}</p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200 text-sm font-medium transition"
          >
            Log out
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}