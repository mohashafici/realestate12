import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Favorite, Inquiry, Property, Role, User } from "./types";

interface AppState {
  ready: boolean;
  loading: boolean;
  currentUserId: string | null;
  users: User[]; // profiles cache (for buyer/agent name lookups)
  properties: Property[];
  favorites: Favorite[];
  inquiries: Inquiry[];

  init: () => Promise<void>;
  refresh: () => Promise<void>;

  currentUser: () => User | null;

  register: (data: { full_name: string; email: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "full_name" | "email">>) => Promise<void>;

  addProperty: (
    data: Omit<Property, "id" | "created_at" | "created_by" | "images" | "image_paths">,
    imageFiles: File[],
    agentId: string
  ) => Promise<Property | null>;
  updateProperty: (
    id: string,
    patch: Partial<Omit<Property, "images" | "image_paths">>,
    newFiles?: File[],
    removedImagePaths?: string[]
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;

  isFavorite: (buyerId: string, propertyId: string) => boolean;
  toggleFavorite: (buyerId: string, propertyId: string) => Promise<void>;

  addInquiry: (data: { buyer_id: string; property_id: string; message: string }) => Promise<void>;
  setInquiryStatus: (id: string, status: Inquiry["status"]) => Promise<void>;
}

const SIGNED_URL_EXPIRES = 60 * 60 * 24 * 365; // 1 year

async function signImagePaths(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { data, error } = await supabase.storage.from("properties-images").createSignedUrls(paths, SIGNED_URL_EXPIRES);
  if (error || !data) return [];
  return data.map((d) => d.signedUrl).filter((u): u is string => !!u);
}

interface PropertyRow {
  id: string;
  title: string;
  description: string;
  property_type: Property["type"];
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  status: Property["status"];
  featured: boolean;
  created_by: string;
  created_at: string;
  property_images?: { image_url: string; position: number }[];
}

async function mapProperty(row: PropertyRow): Promise<Property> {
  const imgs = (row.property_images ?? []).slice().sort((a, b) => a.position - b.position);
  const paths = imgs.map((i) => i.image_url);
  const signed = await signImagePaths(paths);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.property_type,
    price: Number(row.price),
    location: row.location,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area_size: Number(row.area_size),
    images: signed,
    image_paths: paths,
    status: row.status,
    featured: row.featured,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

async function uploadFiles(files: File[], agentId: string): Promise<string[]> {
  const paths: string[] = [];
  for (const f of files) {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${agentId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("properties-images").upload(path, f, {
      cacheControl: "31536000",
      upsert: false,
      contentType: f.type || undefined,
    });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}

export const useApp = create<AppState>()((set, get) => ({
  ready: false,
  loading: false,
  currentUserId: null,
  users: [],
  properties: [],
  favorites: [],
  inquiries: [],

  init: async () => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    set({ currentUserId: uid });
    await get().refresh();
    set({ ready: true });

    supabase.auth.onAuthStateChange(async (_event, sess) => {
      const newUid = sess?.user.id ?? null;
      if (newUid !== get().currentUserId) {
        set({ currentUserId: newUid });
        await get().refresh();
      }
    });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const [profilesRes, propsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role"),
        supabase
          .from("properties")
          .select("*, property_images(image_url, position)")
          .order("created_at", { ascending: false }),
      ]);

      const users: User[] = (profilesRes.data ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
      }));

      const properties: Property[] = await Promise.all(((propsRes.data ?? []) as PropertyRow[]).map(mapProperty));

      let favorites: Favorite[] = [];
      let inquiries: Inquiry[] = [];
      if (get().currentUserId) {
        const [favRes, inqRes] = await Promise.all([
          supabase.from("favorites").select("*"),
          supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
        ]);
        favorites = (favRes.data ?? []) as Favorite[];
        inquiries = (inqRes.data ?? []) as Inquiry[];
      }
      set({ users, properties, favorites, inquiries });
    } finally {
      set({ loading: false });
    }
  },

  currentUser: () => {
    const id = get().currentUserId;
    return id ? get().users.find((u) => u.id === id) ?? null : null;
  },

  register: async ({ full_name, email, password, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name, role },
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) {
      // wait for trigger to create profile; sign-in
      const login = await supabase.auth.signInWithPassword({ email, password });
      if (login.error) return { ok: false, error: login.error.message };
    }
    set({ currentUserId: data.user?.id ?? null });
    await get().refresh();
    return { ok: true, role };
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    set({ currentUserId: data.user.id });
    await get().refresh();
    const role = get().users.find((u) => u.id === data.user.id)?.role;
    return { ok: true, role };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUserId: null, favorites: [], inquiries: [] });
  },

  updateProfile: async (patch) => {
    const id = get().currentUserId;
    if (!id) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) throw error;
    set({ users: get().users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  },

  addProperty: async (data, imageFiles, agentId) => {
    const paths = await uploadFiles(imageFiles, agentId);
    const { data: row, error } = await supabase
      .from("properties")
      .insert({
        title: data.title,
        description: data.description,
        property_type: data.type,
        price: data.price,
        location: data.location,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area_size: data.area_size,
        status: data.status,
        featured: data.featured,
        created_by: agentId,
      })
      .select()
      .single();
    if (error || !row) throw error;
    if (paths.length > 0) {
      const { error: imgErr } = await supabase
        .from("property_images")
        .insert(paths.map((p, i) => ({ property_id: row.id, image_url: p, position: i })));
      if (imgErr) throw imgErr;
    }
    await get().refresh();
    return get().properties.find((p) => p.id === row.id) ?? null;
  },

  updateProperty: async (id, patch, newFiles, removedImagePaths) => {
    const update: Record<string, unknown> = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.type !== undefined) update.property_type = patch.type;
    if (patch.price !== undefined) update.price = patch.price;
    if (patch.location !== undefined) update.location = patch.location;
    if (patch.bedrooms !== undefined) update.bedrooms = patch.bedrooms;
    if (patch.bathrooms !== undefined) update.bathrooms = patch.bathrooms;
    if (patch.area_size !== undefined) update.area_size = patch.area_size;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.featured !== undefined) update.featured = patch.featured;
    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("properties").update(update as any).eq("id", id);
      if (error) throw error;
    }
    if (removedImagePaths && removedImagePaths.length > 0) {
      await supabase.from("property_images").delete().eq("property_id", id).in("image_url", removedImagePaths);
      await supabase.storage.from("properties-images").remove(removedImagePaths);
    }
    if (newFiles && newFiles.length > 0) {
      const uid = get().currentUserId;
      if (uid) {
        const paths = await uploadFiles(newFiles, uid);
        const { data: existing } = await supabase.from("property_images").select("position").eq("property_id", id);
        const base = (existing ?? []).reduce((m: number, r: any) => Math.max(m, r.position), -1) + 1;
        await supabase.from("property_images").insert(paths.map((p, i) => ({ property_id: id, image_url: p, position: base + i })));
      }
    }
    await get().refresh();
  },

  deleteProperty: async (id) => {
    const prop = get().properties.find((p) => p.id === id);
    if (prop?.image_paths && prop.image_paths.length > 0) {
      await supabase.storage.from("properties-images").remove(prop.image_paths);
    }
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw error;
    set({
      properties: get().properties.filter((p) => p.id !== id),
      favorites: get().favorites.filter((f) => f.property_id !== id),
      inquiries: get().inquiries.filter((i) => i.property_id !== id),
    });
  },

  toggleFeatured: async (id) => {
    const prop = get().properties.find((p) => p.id === id);
    if (!prop) return;
    const next = !prop.featured;
    const { error } = await supabase.from("properties").update({ featured: next }).eq("id", id);
    if (error) throw error;
    set({ properties: get().properties.map((p) => (p.id === id ? { ...p, featured: next } : p)) });
  },

  isFavorite: (buyerId, propertyId) =>
    !!get().favorites.find((f) => f.buyer_id === buyerId && f.property_id === propertyId),

  toggleFavorite: async (buyerId, propertyId) => {
    const exists = get().favorites.find((f) => f.buyer_id === buyerId && f.property_id === propertyId);
    if (exists) {
      const { error } = await supabase.from("favorites").delete().eq("id", exists.id);
      if (error) throw error;
      set({ favorites: get().favorites.filter((f) => f.id !== exists.id) });
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ buyer_id: buyerId, property_id: propertyId })
        .select()
        .single();
      if (error || !data) throw error;
      set({ favorites: [...get().favorites, data as Favorite] });
    }
  },

  addInquiry: async ({ buyer_id, property_id, message }) => {
    const { data, error } = await supabase
      .from("inquiries")
      .insert({ buyer_id, property_id, message })
      .select()
      .single();
    if (error || !data) throw error;
    set({ inquiries: [data as Inquiry, ...get().inquiries] });
  },

  setInquiryStatus: async (id, status) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw error;
    set({ inquiries: get().inquiries.map((i) => (i.id === id ? { ...i, status } : i)) });
  },
}));

export const formatPrice = (n: number) =>
  n >= 1000
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
    : `$${n}`;
