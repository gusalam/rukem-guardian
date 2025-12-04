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
      // First get the santunan with anggota details to get nominal and name
      const { data: santunanData, error: fetchError } = await supabase
        .from('santunan')
        .select('*, anggota:anggota_id(nama_kepala_keluarga)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!santunanData) throw new Error('Santunan tidak ditemukan');

      const nominal = santunanData.nominal || 0;
      const namaAnggota = (santunanData.anggota as { nama_kepala_keluarga: string } | null)?.nama_kepala_keluarga || 'Anggota';
      const today = new Date().toISOString().split('T')[0];

      // Update santunan status
      const { data: result, error: updateError } = await supabase
        .from('santunan')
        .update({
          status_santunan: 'approved',
          approved_at: new Date().toISOString(),
          approved_by,
          tanggal_pencairan: today,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create kas_keluar record for the santunan payment
      if (nominal > 0) {
        const { error: kasError } = await supabase
          .from('kas_rukem')
          .insert({
            tanggal: today,
            nominal: nominal,
            jenis_transaksi: 'keluar',
            kategori: 'santunan',
            keterangan: `Pembayaran santunan - Alm. ${namaAnggota}`,
            sumber: 'santunan_approval',
          });

        if (kasError) throw kasError;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santunan'] });
      queryClient.invalidateQueries({ queryKey: ['kas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'stats'] });
      toast.success('Santunan berhasil disetujui dan kas keluar tercatat');
    },
    onError: (error: Error) => {
      const message = getReadableErrorMessage(error.message);
      toast.error(message);
    },
  });
}

