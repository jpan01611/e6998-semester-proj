import { createClient } from "@/utils/supabase/server";

export async function ReportIdentity() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <p className="app-kicker text-xs font-semibold uppercase tracking-[0.24em]">
        Humor Study Stats
      </p>
      <p className="app-muted mt-2 text-sm">
        Signed in as <span className="font-semibold text-foreground">{user?.email ?? "current user"}</span>
      </p>
    </div>
  );
}
