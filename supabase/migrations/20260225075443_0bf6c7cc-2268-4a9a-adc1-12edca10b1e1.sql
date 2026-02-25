
-- Add unique constraint on numero_transaction
ALTER TABLE public.cv_submissions ADD CONSTRAINT unique_numero_transaction UNIQUE (numero_transaction);

-- Add validated_by and validated_at columns
ALTER TABLE public.cv_submissions ADD COLUMN validated_by uuid REFERENCES auth.users(id);
ALTER TABLE public.cv_submissions ADD COLUMN validated_at timestamp with time zone;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_cv_submissions_date_creation ON public.cv_submissions (date_creation DESC);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_statut ON public.cv_submissions (statut);
