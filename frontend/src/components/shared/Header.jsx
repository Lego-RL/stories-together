import { Link, useLocation } from "react-router-dom";

export default function SiteHeader({ isLoading, user }) {
    const location = useLocation(); 
    const isLoginPage = location.pathname === "/login";

    return (
    <header className="w-full p-8 flex justify-between items-start border-b border-stone-900 bg-stone-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
        <h1 className="text-3xl font-black tracking-tighter text-white">
            <Link to="/"> STORIES TOGETHER </Link>
        </h1>
        <p className="text-stone-500 text-sm mt-1 font-medium italic">
            A collaborative collaboration for collaborators.
        </p>
        </div>

        <nav className="pt-2">
        {!isLoading && user ? (
            <div className="flex items-center gap-4">
            <span className="text-stone-400 text-sm">
                Welcome back, <span className="text-amber-400 font-bold">{user.username}</span>
            </span>
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