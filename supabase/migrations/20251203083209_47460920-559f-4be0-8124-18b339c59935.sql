-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_santunan()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check if kematian exists for this anggota
  IF NOT EXISTS (
    SELECT 1 FROM public.kematian WHERE anggota_id = NEW.anggota_id
  ) THEN
    RAISE EXCEPTION 'Santunan tidak dapat dibuat tanpa data kematian';
  END IF;
  
  -- Check if anggota is registered in RUKEM
  IF NOT EXISTS (
    SELECT 1 FROM public.keanggotaan_rukem 
    WHERE anggota_id = NEW.anggota_id AND terdaftar = true
  ) THEN
    RAISE EXCEPTION 'Anggota tidak terdaftar di RUKEM';
  END IF;
  
  RETURN NEW;
END;
$$;