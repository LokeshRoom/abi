import { createClient } from "@/utils/supabase/server";

// Placeholder object to prevent TypeScript compilation errors in existing files importing it
export const authOptions = {} as any;

export async function getServerSession(...args: any[]) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: (user.user_metadata?.role as "ADMIN" | "CLIENT") || "CLIENT",
      },
    };
  } catch (err) {
    console.error("Error in getServerSession wrapper:", err);
    return null;
  }
}
