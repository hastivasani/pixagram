import { useEffect, useRef } from "react";

/**
 * useInfiniteScroll — attaches an IntersectionObserver to a sentinel ref.
 * Calls `onLoadMore` when the sentinel enters the viewport.
 *
 * @param {Function} onLoadMore - callback to load next page
 * @param {boolean}  hasMore    - whether more data exists
 * @param {boolean}  loading    - whether a load is in progress
 */
export function useInfiniteScroll(onLoadMore, hasMore, loading) {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [onLoadMore, hasMore, loading]);

  return sentinelRef;
}
