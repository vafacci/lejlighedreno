import { useState, type CSSProperties } from "react";
import { copy } from "../data/copy";
import type { Frame } from "../data/types";

const reported = new Set<string>();

function reportMissing(file: string) {
  if (reported.has(file)) return;
  reported.add(file);
  console.warn(`Manglende billede: ${file}`);
}

/** Forholdet mellem det viste motiv. Bruges til at reservere plads før indlæsning. */
export function frameRatio(frame: Frame): string {
  const box = frame.content;
  return box ? `${box.width} / ${box.height}` : `${frame.width} / ${frame.height}`;
}

/** Viser filen i sit eget format. Sorte bjælker skjules ved at flytte billedet, ikke ved at strække det. */
function contentStyle(frame: Frame): CSSProperties {
  const box = frame.content;
  if (!box) return { width: "100%", height: "auto" };
  return {
    width: `${(frame.width / box.width) * 100}%`,
    height: "auto",
    transform: `translate(${(-box.x / frame.width) * 100}%, ${(-box.y / frame.height) * 100}%)`,
  };
}

type Props = {
  src: string;
  file: string;
  alt: string;
  frame: Frame;
  eager?: boolean;
};

export function DocumentImage({ src, file, alt, frame, eager = false }: Props) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span className="missing" role="img" aria-label={`${copy.missingImage}: ${file}`}>
        <span>{copy.missingImage}</span>
        <span className="missing-file">{file}</span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={contentStyle(frame)}
      onError={() => {
        reportMissing(file);
        setMissing(true);
      }}
    />
  );
}
