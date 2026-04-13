import { Link } from "react-router-dom";

const PREVIEW_LIMIT = 220;

function buildPreview(content) {
  if (!content) {
    return "No opening passage available yet.";
  }

  if (content.length <= PREVIEW_LIMIT) {
    return content;
  }

  return `${content.slice(0, PREVIEW_LIMIT).trim()}...`;
}

export default function StoryCard({
  id,
  title,
  description,
  first_passage_content,
  passage_count,
  creator_username,
  created_at,
  variant = "compact",
}) {
  const formattedDate = created_at
    ? new Date(created_at).toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Unknown date";

  const isFull = variant === "full";

  return (
    <Link
      to={`/story/${id}`}
      className={`group block border rounded-xl transition-all duration-200 ${
        isFull
          ? "p-7 sm:p-8 bg-stone-900 border-stone-700 hover:border-amber-500/60 hover:bg-stone-800/70 shadow-lg"
          : "p-6 bg-stone-900 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <h2
            className={`font-bold text-stone-100 group-hover:text-stone-200 transition-colors ${
              isFull ? "text-2xl" : "text-xl"
            }`}
          >
            {title || "Untitled Tale"}
          </h2>
          {isFull && (
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-900/20 border border-amber-700/30 px-3 py-1 rounded-full w-fit">
              {passage_count ?? 0} passages
            </span>
          )}
        </div>

        <p
          className={`mt-3 text-stone-400 leading-relaxed ${
            isFull ? "text-base line-clamp-4" : "text-sm line-clamp-3"
          }`}
        >
          {description || "No description provided for this story yet..."}
        </p>

        {isFull && (
          <div className="mt-5 rounded-lg border border-stone-700 bg-stone-950/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              First Passage
            </p>
            <p className="mt-2 text-sm text-stone-300 leading-relaxed">
              {buildPreview(first_passage_content)}
            </p>
          </div>
        )}

        <div className="mt-auto pt-6 flex flex-row items-end justify-between">
          <div className="flex flex-col">
            <span className="text-amber-300 group-hover:text-amber-400 text-xs font-semibold uppercase tracking-wider transition-colors">
              By {creator_username || "Unknown"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 group-hover:text-stone-300 mt-2">
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 group-hover:text-stone-300">
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
      </div>
    </Link>
  );
}
