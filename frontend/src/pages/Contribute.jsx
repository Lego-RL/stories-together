import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useMe } from "../hooks/useAuth";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

export default function Contribute() {
  const { id: storyId } = useParams();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get("parent");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userIsLoading } = useMe();
  
  const [content, setContent] = useState("");

  // get story & parent passage info
  const { data: story } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => api.get(`/stories/${storyId}`),
  });

  const { data: tree } = useQuery({
    queryKey: ["story-tree", storyId],
    queryFn: () => api.get(`/stories/${storyId}/tree`),
  });

  // helper to find parent passage text within the tree
  const findPassage = (nodes, targetId) => {
    for (let node of nodes) {
      if (node.id === parseInt(targetId)) return node;
      if (node.children) {
        const found = findPassage(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const parentPassage = tree ? findPassage(tree, parentId) : null;

  // new passage mutation
  const mutation = useMutation({
    mutationFn: (newPassage) => api.post(`/stories/${storyId}/passages`, newPassage),
    onSuccess: (data) => {
      // refresh the tree cache to include the new branch
      queryClient.invalidateQueries({ queryKey: ["story-tree", storyId] });
      
      const newPassageId = data.id; 
      
      // redirect user to a view of their new passage
      navigate(`/story/passages/${newPassageId}/path`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      content: content,
      parent_passage_id: parseInt(parentId),
    });
  };

  if (userIsLoading) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={userIsLoading} user={user} />

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-12">
        <header className="mb-8">
          <h1 className="text-stone-500 text-xs font-black uppercase tracking-[0.3em] mb-2">
            Contributing to: {story?.title}
          </h1>
          <h2 className="text-3xl font-bold text-white">Add a New Passage</h2>
        </header>

        {/* --- to-be-parent passage --- */}
        <section className="mb-10">
          <label className="text-[10px] font-black uppercase text-stone-600 tracking-tighter mb-2 block">
            Responding to:
          </label>
          <div className="p-6 bg-stone-900/30 border border-stone-900 rounded-2xl text-stone-400 italic leading-relaxed">
            "{parentPassage?.content || "Loading parent passage..."}"
          </div>
        </section>

        {/* --- passage entry form --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mutation.isError && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">
              {mutation.error.response?.data?.message || "Error submitting contribution."}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-amber-500/80 uppercase tracking-widest">
              Your Contribution
            </label>
            <textarea
              required
              minLength={10}
              rows={10}
              placeholder="What happens next? Bravely forge a new path..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-stone-900 border border-stone-800 p-6 rounded-2xl focus:ring-2 focus:ring-amber-600 outline-none transition-all text-lg text-white leading-relaxed font-serif italic"
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-stone-600 uppercase font-bold tracking-tighter">
                Min 10 characters
              </p>
              <p className="text-xs text-stone-600 uppercase font-bold tracking-tighter">
                {content.length} characters
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center gap-6">
            <button
              type="submit"
              disabled={mutation.isPending || content.length < 10}
              className="px-10 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-black uppercase tracking-tighter rounded-xl transition-all shadow-xl shadow-amber-900/10"
            >
              {mutation.isPending ? "Publishing..." : "Publish Branch"}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-stone-500 hover:text-stone-300 text-sm font-bold uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}