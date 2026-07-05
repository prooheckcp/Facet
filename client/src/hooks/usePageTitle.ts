import { useEffect } from "react";

const DEFAULT_TITLE = "Facet — One backend. Infinite interfaces.";

/**
 * Sets the browser tab title for the current page.
 * Pass a page name (e.g. "Marketplace") → "Marketplace · Facet".
 * Pass nothing → the default landing title. Restores the default on unmount.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Facet` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
