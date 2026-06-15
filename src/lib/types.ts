export type Role = "agent" | "buyer";

export interface User {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
}

export type PropertyType = "House" | "Apartment" | "Villa" | "Land" | "Office";
export type PropertyStatus = "Available" | "Rented" | "Sold";

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  images: string[];
  status: PropertyStatus;
  featured: boolean;
  created_by: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  buyer_id: string;
  property_id: string;
}

export type InquiryStatus = "Pending" | "Read" | "Responded";

export interface Inquiry {
  id: string;
  buyer_id: string;
  property_id: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
}
