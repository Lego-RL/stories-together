export default function AdminSidebar({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'users', label: 'Users', description: 'Manage user accounts' },
    { id: 'stats', label: 'Statistics', description: 'View platform metrics' },
  ];

  return (
    <div className="bg-stone-900 rounded-xl p-6">
      <h3 className="text-amber-500 uppercase tracking-[0.15em] text-lg font-bold mb-4">
        Views
      </h3>

      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              activeSection === section.id
                ? 'bg-amber-900/30 border border-amber-700/50'
                : 'bg-stone-800 hover:bg-stone-700'
            }`}
          >
            <div className="font-medium text-stone-100">{section.label}</div>
            <div className="text-xs text-stone-400 mt-1">{section.description}</div>
          </button>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-stone-700">
        <div className="text-xs text-stone-500">
          <p className="mb-2">Quick Actions:</p>
          <ul className="space-y-1 text-stone-400">
            <li>• View user details</li>
            <li>• Monitor activity</li>
            <li>• Manage content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}