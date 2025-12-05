CREATE OR REPLACE FUNCTION public.get_public_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  total_anggota INTEGER;
  saldo_kas NUMERIC;
  total_santunan NUMERIC;
  santunan_count INTEGER;
  total_kematian INTEGER;
BEGIN
  -- Get total active anggota count
  SELECT COUNT(*) INTO total_anggota
  FROM anggota
  WHERE status_keluar = false OR status_keluar IS NULL;
  
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
  
  -- Build result JSON
  result := json_build_object(
    'totalAnggota', total_anggota,
    'saldoKas', saldo_kas,
    'totalSantunan', total_santunan,
    'santunanCount', santunan_count,
    'totalKematian', total_kematian
  );
  
  RETURN result;
END;
$function$