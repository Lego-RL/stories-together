export default function AdminStats() {
  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        Statistics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Placeholder stat cards */}
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">--</div>
          <div className="text-stone-400 text-sm">Total Stories</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">--</div>
          <div className="text-stone-400 text-sm">Total Passages</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">--</div>
          <div className="text-stone-400 text-sm">Active Users</div>
        </div>
        <div className="bg-stone-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">--</div>
          <div className="text-stone-400 text-sm">Recent Activity</div>
        </div>
      </div>

      <div className="text-center py-8 text-stone-500">
        Statistics will be displayed here once the backend endpoint is implemented
      </div>
    </div>
  );
}