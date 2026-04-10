import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/admin";

export default function AdminUserDetail({ userId }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminApi.getUserContent(userId),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Details
        </h3>
        <div className="text-center py-8 text-stone-500">
          Select a user to view details
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Details
        </h3>
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-stone-500 font-medium">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          User Details
        </h3>
        <div className="text-center p-8 bg-red-900/10 border border-red-900/20 rounded-xl">
          <p className="text-red-400">Failed to load user details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        User Details
      </h3>

      {/* User Info */}
      <div className="mb-6 p-4 bg-stone-800 rounded-lg">
        <h4 className="text-stone-100 font-semibold mb-3">Profile Information</h4>
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
            <span className="text-stone-500">Role:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              user.role === 'admin'
                ? 'bg-amber-900/30 text-amber-400'
                : 'bg-stone-700 text-stone-300'
            }`}>
              {user.role}
            </span>
          </div>
          <div>
            <span className="text-stone-500">Active:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              user.active
                ? 'bg-green-900/30 text-green-400'
                : 'bg-red-900/30 text-red-400'
            }`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-stone-500">Created:</span>
            <span className="text-stone-100 ml-2">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="mb-6">
        <h4 className="text-stone-100 font-semibold mb-3">
          Stories Created ({user.stories?.length || 0})
        </h4>
        {user.stories?.length > 0 ? (
          <div className="space-y-3">
            {user.stories.map((story) => (
              <div key={story.id} className="p-3 bg-stone-800 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-stone-100 font-medium">{story.title}</h5>
                    {story.description && (
                      <p className="text-stone-400 text-sm mt-1">{story.description}</p>
                    )}
                  </div>
                  <span className="text-stone-500 text-xs">
                    ID: {story.id}
                  </span>
                </div>
                <div className="mt-2 text-xs text-stone-500">
                  Created: {new Date(story.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-stone-500 bg-stone-800 rounded-lg">
            No stories created
          </div>
        )}
      </div>

      {/* Passages */}
      <div>
        <h4 className="text-stone-100 font-semibold mb-3">
          Passages Written ({user.passages?.length || 0})
        </h4>
        {user.passages?.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {user.passages.map((passage) => (
              <div key={passage.id} className="p-3 bg-stone-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-stone-500 text-xs">
                    Passage ID: {passage.id}
                  </span>
                  <span className="text-stone-500 text-xs">
                    Story ID: {passage.story_id}
                  </span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {passage.content.length > 200
                    ? `${passage.content.substring(0, 200)}...`
                    : passage.content
                  }
                </p>
                <div className="mt-2 text-xs text-stone-500">
                  Written: {new Date(passage.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-stone-500 bg-stone-800 rounded-lg">
            No passages written
          </div>
        )}
      </div>
    </div>
  );
}