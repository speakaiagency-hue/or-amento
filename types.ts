
export enum MaterialType {
  IRON = 'Ferro',
  ALUMINUM = 'Alumínio',
  STEEL = 'Aço Inox',
  GLASS = 'Vidro',
  WOOD = 'Madeira'
}

export interface QuoteItem {
  id: string;
  name: string;
  width: number | string; 
  height: number | string;
  quantity: number | string;
  material: MaterialType;
  pricePerUnit: number | string;
  description: string;
  image?: string; // base64
}

export interface BusinessProfile {
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logo?: string; // base64
}

export interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  date: string;
  items: QuoteItem[];
  laborCost: number;
  discount: number;
  total: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface AppState {
  quotes: Quote[];
  activeQuote: Quote | null;
  businessProfile: BusinessProfile;
}
