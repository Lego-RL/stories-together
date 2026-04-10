import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";
import AdminSidebar from "../components/shared/AdminSidebar";
import AdminUserList from "../components/shared/AdminUserList";
import AdminUserDetail from "../components/shared/AdminUserDetail";
import AdminStats from "../components/shared/AdminStats";

export default function Admin() {
  const navigate = useNavigate();
  const { data: user, isLoading: userIsLoading } = useMe();
  const [activeSection, setActiveSection] = useState('users');
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!userIsLoading && user) {
      if (user.role !== 'admin') {
        navigate('/', { replace: true });
      }
    } else if (!userIsLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, userIsLoading, navigate]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section !== 'users') {
      setSelectedUserId(null);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  if (userIsLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <SiteHeader isLoading={true} user={null} />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-stone-500 font-medium">Loading...</div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={false} user={user} />

      <main className="flex-grow px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-500 uppercase tracking-[0.15em]">
              Admin Panel
            </h1>
            <p className="text-stone-400 mt-2">
              Manage users, view statistics, and monitor platform activity
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AdminSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {activeSection === 'users' && (
                <>
                  {/* User List */}
                  <AdminUserList onSelectUser={handleUserSelect} />

                  {/* User Detail (only show if user is selected) */}
                  {selectedUserId && (
                    <AdminUserDetail userId={selectedUserId} />
                  )}
                </>
              )}

              {activeSection === 'stats' && (
                <AdminStats />
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}