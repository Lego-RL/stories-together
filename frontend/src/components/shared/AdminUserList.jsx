import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/admin";

export default function AdminUserList({ onSelectUser }) {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  });

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    onSelectUser(userId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse text-stone-500 font-medium">Loading users...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-900/10 border border-red-900/20 rounded-xl">
        <p className="text-red-400">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        All Users
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="text-left py-2 px-3 text-stone-400 font-medium">ID</th>
              <th className="text-left py-2 px-3 text-stone-400 font-medium">Username</th>
              <th className="text-left py-2 px-3 text-stone-400 font-medium">Email</th>
              <th className="text-left py-2 px-3 text-stone-400 font-medium">Role</th>
              <th className="text-left py-2 px-3 text-stone-400 font-medium">Active</th>
              <th className="text-left py-2 px-3 text-stone-400 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr
                key={user.id}
                className={`border-b border-stone-800 hover:bg-stone-800/50 cursor-pointer transition-colors ${
                  selectedUserId === user.id ? "bg-amber-900/20" : ""
                }`}
                onClick={() => handleUserClick(user.id)}
              >
                <td className="py-3 px-3 text-stone-300">{user.id}</td>
                <td className="py-3 px-3 text-stone-100 font-medium">{user.username}</td>
                <td className="py-3 px-3 text-stone-300">{user.email}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-stone-700 text-stone-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.active
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-3 text-stone-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-8 text-stone-500">
          No users found
        </div>
      )}
    </div>
  );
}