import type { HttpMethod } from "../api/types";

export function MethodPill({ method }: { method: HttpMethod }) {
  return <span className={`pill pill-${method.toLowerCase()}`}>{method}</span>;
}
