import { Link, useLocation } from "react-router-dom";

export default function SiteHeader({ isLoading, user }) {
    const location = useLocation(); 
    const isLoginPage = location.pathname === "/login";

    return (
    <header className="w-full px-4 py-5 sm:p-8 flex justify-between items-start border-b border-stone-900 bg-stone-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="min-w-0 mr-4">
        <h1 className="text-xl sm:text-3xl font-black tracking-tighter text-white">
            <Link to="/"> STORIES TOGETHER </Link>
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-1 font-medium italic hidden sm:block">
            A collaborative environment for collaborators to collaborate
        </p>
        </div>

        <nav className="pt-1 sm:pt-2 shrink-0">
        {!isLoading && user ? (
            <div className="flex items-center gap-4">
            <span className="text-stone-400 text-sm">
                Welcome back, <span className="text-amber-400 font-bold">{user.username}</span>
            </span>
            {user.role === 'admin' && (
                <Link
                    to="/admin"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all"
                >
                    Admin
                </Link>
            )}
            <Link
                to="/profile"
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-semibold transition-colors"
            >
                Profile
            </Link>
            </div>
        ) : (
            !isLoginPage && (
                <Link
                to="/login"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all"
                >
                Log In
                </Link>
            )
        )}
        </nav>
    </header>
    );
}