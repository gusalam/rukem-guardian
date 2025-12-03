import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Santunan = Tables<'santunan'>;
type SantunanInsert = TablesInsert<'santunan'>;

// Helper function for readable error messages
function getReadableErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('Santunan tidak dapat dibuat tanpa data kematian')) {
    return 'Santunan tidak dapat dibuat karena belum ada data kematian untuk anggota ini.';
  }
  if (errorMessage.includes('Anggota tidak terdaftar di RUKEM')) {
    return 'Anggota tidak terdaftar sebagai anggota RUKEM aktif.';
  }
  if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
    return 'Santunan untuk anggota ini sudah pernah diajukan.';
  }
  if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
    return 'Data anggota atau kematian tidak ditemukan.';
  }
  if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
    return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Koneksi terputus. Periksa koneksi internet Anda.';
  }
  return `Terjadi kesalahan: ${errorMessage}`;
}

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
      const message = getReadableErrorMessage(error.message);
      toast.error(message);
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
      const message = getReadableErrorMessage(error.message);
      toast.error(message);
    },
  });
}

