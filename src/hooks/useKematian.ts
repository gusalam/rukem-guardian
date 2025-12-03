import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Kematian = Tables<'kematian'>;
type KematianInsert = TablesInsert<'kematian'>;

export interface KematianWithAnggota extends Kematian {
  anggota?: Tables<'anggota'> | null;
}

export function useKematian() {
  return useQuery({
    queryKey: ['kematian'],
    queryFn: async (): Promise<KematianWithAnggota[]> => {
      const { data: kematianList, error } = await supabase
        .from('kematian')
        .select('*')
        .order('tanggal_wafat', { ascending: false });

      if (error) throw error;

      // Get anggota data
      const anggotaIds = kematianList?.map(k => k.anggota_id) || [];
      const { data: anggotaList } = await supabase
        .from('anggota')
        .select('*')
        .in('id', anggotaIds);

      const anggotaMap = new Map(anggotaList?.map(a => [a.id, a]));

      return (kematianList || []).map(kematian => ({
        ...kematian,
        anggota: anggotaMap.get(kematian.anggota_id) || null,
      }));
    },
  });
}

export function useCreateKematian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KematianInsert) => {
      const { data: result, error } = await supabase
        .from('kematian')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kematian'] });
      queryClient.invalidateQueries({ queryKey: ['anggota'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Laporan kematian berhasil dicatat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal mencatat kematian: ${error.message}`);
    },
  });
}

export function useVerifyKematian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verified_by }: { id: string; verified_by: string }) => {
      const { data: result, error } = await supabase
        .from('kematian')
        .update({
          status_verifikasi: 'verified',
          verified_at: new Date().toISOString(),
          verified_by,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kematian'] });
      toast.success('Laporan kematian berhasil diverifikasi');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memverifikasi: ${error.message}`);
    },
  });
}
