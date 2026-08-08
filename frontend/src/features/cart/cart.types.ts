export interface ArtworkRecord {
  secureUrl: string;
  placement: "front" | "back";
  originalFilename: string;
}

export interface CustomizationRecord {
  _id: string;
  requestID: string;
  category: "Oversize" | "Raglan";
  color: string;
  size: string;
  quantity: number;
  artwork: ArtworkRecord[];
  customText?: { text?: string; placement?: "front" | "back" };
  unitPrice: number;
  totalPrice: number;
}

export interface CartRecord {
  items: Array<{
    _id: string;
    type: "normal" | "custom";
    quantity: number;
    size?: string;
    item?: { _id: string; name: string; color: string; price: number; images?: Array<{ image: string }> };
    customization?: CustomizationRecord;
  }>;
}
