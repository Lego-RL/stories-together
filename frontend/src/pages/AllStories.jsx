import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useMe } from "../hooks/useAuth";
import StoryCard from "../components/shared/StoryCard";
import SiteHeader from "../components/shared/Header";
import SiteFooter from "../components/shared/Footer";

const PAGE_SIZE = 20;
const SEARCH_MIN_LENGTH = 3;

export default function AllStories() {
  const { data: user, isLoading: userIsLoading } = useMe();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const searchTooShort =
    debouncedSearch.length > 0 && debouncedSearch.length < SEARCH_MIN_LENGTH;
  const activeQuery = searchTooShort ? "" : debouncedSearch;
  const isSearchMode = activeQuery.length >= SEARCH_MIN_LENGTH;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["stories", "all", { q: activeQuery }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        skip: String(pageParam),
        limit: String(PAGE_SIZE),
      });

      if (isSearchMode) {
        params.append("q", activeQuery);
        return api.get(`/stories/search?${params.toString()}`);
      }

      return api.get(`/stories/?${params.toString()}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.length * PAGE_SIZE;
    },
  });

  const stories = useMemo(() => {
    const allItems = data?.pages?.flatMap((page) => page ?? []) ?? [];
    const seen = new Set();

    return allItems.filter((story) => {
      if (seen.has(story.id)) {
        return false;
      }
      seen.add(story.id);
      return true;
    });
  }, [data]);

  useEffect(() => {
    if (!sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <SiteHeader isLoading={userIsLoading} user={user} />

      <main className="flex-grow px-4 py-12 sm:py-16">
        <section className="w-full max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col gap-4 sm:gap-5">
            <h2 className="text-amber-500 uppercase tracking-[0.15em] text-xl font-bold">
              All Stories
            </h2>
            <p className="text-stone-400 max-w-2xl">
              Go on then. Take a look at the catalog of lovely literature.
            </p>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-4 sm:p-5 space-y-4">
            <label htmlFor="story-search" className="block text-sm font-semibold text-stone-300">
              Search Stories
            </label>
            <input
              id="story-search"
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title"
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
            />

            {searchInput.trim().length > 0 && searchInput.trim().length < SEARCH_MIN_LENGTH && (
              <p className="text-xs text-amber-300">
                Keep typing. Search starts at {SEARCH_MIN_LENGTH} characters.
              </p>
            )}

            <div className="rounded-lg border border-dashed border-stone-700 p-3 text-stone-500 text-sm">
              Filters placeholder: sorting, creator filters, and content filters will live here.
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center p-16">
              <div className="animate-pulse text-stone-500 font-medium">Loading stories...</div>
            </div>
          )}

          {isError && (
            <div className="text-center p-10 bg-red-900/10 border border-red-900/20 rounded-xl">
              <p className="text-red-400">Failed to load stories. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && stories.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-stone-800 rounded-2xl">
              <p className="text-stone-500">
                {isSearchMode
                  ? "No stories matched your search."
                  : "No stories exist yet. Start one from the home page."}
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Back Home
                </Link>
              </div>
            </div>
          )}

          {!isLoading && !isError && stories.length > 0 && (
            <div className="space-y-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  title={story.title}
                  description={story.description}
                  first_passage_content={story.first_passage_content}
                  passage_count={story.passage_count}
                  creator_username={story.creator_username}
                  created_at={story.created_at}
                  variant="full"
                />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="h-10" />

          {isFetchingNextPage && (
            <div className="text-center text-stone-500 text-sm">Loading more stories...</div>
          )}

          {!hasNextPage && stories.length > 0 && (
            <div className="text-center text-stone-600 text-sm">You have reached the end of the library.</div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
