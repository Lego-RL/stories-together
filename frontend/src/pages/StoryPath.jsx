import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useMe } from "../hooks/useAuth";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

export default function StoryPath() {
  const { passage_id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading: userIsLoading } = useMe();
  const [childIndex, setChildIndex] = useState(0);

  // 1get path from root passage -> this passage
  const { data: path, isLoading: pathLoading, isError } = useQuery({
    queryKey: ["passage-path", passage_id],
    queryFn: async () => {
      const response = await api.get(`/stories/passages/${passage_id}/path`);
      return response; 
    },
  });

  // get story metadata
  const storyId = path?.[0]?.story_id;
  const { data: story } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => api.get(`/stories/${storyId}`),
    enabled: !!storyId, // only fetch once storyId is known
  });

  // fetch the full story tree
  const { data: tree = [] } = useQuery({
    queryKey: ["story-tree", storyId],
    queryFn: () => api.get(`/stories/${storyId}/tree`),
    enabled: !!storyId,
  });

  // find the focal passage in the tree and get its children
  const findPassageInTree = (passageId, passages) => {
    for (const passage of passages) {
      if (passage.id === passageId) {
        return passage;
      }
      if (passage.children && passage.children.length > 0) {
        const found = findPassageInTree(passageId, passage.children);
        if (found) return found;
      }
    }
    return null;
  };

  const focalPassage = findPassageInTree(parseInt(passage_id), tree);
  const children = focalPassage?.children || [];

  // Carousel Logic for children
  const canNext = childIndex + 3 < children.length;
  const canPrev = childIndex > 0;

  const visibleChildren = children.slice(childIndex, childIndex + 3);


  const isRowFull = visibleChildren.length === 3;
  const isEmpty = visibleChildren.length === 0;

  if (pathLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500 italic">
        Loading story passages...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400">
        <p>Difficulty loading the requested passage.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-amber-500 hover:underline">
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={userIsLoading} user={user} />

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-16">
        <header className="mb-16 border-b border-stone-900 pb-8">
          <button 
            onClick={() => navigate(`/story/${storyId}`)}
            className="text-stone-500 hover:text-amber-500 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Story Tree
          </button>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {story?.title || "A Forgotten Path"}
          </h1>
          <p className="text-stone-500 text-sm mt-2 font-serif">
            A story of {path?.length} parts
          </p>
        </header>

        <article className="space-y-12 relative">
          
          {/* <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500/60 via-stone-800 to-transparent ml-[-1.5rem] md:ml-[-3rem]" /> */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500/60 via-stone-800 to-transparent ml-[-1.5rem] md:ml-[-3rem]" />

          {path?.map((passage, index) => (
            <section key={passage.id} className="relative group">

              <Link to={`/story/passages/${passage.id}/path`} className="absolute left-0 top-2 w-3 h-3 rounded-full bg-stone-800 border border-stone-700 group-hover:bg-amber-500 group-hover:border-amber-400 transition-all ml-[-1.5rem] md:ml-[-3rem] translate-x-[-3.5px]" />
              
              <div className="space-y-4">
                <header className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-stone-600">
                  <span>Passage #{index + 1}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-800" />
                  <span>ID: {passage.id}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-800" />
                  <span>By {passage.author_username || "Unknown"}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-800" />
                  <span>{passage.created_at ? new Date(passage.created_at).toLocaleString() : "Unknown date"}</span>
                </header>

                <p className="text-lg md:text-xl text-stone-200 leading-relaxed font-serif italic whitespace-pre-wrap first-letter:text-3xl first-letter:font-black first-letter:text-amber-500">
                  {passage.content}
                </p>
              </div>
            </section>
          ))}
        </article>

        {/* --- child passage carousel --- */}
        {children.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-900">
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
            {visibleChildren.map((child) => (
              <div 
                key={child.id} 
                className="group p-6 bg-stone-900/50 border border-stone-800 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between"
              >
                <p className="text-sm text-stone-300 line-clamp-4 italic">
                  "{child.content}"
                </p>
                <div className="mt-4 pt-4 border-t border-stone-800 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-stone-600 font-bold uppercase">Branch #{child.id}</span>
                    <Link to={`/story/passages/${child.id}/path`} className="text-amber-500 text-xs font-bold hover:underline">
                      Explore →
                    </Link>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    By {child.author_username || "Unknown"} • {child.created_at ? new Date(child.created_at).toLocaleString() : "Unknown date"}
                  </div>
                </div>
              </div>
            ))}

            {user && (
              <Link 
                to={`/story/${storyId}/contribute?parent=${passage_id}`}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-800 rounded-2xl hover:border-stone-600 text-stone-600 hover:text-stone-400 transition group ${
                  isRowFull || isEmpty ? "md:col-start-2" : ""
                }`}
              >
                <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">+</span>
                <span className="text-xs font-bold uppercase tracking-widest">Add New Path</span>
              </Link>
            )}
          </div>
          </section>
        )}

        {/* --- Branching Action --- */}
        <footer className="mt-20 pt-12 border-t border-stone-900 text-center">
          <p className="text-stone-500 text-sm italic mb-8">You've reached the end of the line</p>
          
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
                Want to expand this path?
              </h3>
              <button
                onClick={() => navigate(`/story/${storyId}/contribute?parent=${passage_id}`)}
                className="px-8 py-3 bg-stone-900 border border-amber-500/50 hover:bg-amber-600 hover:text-stone-950 text-amber-500 font-black uppercase tracking-tighter rounded-xl transition-all shadow-xl shadow-amber-900/5"
              >
                Add a new Passage
              </button>
            </div>
          ) : (
            <p className="text-stone-600 text-xs font-bold uppercase tracking-widest">
              Login to add a new passage to the story!
            </p>
          )}
        </footer>
      </main>

      <SiteFooter />
    </div>
  );
}