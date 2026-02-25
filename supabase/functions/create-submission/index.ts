import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_PRODUCTS: Record<string, number> = {
  LETTRE_STANDARD: 500,
  LETTRE_PREMIUM: 1000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nom, email, telephone, type_lettre, contenu_lettre, numero_transaction, product_type, product_price, user_id } = await req.json();

    if (!nom || !telephone || !contenu_lettre || !numero_transaction || !type_lettre) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate product_type server-side - never trust frontend
    const validatedProductType = product_type && VALID_PRODUCTS[product_type] ? product_type : "LETTRE_STANDARD";
    const validatedPrice = VALID_PRODUCTS[validatedProductType];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check for duplicate transaction number
    const { data: existing } = await supabase
      .from("cv_submissions")
      .select("id")
      .eq("numero_transaction", numero_transaction.trim())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Ce numéro de transaction a déjà été utilisé" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.from("cv_submissions").insert({
      nom, email, telephone, type_lettre, contenu_lettre, numero_transaction,
      product_type: validatedProductType,
      product_price: validatedPrice,
      user_id: user_id || null,
      ip_utilisateur: req.headers.get("x-forwarded-for") || null,
    }).select("id").single();

    if (error) throw error;

    return new Response(JSON.stringify({ id: data.id, message: "Soumission créée" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
