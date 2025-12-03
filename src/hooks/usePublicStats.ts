import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface PublicStats {
  totalAnggota: number;
  saldoKas: number;
  totalSantunan: number;
  santunanCount: number;
  totalKematian: number;
}

export function usePublicStats() {
  const queryClient = useQueryClient();

  // Real-time subscriptions for public stats
  useEffect(() => {
    const channels = [
      supabase
        .channel('public-kas-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kas_rukem' }, () => {
          queryClient.invalidateQueries({ queryKey: ['public', 'stats'] });
        })
        .subscribe(),
      supabase
        .channel('public-anggota-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'anggota' }, () => {
          queryClient.invalidateQueries({ queryKey: ['public', 'stats'] });
        })
        .subscribe(),
      supabase
        .channel('public-santunan-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'santunan' }, () => {
          queryClient.invalidateQueries({ queryKey: ['public', 'stats'] });
        })
        .subscribe(),
      supabase
        .channel('public-kematian-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kematian' }, () => {
          queryClient.invalidateQueries({ queryKey: ['public', 'stats'] });
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['public', 'stats'],
    queryFn: async (): Promise<PublicStats> => {
      // Use the database function to get public stats (bypasses RLS)
      const { data, error } = await supabase.rpc('get_public_stats');

      if (error) {
        console.error('Error fetching public stats:', error);
        return {
          totalAnggota: 0,
          saldoKas: 0,
          totalSantunan: 0,
          santunanCount: 0,
          totalKematian: 0,
        };
      }

      // Handle the response - it returns a JSON object
      const stats = data as unknown as PublicStats;
      
      return {
        totalAnggota: stats?.totalAnggota || 0,
        saldoKas: stats?.saldoKas || 0,
        totalSantunan: stats?.totalSantunan || 0,
        santunanCount: stats?.santunanCount || 0,
        totalKematian: stats?.totalKematian || 0,
      };
    },
  });
}
