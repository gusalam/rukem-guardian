import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Anggota = Tables<'anggota'>;
type AnggotaInsert = TablesInsert<'anggota'>;
type AnggotaUpdate = TablesUpdate<'anggota'>;

export interface AnggotaWithStatus extends Anggota {
  keanggotaan_rukem?: Tables<'keanggotaan_rukem'> | null;
  kematian?: Tables<'kematian'> | null;
  is_meninggal: boolean;
}

export function useAnggota() {
  return useQuery({
    queryKey: ['anggota'],
    queryFn: async (): Promise<AnggotaWithStatus[]> => {
      const { data: anggotaList, error: anggotaError } = await supabase
        .from('anggota')
        .select('*')
        .order('created_at', { ascending: false });

      if (anggotaError) throw anggotaError;

      // Get keanggotaan data
      const { data: keanggotaanList } = await supabase
        .from('keanggotaan_rukem')
        .select('*');

      // Get kematian data
      const { data: kematianList } = await supabase
        .from('kematian')
        .select('*');

      const keanggotaanMap = new Map(keanggotaanList?.map(k => [k.anggota_id, k]));
      const kematianMap = new Map(kematianList?.map(k => [k.anggota_id, k]));

      return (anggotaList || []).map(anggota => ({
        ...anggota,
        keanggotaan_rukem: keanggotaanMap.get(anggota.id) || null,
        kematian: kematianMap.get(anggota.id) || null,
        is_meninggal: kematianMap.has(anggota.id),
      }));
    },
  });
}

export function useAnggotaById(id: string | undefined) {
  return useQuery({
    queryKey: ['anggota', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAnggota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnggotaInsert) => {
      const { data: result, error } = await supabase
        .from('anggota')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggota'] });
      toast.success('Anggota berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan anggota: ${error.message}`);
    },
  });
}

export function useUpdateAnggota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AnggotaUpdate }) => {
      const { data: result, error } = await supabase
        .from('anggota')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggota'] });
      toast.success('Data anggota berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error(`Gagal memperbarui anggota: ${error.message}`);
    },
  });
}

export function useActiveAnggota() {
  return useQuery({
    queryKey: ['anggota', 'active'],
    queryFn: async () => {
      // Get all anggota that don't have death records
      const { data: kematianList } = await supabase
        .from('kematian')
        .select('anggota_id');

      const deceasedIds = new Set(kematianList?.map(k => k.anggota_id) || []);

      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('status_keluar', false)
        .order('nama_kepala_keluarga');

      if (error) throw error;
      return (data || []).filter(a => !deceasedIds.has(a.id));
    },
  });
}
