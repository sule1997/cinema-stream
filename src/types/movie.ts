export interface Movie {
  id: string;
  title: string;
  price: number;
  views: number;
  imageUrl: string;
  category: string;
  description: string;
  releaseYear: number;
  djName: string;
  videoUrl?: string;
  googleDriveUrl?: string;
}

export interface User {
  id: string;
  phone: string;
  role: 'admin' | 'dj' | 'subscriber';
  balance: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'topup' | 'purchase';
  status: 'pending' | 'completed' | 'failed';
  movieId?: string;
  createdAt: Date;
}

// Helper to convert to sentence case
export function toSentenceCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Generate random views between 800-1500
export function generateInitialViews(): number {
  return Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
}

// Format price in Tsh
export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `Tsh ${price.toLocaleString()}`;
}

// Format views count
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
