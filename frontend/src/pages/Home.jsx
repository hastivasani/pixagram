import { useEffect } from "react";
import Status from "../components/Status";
import PostCard from "../components/PostCard";
import SuggestedUsers from "../components/SuggestedUsers";
import { useContent } from "../Context/ContentContext";

export default function Home() {
  const { posts, loadingPosts, hasMore, fetchFeed, fetchStories, loadMoreFeed } = useContent();

  useEffect(() => {
    fetchFeed();
    fetchStories();
  }, []);

  return (
    <div className="min-h-screen bg-theme-primary pb-[68px] md:pb-0">

      {/* Stories bar — full width, no wasted space */}
      <div className="w-full border-b border-theme bg-theme-primary">
        <Status />
      </div>

      {/* Main layout: feed + right sidebar */}
      <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex gap-0 lg:gap-8 xl:gap-10 items-start">

          {/* ── Feed column ── */}
          <div className="flex-1 min-w-0 py-4 space-y-4 sm:space-y-5">

            {/* Loading skeletons */}
            {loadingPosts && posts.length === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full bg-theme-card rounded-2xl overflow-hidden animate-pulse">
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-full bg-theme-secondary" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-theme-secondary rounded w-1/3" />
                        <div className="h-2 bg-theme-secondary rounded w-1/4" />
                      </div>
                    </div>
                    <div className="w-full aspect-square bg-theme-secondary" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-theme-secondary rounded w-1/2" />
                      <div className="h-2 bg-theme-secondary rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loadingPosts && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 rounded-full bg-theme-secondary flex items-center justify-center text-4xl">
                  📸
                </div>
                <p className="text-theme-primary font-semibold text-lg">No posts yet</p>
                <p className="text-theme-muted text-sm text-center max-w-xs">
                  Follow people to see their posts here, or create your first post!
                </p>
              </div>
            )}

            {/* Posts */}
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Load more / end */}
            {posts.length > 0 && (
              <div className="flex justify-center py-6">
                {loadingPosts ? (
                  <div className="flex items-center gap-2 text-theme-muted text-sm">
                    <div className="w-4 h-4 border-2 border-theme-muted border-t-blue-500 rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : hasMore ? (
                  <button
                    onClick={loadMoreFeed}
                    className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                  >
                    Load more
                  </button>
                ) : (
                  <p className="text-xs text-theme-muted">You're all caught up ✓</p>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar — visible lg+ ── */}
          <div className="hidden lg:block w-[320px] xl:w-[360px] 2xl:w-[400px] flex-shrink-0 sticky top-4 py-6">
            <SuggestedUsers />
          </div>

        </div>
      </div>
    </div>
  );
}
