import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Santunan = Tables<'santunan'>;
type SantunanInsert = TablesInsert<'santunan'>;

export interface SantunanWithDetails extends Santunan {
  anggota?: Tables<'anggota'> | null;
  kematian?: Tables<'kematian'> | null;
}

export function useSantunan() {
  return useQuery({
    queryKey: ['santunan'],
    queryFn: async (): Promise<SantunanWithDetails[]> => {
      const { data: santunanList, error } = await supabase
        .from('santunan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get anggota data
      const anggotaIds = santunanList?.map(s => s.anggota_id) || [];
      const kematianIds = santunanList?.map(s => s.kematian_id) || [];
      
      const { data: anggotaList } = await supabase
        .from('anggota')
        .select('*')
        .in('id', anggotaIds);

      const { data: kematianList } = await supabase
        .from('kematian')
        .select('*')
        .in('id', kematianIds);

      const anggotaMap = new Map(anggotaList?.map(a => [a.id, a]));
      const kematianMap = new Map(kematianList?.map(k => [k.id, k]));

      return (santunanList || []).map(santunan => ({
        ...santunan,
        anggota: anggotaMap.get(santunan.anggota_id) || null,
        kematian: kematianMap.get(santunan.kematian_id) || null,
      }));
    },
  });
}

export function useCreateSantunan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SantunanInsert) => {
      const { data: result, error } = await supabase
        .from('santunan')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santunan'] });
      toast.success('Pengajuan santunan berhasil dibuat');
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat pengajuan: ${error.message}`);
    },
  });
}

export function useApproveSantunan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approved_by }: { id: string; approved_by: string }) => {
      const { data: result, error } = await supabase
        .from('santunan')
        .update({
          status_santunan: 'approved',
          approved_at: new Date().toISOString(),
          approved_by,
          tanggal_pencairan: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santunan'] });
      queryClient.invalidateQueries({ queryKey: ['kas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Santunan berhasil disetujui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyetujui santunan: ${error.message}`);
    },
  });
}

