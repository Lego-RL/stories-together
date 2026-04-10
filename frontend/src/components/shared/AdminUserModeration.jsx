import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/admin";

export default function AdminUserModeration({ userId }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminApi.getUserContent(userId),
    enabled: !!userId,
  });

  const updateActiveMutation = useMutation({
    mutationFn: ({ userId, active }) => adminApi.updateUserActive(userId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
    },
  });

  const handleToggleActive = () => {
    if (window.confirm(`Are you sure you want to ${user.active ? 'deactivate' : 'activate'} this user?`)) {
      updateActiveMutation.mutate({ userId, active: !user.active });
    }
  };

  const handleRoleChange = (newRole) => {
    if (newRole !== user.role) {
      if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
        updateRoleMutation.mutate({ userId, role: newRole });
      }
    }
  };

  if (!userId) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Moderation
        </h3>
        <div className="text-center py-8 text-stone-500">
          Select a user to manage
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Moderation
        </h3>
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-stone-500 font-medium">Loading user...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Moderation
        </h3>
        <div className="text-center p-8 bg-red-900/10 border border-red-900/20 rounded-xl">
          <p className="text-red-400">Failed to load user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        User Moderation
      </h3>

      {/* User Info */}
      <div className="mb-6 p-4 bg-stone-800 rounded-lg">
        <h4 className="text-stone-100 font-semibold mb-3">User Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-stone-500">ID:</span>
            <span className="text-stone-100 ml-2">{user.id}</span>
          </div>
          <div>
            <span className="text-stone-500">Username:</span>
            <span className="text-stone-100 ml-2">{user.username}</span>
          </div>
          <div>
            <span className="text-stone-500">Email:</span>
            <span className="text-stone-100 ml-2">{user.email}</span>
          </div>
          <div>
            <span className="text-stone-500">Created:</span>
            <span className="text-stone-100 ml-2">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Actions */}
      <div className="mb-6">
        <h4 className="text-stone-100 font-semibold mb-3">Moderation Actions</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
            <div>
              <span className="text-stone-100">Account Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                user.active
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-red-900/30 text-red-400'
              }`}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button
              onClick={handleToggleActive}
              disabled={updateActiveMutation.isPending}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 text-stone-100 rounded font-medium transition-colors"
            >
              {updateActiveMutation.isPending ? 'Updating...' : (user.active ? 'Deactivate' : 'Activate')}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
            <div>
              <span className="text-stone-100">Role:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                user.role === 'admin'
                  ? 'bg-amber-900/30 text-amber-400'
                  : 'bg-stone-700 text-stone-300'
              }`}>
                {user.role}
              </span>
            </div>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={updateRoleMutation.isPending}
              className="px-3 py-2 bg-stone-700 border border-stone-600 rounded text-stone-100"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Future Actions Placeholder */}
      <div className="mb-6">
        <h4 className="text-stone-100 font-semibold mb-3">Additional Actions</h4>
        <div className="p-4 bg-stone-800 rounded-lg text-center text-stone-500">
          Future moderation features will be added here (e.g., ban history, warnings, content moderation)
        </div>
      </div>

      {/* Error Messages */}
      {updateActiveMutation.isError && (
        <div className="mb-4 p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
          <p className="text-red-400 text-sm">Failed to update active status: {updateActiveMutation.error?.message}</p>
        </div>
      )}
      {updateRoleMutation.isError && (
        <div className="mb-4 p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
          <p className="text-red-400 text-sm">Failed to update role: {updateRoleMutation.error?.message}</p>
        </div>
      )}
    </div>
  );
}