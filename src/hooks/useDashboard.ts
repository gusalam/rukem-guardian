import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useDashboardStats() {
  const queryClient = useQueryClient();

  // Real-time subscription for kas_rukem
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-kas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kas_rukem'
        },
        () => {
          // Invalidate all kas-related queries when kas changes
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
          queryClient.invalidateQueries({ queryKey: ['kas', 'chart'] });
          queryClient.invalidateQueries({ queryKey: ['kas', 'summary'] });
          queryClient.invalidateQueries({ queryKey: ['kas'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Get total anggota count
      const { count: totalAnggota } = await supabase
        .from('anggota')
        .select('*', { count: 'exact', head: true })
        .eq('status_keluar', false);

      // Get kematian count (deceased members)
      const { count: totalMeninggal } = await supabase
        .from('kematian')
        .select('*', { count: 'exact', head: true });

      // Get kas summary - total masuk dan keluar
      const { data: kasData } = await supabase
        .from('kas_rukem')
        .select('jenis_transaksi, nominal, saldo_akhir')
        .order('tanggal', { ascending: false });

      const totalKasMasuk = (kasData || [])
        .filter(k => k.jenis_transaksi === 'masuk')
        .reduce((acc, k) => acc + Number(k.nominal), 0);

      const totalKasKeluar = (kasData || [])
        .filter(k => k.jenis_transaksi === 'keluar')
        .reduce((acc, k) => acc + Number(k.nominal), 0);

      // Get latest saldo
      const latestSaldo = kasData?.[0]?.saldo_akhir || (totalKasMasuk - totalKasKeluar);

      // Get santunan this year (approved = selesai)
      const currentYear = new Date().getFullYear();
      const { data: santunanData, count: santunanCount } = await supabase
        .from('santunan')
        .select('nominal', { count: 'exact' })
        .gte('created_at', `${currentYear}-01-01`)
        .eq('status_santunan', 'approved');

      const totalSantunan = (santunanData || [])
        .reduce((acc, s) => acc + Number(s.nominal || 0), 0);

      return {
        totalAnggota: totalAnggota || 0,
        anggotaAktif: (totalAnggota || 0) - (totalMeninggal || 0),
        totalMeninggal: totalMeninggal || 0,
        totalKas: latestSaldo,
        totalKasMasuk,
        totalKasKeluar,
        totalSantunan,
        santunanCount: santunanCount || 0,
      };
    },
  });
}

export function useRecentKematian(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-kematian'],
    queryFn: async () => {
      const { data: kematianList, error } = await supabase
        .from('kematian')
        .select('*')
        .order('tanggal_wafat', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get anggota names
      const anggotaIds = kematianList?.map(k => k.anggota_id) || [];
      const { data: anggotaList } = await supabase
        .from('anggota')
        .select('id, nama_kepala_keluarga, rt')
        .in('id', anggotaIds);

      const anggotaMap = new Map(anggotaList?.map(a => [a.id, a]));

      // Get santunan status
      const { data: santunanList } = await supabase
        .from('santunan')
        .select('kematian_id, status_santunan')
        .in('kematian_id', kematianList?.map(k => k.id) || []);

      const santunanMap = new Map(santunanList?.map(s => [s.kematian_id, s.status_santunan]));

      return (kematianList || []).map(kematian => {
        const anggota = anggotaMap.get(kematian.anggota_id);
        return {
          id: kematian.id,
          nama: anggota ? `Alm. ${anggota.nama_kepala_keluarga}` : 'Unknown',
          tanggal: kematian.tanggal_wafat,
          rt: anggota?.rt || '-',
          status: santunanMap.get(kematian.id) === 'approved' ? 'selesai' : 'proses',
        };
      });
    },
  });
}
