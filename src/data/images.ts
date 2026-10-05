import { frameFor } from "./frames";
import { fullSrc, previewSrc } from "./paths";
import type { EvidenceImage, Phase, RoomId } from "./types";

function photo(
  file: string,
  room: RoomId,
  phase: Phase,
  caption: string,
  options?: { featured?: boolean; include?: boolean },
): EvidenceImage {
  return {
    file,
    preview: previewSrc(file),
    full: fullSrc(file),
    room,
    phase,
    caption,
    frame: frameFor(file),
    featured: options?.featured,
    include: options?.include,
  };
}

export const evidenceImages: EvidenceImage[] = [
  photo(
    "IMG_7712.JPG",
    "bathroom",
    "before",
    "Oversigt over gulv og toilet før arbejdet, med generelt slid og misfarvning.",
    { featured: true },
  ),
  photo(
    "IMG_7711.JPG",
    "bathroom",
    "before",
    "Nærbillede af gulvet med belægninger og misfarvninger.",
  ),
  photo(
    "IMG_7710.JPG",
    "bathroom",
    "before",
    "Gulvafløb og eksisterende rør med slid og belægninger omkring afløbet.",
  ),
  photo(
    "IMG_7713.JPG",
    "bathroom",
    "before",
    "Overgang mellem væg og gulv med misfarvning og slidt afslutning.",
  ),
  photo(
    "IMG_7798.PNG",
    "bathroom",
    "before",
    "Dørtrin og træværk med slidt og afskallet maling.",
  ),
  photo(
    "IMG_7796.PNG",
    "bathroom",
    "before",
    "Området under håndvasken med slidte rør, overgange og misfarvninger.",
  ),
  photo(
    "IMG_7795.PNG",
    "bathroom",
    "before",
    "Håndvask mod væg med slidt og mørk afslutning bag vasken.",
  ),
  photo(
    "IMG_7794.PNG",
    "bathroom",
    "before",
    "Loft og rørgennemføringer med mørke belægninger og misfarvninger.",
  ),
  photo(
    "IMG_7721.JPG",
    "bathroom",
    "during",
    "Afmonterede rørdele under arbejdet ved gulvafløbet.",
  ),
  photo(
    "IMG_7804.PNG",
    "bathroom",
    "after",
    "Opfriskede rør samt loft og væg efter maling.",
    { featured: true },
  ),
  photo(
    "IMG_7806.PNG",
    "bathroom",
    "after",
    "Badeforhængsstang og opfrisket område ved døråbningen.",
  ),
  photo("IMG_7802.PNG", "bathroom", "after", "Nyt toiletsæde."),
  photo("IMG_7803.PNG", "bathroom", "after", "Nye rørdele ved gulvafløbet."),
  photo("IMG_7800.PNG", "bathroom", "after", "Ny håndbruser."),
  photo("IMG_7799.PNG", "bathroom", "after", "Dør efter opfriskning og maling."),
  photo(
    "IMG_7801.PNG",
    "bathroom",
    "after",
    "Håndvask med ny afslutning mod væggen.",
  ),
  photo(
    "IMG_7805.JPG",
    "bathroom",
    "after",
    "Loft, lys og rør efter opfriskning.",
  ),
  photo(
    "IMG_7788.PNG",
    "bedroom",
    "before",
    "Loft med større synlige afskalninger.",
    { featured: true },
  ),
  photo("IMG_7787.PNG", "bedroom", "before", "Loft ved lampe med synlige revner."),
  photo(
    "IMG_7786.PNG",
    "bedroom",
    "before",
    "Område ved stuk og loftkant med revner og afskalninger.",
  ),
  photo(
    "IMG_7813.PNG",
    "bedroom",
    "after",
    "Vægflade og overgang mod loft og stuk efter opfriskning.",
    { featured: true },
  ),
  photo("IMG_7814.PNG", "bedroom", "after", "Fyldningsdør efter maling."),
  photo("IMG_7812.PNG", "bedroom", "after", "Loft efter maling."),
  photo("IMG_7811.PNG", "bedroom", "after", "Loft og lampe efter opfriskning."),
  photo(
    "IMG_7732.JPG",
    "kitchen",
    "before",
    "Køkkengulv før arbejdet. Det øverste lag mangler på et større område, og underlaget er synligt.",
    { featured: true },
  ),
  photo("IMG_7790.PNG", "kitchen", "before", "Afskalninger i køkkenloftet."),
  photo(
    "IMG_7789.PNG",
    "kitchen",
    "before",
    "Loft og installationsområde med revner og slid.",
  ),
  photo(
    "IMG_7810.PNG",
    "kitchen",
    "after",
    "Køkken efter arbejdet med nyt, ensartet gulv.",
    { featured: true },
  ),
  photo("IMG_7809.PNG", "kitchen", "after", "Ny belysning."),
];
