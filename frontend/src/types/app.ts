export interface Category {
  _id: string;
  name: string;
}

export interface Entry {
  _id: string;
  vendor: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  createdAt?: string;
}
