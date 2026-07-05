import { useEffect, useState } from "react";

/**
 * Cycles through `words`, typing each one out character-by-character,
 * pausing, then deleting it before moving to the next.
 */
export function Typewriter({
  words,
  typingSpeed = 85,
  deletingSpeed = 40,
  pause = 1500,
  className = "gradient-text-light",
}: {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setDeleting(true), pause);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
      } else {
        timeout = setTimeout(() => {
          setDeleting(false);
          setIndex((i) => (i + 1) % words.length);
        }, 200);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pause]);

  return (
    <span>
      <span className={className}>{text}</span>
      <span className="tw-caret" aria-hidden>
        |
      </span>
    </span>
  );
}
