
-- Create products reference table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public catalog)
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);

-- Only super_admin can manage products
CREATE POLICY "Super admin manages products" ON public.products FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default products
INSERT INTO public.products (id, name, price, description) VALUES
  ('LETTRE_STANDARD', 'Lettre Standard', 500, 'Export PDF simple'),
  ('LETTRE_PREMIUM', 'Lettre Premium', 1000, 'Export PDF avec mise en page premium');

-- Add product columns to cv_submissions
ALTER TABLE public.cv_submissions
  ADD COLUMN product_type TEXT DEFAULT 'LETTRE_STANDARD',
  ADD COLUMN product_price INTEGER DEFAULT 500;
