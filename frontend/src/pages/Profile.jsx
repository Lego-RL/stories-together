import Login from "./Login";
import { useMe } from "../hooks/useAuth";


export default function Profile() {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <p className="text-stone-500 text-sm">Loading...</p>
      </div>
    );
  }

  return user ? <UserCard user={user} /> : <Login />;
}