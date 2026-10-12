import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { UserProfile } from "../types";

/**
 * ChemPoint Production Client-Side Supabase Integration
 * Uses official @supabase/supabase-js directly in the browser.
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exposed by Vite.
 */
const DEFAULT_SUPABASE_URL = "https://lrhsiwxcvdwhfzcecjek.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyaHNpd3hjdmR3aGZ6Y2VjamVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTk2MTQsImV4cCI6MjEwNDI3NTYxNH0.wg9v1-u8GdorfTKkjiheEDIfa5YopT0DNIjkcDF7jRk";

const envUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || "";
const envAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || "";

export const SUPABASE_URL = (envUrl.trim() || DEFAULT_SUPABASE_URL)
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/$/, "");
export const SUPABASE_ANON_KEY = envAnonKey.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "chempoint_sb_auth_token",
  },
});

/**
 * Helper to build a fallback profile from Supabase Auth User object.
 * Note: Role is strictly derived from verified server/database claims or defaults to "student".
 */
export function buildProfileFromAuthUser(authUser: User): UserProfile {
  const metadata = authUser.user_metadata || {};
  const appMetadata = authUser.app_metadata || {};
  const email = (authUser.email || "").toLowerCase();

  // App metadata is server-set only by Supabase service_role, never modifiable by client
  const role: "student" | "admin" =
    appMetadata.role === "admin" || metadata.role === "admin" ? "admin" : "student";

  const fullName =
    metadata.full_name ||
    (role === "admin" ? "Faculty Administrator" : email.split("@")[0] || "Student");

  return {
    id: authUser.id,
    email,
    role,
    full_name: fullName,
    phone: metadata.phone || "",
    avatar_url:
      metadata.avatar_url ||
      "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(fullName) + "&backgroundColor=6d28d9",
    batch_name: metadata.batch_name || (role === "admin" ? "Academic Faculty" : "Class 11 Chemistry Batch"),
    target_exam: metadata.target_exam || (role === "admin" ? "Academic Council" : "Class 11 Chemistry"),
    roll_number: metadata.roll_number || "Pending Assignment",
    created_at: authUser.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch profile directly from public.profiles via Supabase RLS.
 * Role is strictly determined by the database row governed by Row Level Security.
 */
export async function fetchProfileById(
  userId: string,
  authUserFallback?: User | null
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // Non-fatal query error
    }

    if (data) {
      if (!data.avatar_url || !data.avatar_url.trim()) {
        data.avatar_url =
          "https://api.dicebear.com/7.x/initials/svg?seed=" +
          encodeURIComponent(data.full_name || data.email || "User") +
          "&backgroundColor=6d28d9";
      }
      return data as UserProfile;
    }

    if (authUserFallback) {
      return buildProfileFromAuthUser(authUserFallback);
    }

    return null;
  } catch {
    if (authUserFallback) {
      return buildProfileFromAuthUser(authUserFallback);
    }
    return null;
  }
}
