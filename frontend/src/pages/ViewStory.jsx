import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useMe } from "../hooks/useAuth";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

export default function ViewStory() {
  const { id } = useParams();
  const { data: user, isLoading: userIsLoading } = useMe();
  const [childIndex, setChildIndex] = useState(0);

    // Fetch only the specific story metadata
    const { data: story, isLoading: storyLoading } = useQuery({
    queryKey: ["story", id],
    queryFn: () => api.get(`/stories/${id}`),
    });

    // Fetch the tree separately
    const { data: tree, isLoading: treeLoading } = useQuery({
    queryKey: ["story-tree", id],
    queryFn: () => api.get(`/stories/${id}/tree`),
    });

  const rootPassage = tree?.[0]; // The initial passage is the root of the tree
  const children = rootPassage?.children || [];

  // Carousel Logic
  const canNext = childIndex + 3 < children.length;
  const canPrev = childIndex > 0;

  if (treeLoading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading narrative...</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={userIsLoading} user={user} />

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12">
        {/* display story info */}
        <header className="mb-12 space-y-4">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic underline decoration-amber-500/50">
            {story?.title || "Untitled Tale"}
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl border-l-2 border-stone-800 pl-4">
            {story?.description}
          </p>
        </header>

        {/* --- initial passage --- */}
        <section className="bg-stone-900 border border-stone-800 rounded-3xl p-10 shadow-2xl mb-16 relative">
            <div className="absolute -top-4 left-10 px-4 py-1 bg-amber-600 text-stone-950 text-xs font-black uppercase tracking-tighter">
                Initial Passage
            </div>
          <p className="text-xl text-stone-200 leading-relaxed font-serif italic">
            "{rootPassage?.content}"
          </p>
        </section>

        {/* --- child passage carousel --- */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">
                Choose the Next Path
              </h2>
              <p className="text-stone-500 text-sm mt-1">There are {children.length} continuations.</p>
            </div>
            
            {/* carousel controls */}
            {children.length > 3 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setChildIndex(Math.max(0, childIndex - 1))}
                  disabled={!canPrev}
                  className="p-2 border border-stone-800 rounded-lg hover:bg-stone-800 disabled:opacity-20 transition"
                >
                  ←
                </button>
                <button 
                  onClick={() => setChildIndex(Math.min(children.length - 3, childIndex + 1))}
                  disabled={!canNext}
                  className="p-2 border border-stone-800 rounded-lg hover:bg-stone-800 disabled:opacity-20 transition"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {children.slice(childIndex, childIndex + 3).map((child) => (
              <div 
                key={child.id} 
                className="group p-6 bg-stone-900/50 border border-stone-800 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <p className="text-sm text-stone-300 line-clamp-4 italic">
                  "{child.content}"
                </p>
                <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-center">
                    <span className="text-[10px] text-stone-600 font-bold uppercase">Branch #{child.id}</span>
                    <Link to={`/story/passages/${child.id}/path`} className="text-amber-500 text-xs font-bold hover:underline">
                        Explore →
                    </Link>
                </div>
              </div>
            ))}

            {/* placeholder for making new branch of story */}
            {user && (
              <Link 
                to={`/story/${id}/contribute?parent=${rootPassage?.id}`}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-800 rounded-2xl hover:border-stone-600 text-stone-600 hover:text-stone-400 transition group"
              >
                <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">+</span>
                <span className="text-xs font-bold uppercase tracking-widest">Add New Path</span>
              </Link>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}