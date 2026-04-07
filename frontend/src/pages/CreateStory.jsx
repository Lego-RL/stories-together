import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export default function CreateStory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    first_passage_content: "",
  });

  
  const mutation = useMutation({
    mutationFn: (newStory) => api.post("/stories/", newStory),
    onSuccess: (response) => {
      // invalidate stories query incase new one populates on landingpage
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      
      // redirect to the newly created story (using the ID from backend)
      const storyId = response.id;
      navigate(`/story/${storyId}`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* navigate back */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 text-stone-500 hover:text-stone-300 flex items-center gap-2 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">Start a new story</h1>
          <p className="text-stone-500 mt-2">The sky is the limit unless it is not</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* error msg */}
          {mutation.isError && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">
              {mutation.error.response?.data?.message || "Failed to create story. Check your inputs."}
            </div>
          )}

          {/* title input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Story Title</label>
            <input
              name="title"
              type="text"
              required
              minLength={5}
              maxLength={100}
              placeholder="e.g., The Clockwork Heart"
              value={formData.title}
              onChange={handleChange}
              className="bg-stone-900 border border-stone-800 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none transition-all text-white"
            />
          </div>

          {/* description input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Premise (Optional)</label>
            <textarea
              name="description"
              rows={2}
              minLength={20}
              maxLength={500}
              placeholder="Briefly describe the world or the goal of this story..."
              value={formData.description}
              onChange={handleChange}
              className="bg-stone-900 border border-stone-800 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none transition-all text-white resize-none"
            />
          </div>

          {/* passage input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">The Opening Hook</label>
            <textarea
              name="first_passage_content"
              required
              minLength={30}
              rows={8}
              placeholder="Write the very first passage. How does this story begin?"
              value={formData.first_passage_content}
              onChange={handleChange}
              className="bg-stone-900 border border-stone-800 p-4 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none transition-all text-white leading-relaxed"
            />
            <p className="text-xs text-stone-600 mt-1">Minimum 20 characters.</p>
          </div>

          {/* buttons */}
          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold rounded-lg transition-all shadow-lg shadow-amber-900/20"
            >
              {mutation.isPending ? "Publishing..." : "Publish Story"}
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-8 py-3 text-stone-500 hover:text-stone-300 font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}