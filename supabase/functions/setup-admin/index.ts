import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, password } = await req.json().catch(() => ({
      email: null,
      password: null,
    }));

    const adminEmail = email || "admin@lettres-app.local";
    const adminPassword = password || "Admin123!";

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);

    if (existingUser) {
      // User exists - ensure they have super_admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", existingUser.id);

      const hasSuperAdmin = roles?.some(r => r.role === "super_admin");
      if (!hasSuperAdmin) {
        await supabase.from("user_roles").upsert(
          { user_id: existingUser.id, role: "super_admin" },
          { onConflict: "user_id,role" }
        );
      }

      return new Response(JSON.stringify({ message: "Admin configuré", email: adminEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new user
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (error) throw error;

    // The trigger creates profile + 'user' role. Upgrade to super_admin.
    const { error: roleError } = await supabase
      .from("user_roles")
      .update({ role: "super_admin" })
      .eq("user_id", newUser.user.id);
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ message: "Super Admin créé avec succès", email: adminEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
