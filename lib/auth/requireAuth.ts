import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isValidatorAuthed } from "@/lib/validator/session";

export async function requireAuth() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (!error && data.user) {
    return { kind: "user" as const, user: data.user, supabase };
  }

  if (await isValidatorAuthed()) {
    return {
      kind: "validator" as const,
      user: { id: "validator", email: process.env.VALIDATOR_USERNAME || "asrt-validator", user_metadata: { full_name: "ASRT Validator" } },
      supabase,
    };
  }

  return { kind: "none" as const, user: null, supabase };
}
