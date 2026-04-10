import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/admin";

export default function AdminStats() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          Statistics
        </h3>
        <div className="text-center py-8 text-stone-500">Loading statistics...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-stone-900 rounded-xl p-6">
        <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
          Statistics
        </h3>
        <div className="text-center py-8 text-red-400">
          Error loading statistics: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{data.total_stories}</div>
          <div className="text-stone-400 text-sm">Total Stories</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{data.total_passages}</div>
          <div className="text-stone-400 text-sm">Total Passages</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{data.active_users}</div>
          <div className="text-stone-400 text-sm">Active Users</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{data.recent_stats.total_contributions}</div>
          <div className="text-stone-400 text-sm">Recent Activity (24h)</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-amber-400 text-md font-semibold mb-3">Recent Activity (Last 24 Hours)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{data.recent_stats.stories_created}</div>
            <div className="text-stone-400 text-sm">Stories Created</div>
          </div>
          <div className="bg-stone-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{data.recent_stats.passages_created}</div>
            <div className="text-stone-400 text-sm">Passages Created</div>
          </div>
          <div className="bg-stone-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{data.recent_stats.user_registrations}</div>
            <div className="text-stone-400 text-sm">New Users</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-amber-400 text-md font-semibold mb-3">Top Contributors</h4>
        <div className="space-y-2">
          {data.top_contributors.map((contributor, index) => (
            <div key={contributor.user_id} className="bg-stone-800 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-amber-400 font-bold mr-3">#{index + 1}</span>
                <span className="text-stone-200">{contributor.username}</span>
              </div>
              <div className="text-right text-sm">
                <div className="text-amber-400">{contributor.total_contributions} total</div>
                <div className="text-stone-400">
                  {contributor.story_count} stories, {contributor.passage_count} passages
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}