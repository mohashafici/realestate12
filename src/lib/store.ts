import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Favorite, Inquiry, Property, Role, User } from "./types";
import { seedInquiries, seedProperties, seedUsers } from "./seed";

interface AppState {
  users: User[];
  currentUserId: string | null;
  properties: Property[];
  favorites: Favorite[];
  inquiries: Inquiry[];

  // auth
  register: (data: { full_name: string; email: string; password: string; role: Role }) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string; role?: Role };
  logout: () => void;
  currentUser: () => User | null;
  updateProfile: (patch: Partial<Pick<User, "full_name" | "email">>) => void;

  // properties
  addProperty: (p: Omit<Property, "id" | "created_at" | "created_by">, agentId: string) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  toggleFeatured: (id: string) => void;

  // favorites
  isFavorite: (buyerId: string, propertyId: string) => boolean;
  toggleFavorite: (buyerId: string, propertyId: string) => void;

  // inquiries
  addInquiry: (data: { buyer_id: string; property_id: string; message: string }) => void;
  setInquiryStatus: (id: string, status: Inquiry["status"]) => void;
}

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: null,
      properties: seedProperties,
      favorites: [],
      inquiries: seedInquiries,

      register: ({ full_name, email, password, role }) => {
        const exists = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { ok: false, error: "Email already registered" };
        const user: User = { id: uid("u"), full_name, email, password, role };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true };
      },
      login: (email, password) => {
        const u = get().users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
        if (!u) return { ok: false, error: "Invalid email or password" };
        set({ currentUserId: u.id });
        return { ok: true, role: u.role };
      },
      logout: () => set({ currentUserId: null }),
      currentUser: () => get().users.find((u) => u.id === get().currentUserId) ?? null,
      updateProfile: (patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
        })),

      addProperty: (p, agentId) => {
        const np: Property = { ...p, id: uid("p"), created_by: agentId, created_at: new Date().toISOString() };
        set((s) => ({ properties: [np, ...s.properties] }));
        return np;
      },
      updateProperty: (id, patch) =>
        set((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProperty: (id) =>
        set((s) => ({
          properties: s.properties.filter((p) => p.id !== id),
          favorites: s.favorites.filter((f) => f.property_id !== id),
          inquiries: s.inquiries.filter((i) => i.property_id !== id),
        })),
      toggleFeatured: (id) =>
        set((s) => ({ properties: s.properties.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)) })),

      isFavorite: (buyerId, propertyId) =>
        !!get().favorites.find((f) => f.buyer_id === buyerId && f.property_id === propertyId),
      toggleFavorite: (buyerId, propertyId) =>
        set((s) => {
          const exists = s.favorites.find((f) => f.buyer_id === buyerId && f.property_id === propertyId);
          if (exists) return { favorites: s.favorites.filter((f) => f !== exists) };
          return { favorites: [...s.favorites, { id: uid("f"), buyer_id: buyerId, property_id: propertyId }] };
        }),

      addInquiry: ({ buyer_id, property_id, message }) =>
        set((s) => ({
          inquiries: [
            { id: uid("i"), buyer_id, property_id, message, status: "Pending", created_at: new Date().toISOString() },
            ...s.inquiries,
          ],
        })),
      setInquiryStatus: (id, status) =>
        set((s) => ({ inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status } : i)) })),
    }),
    { name: "rems-store" }
  )
);

export const formatPrice = (n: number) =>
  n >= 1000 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n) : `$${n}`;
