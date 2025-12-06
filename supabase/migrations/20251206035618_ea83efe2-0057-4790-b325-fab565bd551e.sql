-- Update get_public_stats function to include detailed anggota breakdown
CREATE OR REPLACE FUNCTION public.get_public_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  total_anggota_all INTEGER;
  total_anggota_aktif INTEGER;
  total_anggota_meninggal INTEGER;
  saldo_kas NUMERIC;
  total_santunan NUMERIC;
  santunan_count INTEGER;
  total_kematian INTEGER;
BEGIN
  -- Get TOTAL anggota (all members regardless of status)
  SELECT COUNT(*) INTO total_anggota_all
  FROM anggota;
  
  -- Get total AKTIF anggota (not keluar AND not meninggal)
  SELECT COUNT(*) INTO total_anggota_aktif
  FROM anggota a
  WHERE (a.status_keluar = false OR a.status_keluar IS NULL)
    AND NOT EXISTS (SELECT 1 FROM kematian k WHERE k.anggota_id = a.id);
  
  -- Get total MENINGGAL anggota (those in kematian table)
  SELECT COUNT(*) INTO total_anggota_meninggal
  FROM kematian;
  
  -- Calculate saldo from all transactions (masuk - keluar)
  SELECT 
    COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' THEN nominal ELSE -nominal END), 0)
  INTO saldo_kas
  FROM kas_rukem;
  
  -- Get total santunan amount and count (approved only)
  SELECT 
    COALESCE(SUM(nominal), 0),
    COUNT(*)
  INTO total_santunan, santunan_count
  FROM santunan
  WHERE status_santunan = 'approved';
  
  -- Get total kematian count
  SELECT COUNT(*) INTO total_kematian
  FROM kematian;
  
  -- Build result JSON with detailed anggota stats
  result := json_build_object(
    'totalAnggota', total_anggota_all,
    'totalAnggotaAktif', total_anggota_aktif,
    'totalAnggotaMeninggal', total_anggota_meninggal,
    'saldoKas', saldo_kas,
    'totalSantunan', total_santunan,
    'santunanCount', santunan_count,
    'totalKematian', total_kematian
  );
  
  RETURN result;
END;
$function$;