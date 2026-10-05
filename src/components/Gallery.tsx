import { copy } from "../data/copy";
import type { EvidenceImage } from "../data/types";
import { DocumentImage, frameRatio } from "./DocumentImage";

type Props = {
  images: EvidenceImage[];
  onOpen: (image: EvidenceImage) => void;
};

export function Gallery({ images, onOpen }: Props) {
  if (images.length === 0) return null;

  return (
    <div className="gallery">
      {images.map((image) => (
        <figure key={image.file} className="photo">
          <button
            type="button"
            className="shot"
            style={{ aspectRatio: frameRatio(image.frame) }}
            onClick={() => onOpen(image)}
            aria-label={`${copy.openImage}: ${image.caption}`}
          >
            <DocumentImage
              src={image.preview}
              file={image.file}
              alt={image.caption}
              frame={image.frame}
            />
          </button>
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
