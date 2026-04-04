import { Link } from "react-router-dom";

export default function StoryCard({ id, title, description }) {
  return (
    <Link 
      to={`/story/${id}`}
      className="group block p-6 bg-stone-900 border border-stone-800 rounded-xl 
                 hover:border-stone-700 hover:bg-stone-800/50 transition-all 
                 duration-200 shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col h-full">
        {/* title turns amber on card hover */}
        <h2 className="text-xl font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
          {title || "Untitled Tale"}
        </h2>
        
        {/*  */}
        <p className="mt-2 text-stone-400 text-sm line-clamp-3 leading-relaxed">
          {description || "No description provided for this story yet..."}
        </p>

        {/* footer */}
        <div className="mt-auto pt-6 flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 group-hover:text-stone-300">
          <span>Read Story</span>
          <svg 
            className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}