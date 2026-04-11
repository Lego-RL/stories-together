import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/admin";

export default function AdminUserModeration({ userId }) {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

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

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId) => adminApi.deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      setShowDeleteModal(false);
      setDeleteItem(null);
    },
  });

  const deletePassageMutation = useMutation({
    mutationFn: (passageId) => adminApi.deletePassage(passageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      setShowDeleteModal(false);
      setDeleteItem(null);
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

  const handleDeleteClick = (type, item) => {
    setDeleteItem({ type, ...item });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItem.type === 'story') {
      deleteStoryMutation.mutate(deleteItem.id);
    } else if (deleteItem.type === 'passage') {
      deletePassageMutation.mutate(deleteItem.id);
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
    <>
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Moderation
        </h3>

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

        {/* User Stories */}
        <div className="mb-6">
          <h4 className="text-stone-100 font-semibold mb-3">User Stories ({user.stories?.length || 0})</h4>
          {user.stories?.length > 0 ? (
            <div className="space-y-3">
              {user.stories.map((story) => (
                <div key={story.id} className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
                  <div className="flex-1">
                    <h5 className="text-stone-100 font-medium hover:text-amber-400 cursor-pointer">
                      {story.title}
                    </h5>
                    <p className="text-stone-500 text-sm">
                      Created: {new Date(story.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteClick('story', { id: story.id, title: story.title })}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                    title="Delete story"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-stone-800 rounded-lg text-center text-stone-500">
              No stories created by this user
            </div>
          )}
        </div>

        {/* User Passages */}
        <div className="mb-6">
          <h4 className="text-stone-100 font-semibold mb-3">User Passages ({user.passages?.length || 0})</h4>
          {user.passages?.length > 0 ? (
            <div className="space-y-3">
              {user.passages.map((passage) => (
                <div key={passage.id} className="p-3 bg-stone-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-stone-100 text-sm leading-relaxed mb-2">
                        "{passage.content.length > 100 ? passage.content.substring(0, 100) + '...' : passage.content}"
                      </p>
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>Story: {passage.story?.title || 'Unknown'}</span>
                        <span>Created: {new Date(passage.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick('passage', { id: passage.id, content: passage.content })}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors ml-2"
                      title="Delete passage"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-stone-800 rounded-lg text-center text-stone-500">
              No passages created by this user
            </div>
          )}
        </div>

        {/* Error Messages */}
        {(updateActiveMutation.isError || updateRoleMutation.isError || deleteStoryMutation.isError || deletePassageMutation.isError) && (
          <div className="mb-4 p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
            {updateActiveMutation.isError && (
              <p className="text-red-400 text-sm">Failed to update active status: {updateActiveMutation.error?.message}</p>
            )}
            {updateRoleMutation.isError && (
              <p className="text-red-400 text-sm">Failed to update role: {updateRoleMutation.error?.message}</p>
            )}
            {deleteStoryMutation.isError && (
              <p className="text-red-400 text-sm">Failed to delete story: {deleteStoryMutation.error?.message}</p>
            )}
            {deletePassageMutation.isError && (
              <p className="text-red-400 text-sm">Failed to delete passage: {deletePassageMutation.error?.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-stone-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
              Confirm Deletion
            </h3>
            <p className="text-stone-100 mb-6">
              Are you sure you want to delete this {deleteItem.type}?
            </p>
            <div className="mb-4 p-3 bg-stone-800 rounded-lg">
              {deleteItem.type === 'story' ? (
                <p className="text-stone-100 font-medium">"{deleteItem.title}"</p>
              ) : (
                <p className="text-stone-100 text-sm">
                  "{deleteItem.content.length > 100 ? deleteItem.content.substring(0, 100) + '...' : deleteItem.content}"
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteStoryMutation.isPending || deletePassageMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-stone-100 rounded font-medium transition-colors"
              >
                {(deleteStoryMutation.isPending || deletePassageMutation.isPending) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}