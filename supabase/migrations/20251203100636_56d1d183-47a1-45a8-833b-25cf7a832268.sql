-- Insert keanggotaan_rukem records for all existing anggota that don't have one
INSERT INTO public.keanggotaan_rukem (anggota_id, terdaftar, status_keanggotaan, tanggal_mulai)
SELECT 
  a.id,
  true,
  'aktif',
  COALESCE(a.tanggal_daftar, CURRENT_DATE)
FROM public.anggota a
WHERE NOT EXISTS (
  SELECT 1 FROM public.keanggotaan_rukem kr WHERE kr.anggota_id = a.id
);

-- Create trigger to auto-create keanggotaan_rukem when new anggota is created
CREATE OR REPLACE FUNCTION public.handle_new_anggota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.keanggotaan_rukem (anggota_id, terdaftar, status_keanggotaan, tanggal_mulai)
  VALUES (NEW.id, true, 'aktif', COALESCE(NEW.tanggal_daftar, CURRENT_DATE));
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_anggota_created ON public.anggota;
CREATE TRIGGER on_anggota_created
  AFTER INSERT ON public.anggota
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_anggota();