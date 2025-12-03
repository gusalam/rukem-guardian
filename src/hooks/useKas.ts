import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type KasRukem = Tables<'kas_rukem'>;

export function useKas() {
  return useQuery({
    queryKey: ['kas'],
    queryFn: async (): Promise<KasRukem[]> => {
      const { data, error } = await supabase
        .from('kas_rukem')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useKasSummary() {
  return useQuery({
    queryKey: ['kas', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kas_rukem')
        .select('jenis_transaksi, nominal');

      if (error) throw error;

      const totalMasuk = (data || [])
        .filter(t => t.jenis_transaksi === 'masuk')
        .reduce((acc, t) => acc + Number(t.nominal), 0);

      const totalKeluar = (data || [])
        .filter(t => t.jenis_transaksi === 'keluar')
        .reduce((acc, t) => acc + Number(t.nominal), 0);

      // Get latest saldo from most recent transaction
      const { data: latestData } = await supabase
        .from('kas_rukem')
        .select('saldo_akhir')
        .order('tanggal', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        totalMasuk,
        totalKeluar,
        saldo: latestData?.saldo_akhir || (totalMasuk - totalKeluar),
      };
    },
  });
}

export function useKasChartData() {
  return useQuery({
    queryKey: ['kas', 'chart'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('kas_rukem')
        .select('tanggal, jenis_transaksi, nominal')
        .gte('tanggal', sixMonthsAgo.toISOString().split('T')[0])
        .order('tanggal');

      if (error) throw error;

      // Group by month
      const monthlyData = new Map<string, { masuk: number; keluar: number }>();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

      (data || []).forEach(t => {
        const date = new Date(t.tanggal);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { masuk: 0, keluar: 0 });
        }
        
        const monthData = monthlyData.get(monthKey)!;
        if (t.jenis_transaksi === 'masuk') {
          monthData.masuk += Number(t.nominal);
        } else {
          monthData.keluar += Number(t.nominal);
        }
      });

      return Array.from(monthlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, data]) => {
          const [year, month] = key.split('-').map(Number);
          return {
            bulan: months[month],
            masuk: data.masuk,
            keluar: data.keluar,
          };
        });
    },
  });
}

interface AddKasMasukInput {
  tanggal: string;
  nominal: number;
  keterangan: string;
}

export function useAddKasMasuk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddKasMasukInput) => {
      const { data, error } = await supabase
        .from('kas_rukem')
        .insert({
          tanggal: input.tanggal,
          nominal: input.nominal,
          keterangan: input.keterangan,
          jenis_transaksi: 'masuk',
          kategori: 'iuran',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
