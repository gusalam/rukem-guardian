import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSantunan, useCreateSantunan, useApproveSantunan } from '@/hooks/useSantunan';
import { useKematian } from '@/hooks/useKematian';
import { Search, Eye, CheckCircle, Clock, Wallet, DollarSign, Calendar, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

const statusConfig = { 
  pending: { label: 'Proses', color: 'badge-warning', icon: Clock }, 
  approved: { label: 'Selesai', color: 'badge-success', icon: CheckCircle },
};

export default function Santunan() {
  const { user, hasPermission } = useAuth();
  const { data: santunanList = [], isLoading } = useSantunan();
  const { data: kematianList = [] } = useKematian();
  const createSantunan = useCreateSantunan();
  const approveSantunan = useApproveSantunan();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [selectedSantunan, setSelectedSantunan] = useState<typeof santunanList[0] | null>(null);
  const [santunanToApprove, setSantunanToApprove] = useState<typeof santunanList[0] | null>(null);
  const [formData, setFormData] = useState({ kematian_id: '', nominal: 5000000 });

  const isAdminRW = hasPermission(['admin_rw']);
  const canApprove = isAdminRW;
  const canCreate = hasPermission(['admin_rt', 'operator']);

  // Get kematian that don't have santunan yet
  const availableKematian = kematianList.filter(k => 
    !santunanList.some(s => s.kematian_id === k.id)
  );

  const filteredSantunan = santunanList.filter((s) => {
    const matchesSearch = s.anggota?.nama_kepala_keluarga?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status_santunan === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const totalDisbursed = santunanList.filter((s) => s.status_santunan === 'approved').reduce((acc, s) => acc + (s.nominal || 0), 0);
  const totalPending = santunanList.filter((s) => s.status_santunan === 'pending').length;

  const handleApproveClick = (santunan: typeof santunanList[0]) => {
    setSantunanToApprove(santunan);
    setShowConfirmApprove(true);
  };

  const handleConfirmApprove = async () => { 
    if (!user?.id || !santunanToApprove) return; 
    try {
      await approveSantunan.mutateAsync({ id: santunanToApprove.id, approved_by: user.id }); 
      setShowConfirmApprove(false);
      setSantunanToApprove(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kematian_id) {
      toast.error('Pilih data kematian terlebih dahulu');
      return;
    }
    setShowConfirmCreate(true);
  };

  const handleConfirmCreate = async () => {
    const selectedKematian = kematianList.find(k => k.id === formData.kematian_id);
    if (!selectedKematian) return;
    
    try {
      await createSantunan.mutateAsync({
        kematian_id: formData.kematian_id,
        anggota_id: selectedKematian.anggota_id,
        nominal: formData.nominal,
        status_santunan: 'pending',
      });
      setShowFormModal(false);
      setShowConfirmCreate(false);
      setFormData({ kematian_id: '', nominal: 5000000 });
    } catch (error) {
      setShowConfirmCreate(false);
    }
  };

  const selectedKematianForForm = kematianList.find(k => k.id === formData.kematian_id);

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Santunan Kematian</h1>
            <p className="text-sm text-muted-foreground">Kelola santunan untuk keluarga almarhum</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowFormModal(true)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="w-5 h-5" /><span>Input Santunan</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rukem-success-light flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-rukem-success" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-foreground truncate">{formatCurrency(totalDisbursed)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Disalurkan</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rukem-warning-light flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-rukem-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-foreground truncate">{totalPending}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Menunggu ACC RW</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rukem-blue-light flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-rukem-blue" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-foreground truncate">{santunanList.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Santunan</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama..." className="input-modern pl-12 w-full" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'pending', 'approved'].map((status) => (
              <button 
                key={status} 
                onClick={() => setStatusFilter(status)} 
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap', 
                  statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {status === 'all' ? 'Semua' : statusConfig[status as keyof typeof statusConfig]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-card overflow-hidden p-0 hidden lg:block">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nama Almarhum</th>
                  <th>Nominal</th>
                  <th>Tgl Wafat</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSantunan.map((santunan) => {
                  const status = statusConfig[santunan.status_santunan as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={santunan.id}>
                      <td className="font-medium">{santunan.anggota?.nama_kepala_keluarga || '-'}</td>
                      <td className="font-mono">{santunan.nominal ? formatCurrency(santunan.nominal) : '-'}</td>
                      <td>{santunan.kematian?.tanggal_wafat || '-'}</td>
                      <td>
                        <span className={`badge ${status.color} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />{status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelectedSantunan(santunan); setShowDetailModal(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {canApprove && santunan.status_santunan === 'pending' && (
                            <button onClick={() => handleApproveClick(santunan)} disabled={approveSantunan.isPending} className="btn-primary text-sm py-1.5 px-3">
                              {approveSantunan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACC'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSantunan.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchQuery || statusFilter !== 'all' ? 'Tidak ada data yang cocok' : 'Belum ada data santunan'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden space-y-3">
          {filteredSantunan.map((santunan) => {
            const status = statusConfig[santunan.status_santunan as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div key={santunan.id} className="stat-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{santunan.anggota?.nama_kepala_keluarga || '-'}</p>
                    <p className="text-lg font-bold font-mono text-foreground mt-1">{santunan.nominal ? formatCurrency(santunan.nominal) : '-'}</p>
                  </div>
                  <span className={`badge ${status.color} flex items-center gap-1 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />{status.label}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Wafat:</span>
                    <span>{santunan.kematian?.tanggal_wafat || '-'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-end gap-2">
                  <button onClick={() => { setSelectedSantunan(santunan); setShowDetailModal(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {canApprove && santunan.status_santunan === 'pending' && (
                    <button onClick={() => handleApproveClick(santunan)} disabled={approveSantunan.isPending} className="btn-primary text-sm py-1.5 px-4">
                      {approveSantunan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACC'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredSantunan.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'Tidak ada data yang cocok' : 'Belum ada data santunan'}
            </div>
          )}
        </div>
      </div>

      {/* Create Santunan Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Input Santunan Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data Kematian <span className="text-rukem-danger">*</span></label>
              <select value={formData.kematian_id} onChange={(e) => setFormData({ ...formData, kematian_id: e.target.value })} className="input-modern" required>
                <option value="">Pilih data kematian...</option>
                {availableKematian.map((k) => (
                  <option key={k.id} value={k.id}>{k.anggota?.nama_kepala_keluarga} - {k.tanggal_wafat}</option>
                ))}
              </select>
              {availableKematian.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Semua data kematian sudah memiliki santunan</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nominal Santunan</label>
              <input type="number" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })} className="input-modern" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 btn-secondary">Batal</button>
              <button type="submit" disabled={createSantunan.isPending || !formData.kematian_id} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {createSantunan.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Simpan
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detail Santunan</DialogTitle></DialogHeader>
          {selectedSantunan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Nama Almarhum/ah</p>
                <p className="font-semibold text-foreground">{selectedSantunan.anggota?.nama_kepala_keluarga || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Wafat</p>
                  <p className="font-medium">{selectedSantunan.kematian?.tanggal_wafat || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nominal</p>
                  <p className="font-medium font-mono">{selectedSantunan.nominal ? formatCurrency(selectedSantunan.nominal) : '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Status:</p>
                <span className={cn('badge', statusConfig[selectedSantunan.status_santunan as keyof typeof statusConfig]?.color || 'badge-warning')}>
                  {statusConfig[selectedSantunan.status_santunan as keyof typeof statusConfig]?.label || 'Proses'}
                </span>
              </div>
              {selectedSantunan.approved_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Disetujui</p>
                  <p className="font-medium">{new Date(selectedSantunan.approved_at).toLocaleDateString('id-ID')}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Create */}
      <ConfirmDialog
        open={showConfirmCreate}
        onOpenChange={setShowConfirmCreate}
        title="Konfirmasi Input Santunan"
        description={`Anda akan membuat pengajuan santunan sebesar ${formatCurrency(formData.nominal)} untuk "${selectedKematianForForm?.anggota?.nama_kepala_keluarga || ''}". Lanjutkan?`}
        confirmText="Ya, Ajukan"
        cancelText="Batal"
        onConfirm={handleConfirmCreate}
        isLoading={createSantunan.isPending}
      />

      {/* Confirm Approve */}
      <ConfirmDialog
        open={showConfirmApprove}
        onOpenChange={setShowConfirmApprove}
        title="Konfirmasi Persetujuan Santunan"
        description={`Anda akan menyetujui santunan sebesar ${santunanToApprove?.nominal ? formatCurrency(santunanToApprove.nominal) : '-'} untuk keluarga "${santunanToApprove?.anggota?.nama_kepala_keluarga || ''}". Tindakan ini akan mencairkan dana santunan.`}
        confirmText="Ya, Setujui"
        cancelText="Batal"
        onConfirm={handleConfirmApprove}
        isLoading={approveSantunan.isPending}
      />
    </DashboardLayout>
  );
}
