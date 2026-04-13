import { Link } from "react-router-dom";
import { useMe } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import StoryCard from "../components/shared/StoryCard";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

export default function LandingPage() {
  const { data: user, isLoading: userIsLoading } = useMe();

  const { data: stories, isLoading, isError } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await api.get("/stories/?limit=4");
      return response ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={userIsLoading} user={user}/>
      
      {/*  body */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16">
        <section className="w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-center gap-6">
            <h2 className="text-amber-500 uppercase tracking-[0.15em] text-xl font-bold">
              Featured Stories
            </h2>
          </div>

          {isLoading && (
          <div className="flex justify-center p-20">
            <div className="animate-pulse text-stone-500 font-medium">Tracing the narrative...</div>
          </div>
        )}

        {isError && (
          <div className="text-center p-10 bg-red-900/10 border border-red-900/20 rounded-xl">
            <p className="text-red-400">Failed to load stories. Is the backend running?</p>
          </div>
        )}

        {/* 3. story cards! */}
        {!isLoading && !isError && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories?.slice(0, 4).map((story) => (
                <StoryCard 
                key={story.id}
                id={story.id}
                title={story.title}
                description={story.description}
                creator_username={story.creator_username}
                created_at={story.created_at}
                />
            ))}
            
            {/* in case no stories exist display placeholder */}
            {stories?.length === 0 && (
                <div className="col-span-3 text-center py-20 border-2 border-dashed border-stone-900 rounded-2xl">
                <p className="text-stone-600">The library is empty. Be the first to start a tale.</p>
                </div>
            )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 p-7">
              <Link
                to="/stories"
                className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-semibold transition-colors"
              >
                View All Stories
              </Link>
              {user && (
                <Link
                  to="/create-story"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 transition-all"
                >
                  Create Story
                </Link>
              )}
            </div>
        </>
        )}
          
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}