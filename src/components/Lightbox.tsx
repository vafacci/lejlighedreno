import { useEffect, useId, useRef } from "react";
import { copy } from "../data/copy";
import type { Frame, LightboxSlide } from "../data/types";
import { DocumentImage, frameRatio } from "./DocumentImage";

const FULL_FRAME: Frame = { width: 3, height: 4 };

type Props = {
  slides: LightboxSlide[] | null;
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
};

export function Lightbox({ slides, index, onClose, onIndex }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const slide = slides?.[index] ?? null;
  const frame = slide?.frame ?? FULL_FRAME;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (slide && !dialog.open) dialog.showModal();
    if (!slide && dialog.open) dialog.close();
  }, [slide]);

  useEffect(() => {
    if (!slides?.length) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" && index < slides.length - 1) {
        event.preventDefault();
        onIndex(index + 1);
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        onIndex(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides, index, onIndex, onClose]);

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {slide && slides ? (
        <div className="lightbox-panel">
          <div className="lightbox-bar">
            <p className="lightbox-count">
              {index + 1} af {slides.length}
            </p>
            <button type="button" className="button" onClick={onClose}>
              {copy.close}
            </button>
          </div>
          <div className="lightbox-stage" style={{ aspectRatio: frameRatio(frame) }}>
            <DocumentImage
              src={slide.src}
              file={slide.file}
              alt={slide.alt}
              eager
            />
          </div>
          <div className="lightbox-meta">
            <p id={titleId}>{slide.caption ?? slide.alt}</p>
            <p className="fine">
              <a href={slide.download} target="_blank" rel="noreferrer">
                {copy.openOriginal}
              </a>{" "}
              · <span className="file-name">{slide.file}</span>
            </p>
          </div>
          {slides.length > 1 ? (
            <div className="lightbox-nav">
              <button type="button" className="button" onClick={() => onIndex(index - 1)} disabled={index === 0}>
                {copy.previous}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => onIndex(index + 1)}
                disabled={index === slides.length - 1}
              >
                {copy.next}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
