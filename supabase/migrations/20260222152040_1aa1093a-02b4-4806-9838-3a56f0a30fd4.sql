
-- Fix permissive INSERT policy - require at least a non-empty telephone
DROP POLICY "Users insert submissions" ON public.cv_submissions;
CREATE POLICY "Anyone can insert submissions" ON public.cv_submissions FOR INSERT WITH CHECK (
  nom IS NOT NULL AND telephone IS NOT NULL AND contenu_lettre IS NOT NULL
);
