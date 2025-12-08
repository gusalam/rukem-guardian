import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  Loader2,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PendingAnggota {
  id: string;
  nama_kepala_keluarga: string;
  email: string;
  no_hp: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  tanggal_daftar: string;
  created_at: string;
  status_anggota: string;
}

export default function ApprovalAnggota() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAnggota, setSelectedAnggota] = useState<PendingAnggota | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Fetch pending anggota
  const { data: pendingList, isLoading } = useQuery({
    queryKey: ['pending-anggota'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('status_anggota', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingAnggota[];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (anggotaId: string) => {
      const { error } = await supabase
        .from('anggota')
        .update({
          status_anggota: 'active',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', anggotaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-anggota'] });
      queryClient.invalidateQueries({ queryKey: ['anggota'] });
      toast.success('Anggota berhasil disetujui');
      setShowApproveConfirm(false);
      setSelectedAnggota(null);
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyetujui: ${error.message}`);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (anggotaId: string) => {
      const { error } = await supabase
        .from('anggota')
        .update({
          status_anggota: 'rejected',
        })
        .eq('id', anggotaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-anggota'] });
      queryClient.invalidateQueries({ queryKey: ['anggota'] });
      toast.success('Pendaftaran anggota ditolak');
      setShowRejectConfirm(false);
      setSelectedAnggota(null);
    },
    onError: (error: Error) => {
      toast.error(`Gagal menolak: ${error.message}`);
    },
  });

  const handleApprove = (anggota: PendingAnggota) => {
    setSelectedAnggota(anggota);
    setShowApproveConfirm(true);
  };

  const handleReject = (anggota: PendingAnggota) => {
    setSelectedAnggota(anggota);
    setShowRejectConfirm(true);
  };

  const handleViewDetail = (anggota: PendingAnggota) => {
    setSelectedAnggota(anggota);
    setShowDetail(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approval Anggota</h1>
          <p className="text-muted-foreground mt-1">
            Setujui atau tolak pendaftaran anggota baru
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingList?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
            </div>
          </div>
        </div>

        {/* Pending List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingList && pendingList.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingList.map((anggota) => (
                <div key={anggota.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground truncate">
                          {anggota.nama_kepala_keluarga}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{anggota.email}</span>
                        </div>
                        {anggota.no_hp && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{anggota.no_hp}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>RT {anggota.rt || '-'} / RW {anggota.rw || '-'}, {anggota.kelurahan || '-'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Daftar: {anggota.created_at ? format(new Date(anggota.created_at), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewDetail(anggota)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleApprove(anggota)}
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                        title="Setujui"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </button>
                      <button
                        onClick={() => handleReject(anggota)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        title="Tolak"
                      >
                        <XCircle className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Tidak ada pendaftaran yang menunggu persetujuan</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Detail Pendaftaran</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Nama Kepala Keluarga</label>
                <p className="font-medium">{selectedAnggota.nama_kepala_keluarga}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedAnggota.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">No. HP</label>
                  <p className="font-medium">{selectedAnggota.no_hp || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Alamat</label>
                <p className="font-medium">{selectedAnggota.alamat || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">RT/RW</label>
                  <p className="font-medium">{selectedAnggota.rt || '-'} / {selectedAnggota.rw || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Kelurahan</label>
                  <p className="font-medium">{selectedAnggota.kelurahan || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Kecamatan</label>
                  <p className="font-medium">{selectedAnggota.kecamatan || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Kota</label>
                  <p className="font-medium">{selectedAnggota.kota || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tanggal Pendaftaran</label>
                <p className="font-medium">
                  {selectedAnggota.created_at ? format(new Date(selectedAnggota.created_at), 'dd MMMM yyyy, HH:mm', { locale: id }) : '-'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowDetail(false)}
                className="btn-secondary"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowDetail(false);
                  handleReject(selectedAnggota);
                }}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
              >
                Tolak
              </button>
              <button
                onClick={() => {
                  setShowDetail(false);
                  handleApprove(selectedAnggota);
                }}
                className="btn-primary"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => selectedAnggota && approveMutation.mutate(selectedAnggota.id)}
        title="Setujui Pendaftaran"
        message={`Apakah Anda yakin ingin menyetujui pendaftaran ${selectedAnggota?.nama_kepala_keluarga}? Anggota akan dapat login ke dashboard.`}
        confirmText="Ya, Setujui"
        cancelText="Batal"
        isLoading={approveMutation.isPending}
      />

      {/* Reject Confirm Dialog */}
      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => selectedAnggota && rejectMutation.mutate(selectedAnggota.id)}
        title="Tolak Pendaftaran"
        message={`Apakah Anda yakin ingin menolak pendaftaran ${selectedAnggota?.nama_kepala_keluarga}?`}
        confirmText="Ya, Tolak"
        cancelText="Batal"
        isLoading={rejectMutation.isPending}
      />
    </DashboardLayout>
  );
}
