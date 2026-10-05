export type RoomId = "bathroom" | "bedroom" | "kitchen";

export type Phase = "before" | "during" | "after";

export type ItemStatus = "relevant" | "review" | "excluded";

export type ContentBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Frame = {
  width: number;
  height: number;
  /** Motivets udsnit i filen, når billedet har sorte bjælker. */
  content?: ContentBox;
};

export type EvidenceImage = {
  preview: string;
  full: string;
  file: string;
  room: RoomId;
  phase: Phase;
  caption: string;
  frame: Frame;
  featured?: boolean;
  include?: boolean;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  status: ItemStatus;
  rooms?: RoomId[];
  note?: string;
};

export type Receipt = {
  id: string;
  store: string;
  address?: string;
  date: string;
  time?: string;
  total: number;
  vat?: number;
  net?: number;
  reference?: string;
  register?: string;
  preview: string;
  full: string;
  file: string;
  frame: Frame;
  items: ReceiptItem[];
  note?: string;
};

export type Room = {
  id: RoomId;
  number: string;
  title: string;
  /** Én linje til oversigten øverst på siden. */
  summary: string;
  intro: string;
  beforePoints: string[];
  workDone: string[];
  workNote?: string;
  result: string;
  resultNote?: string;
};

export type LightboxSlide = {
  src: string;
  download: string;
  file: string;
  alt: string;
  caption?: string;
  frame?: Frame;
};

export type ExpenseLine = {
  item: ReceiptItem;
  receipt: Receipt;
};
