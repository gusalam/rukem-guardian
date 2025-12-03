import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKematian, useCreateKematian } from '@/hooks/useKematian';
import { useActiveAnggota } from '@/hooks/useAnggota';
import { Search, Plus, Eye, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function Kematian() {
  const { data: kematianList = [], isLoading } = useKematian();
  const { data: activeAnggota = [] } = useActiveAnggota();
  const createKematian = useCreateKematian();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedKematian, setSelectedKematian] = useState<typeof kematianList[0] | null>(null);
  const [formData, setFormData] = useState({ anggota_id: '', tanggal_wafat: '', jam_wafat: '', tempat_wafat: '', pelapor: '', keterangan: '' });

  const filteredKematian = kematianList.filter((k) => k.anggota?.nama_kepala_keluarga?.toLowerCase().includes(searchQuery.toLowerCase()));

  const validateForm = () => {
    if (!formData.anggota_id || !formData.tanggal_wafat) {
      toast.error('Anggota dan tanggal wafat harus diisi');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await createKematian.mutateAsync({ 
        anggota_id: formData.anggota_id, 
        tanggal_wafat: formData.tanggal_wafat, 
        jam_wafat: formData.jam_wafat || null, 
        tempat_wafat: formData.tempat_wafat || null, 
        pelapor: formData.pelapor || null, 
        keterangan: formData.keterangan || null 
      });
      setShowFormModal(false);
      setShowConfirmDialog(false);
      setFormData({ anggota_id: '', tanggal_wafat: '', jam_wafat: '', tempat_wafat: '', pelapor: '', keterangan: '' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan laporan kematian');
    }
  };

  const selectedAnggotaName = activeAnggota.find(a => a.id === formData.anggota_id)?.nama_kepala_keluarga || '';

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Laporan Kematian</h1>
            <p className="text-sm text-muted-foreground">Daftar laporan kematian anggota RUKEM</p>
          </div>
          <button onClick={() => setShowFormModal(true)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="w-5 h-5" /><span>Lapor Kematian</span>
          </button>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rukem-danger-light flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-rukem-danger" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{kematianList.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Laporan Kematian</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama almarhum/almarhumah..." className="input-modern pl-12 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredKematian.map((kematian) => (
            <div key={kematian.id} className="stat-card space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{kematian.anggota?.nama_kepala_keluarga || 'Nama tidak ditemukan'}</h3>
                  <p className="text-sm text-muted-foreground">RT {kematian.anggota?.rt || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Wafat:</span>
                  <span className="text-foreground truncate">{kematian.tanggal_wafat} {kematian.jam_wafat ? `• ${kematian.jam_wafat}` : ''}</span>
                </div>
                {kematian.tempat_wafat && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Tempat:</span>
                    <span className="text-foreground truncate">{kematian.tempat_wafat}</span>
                  </div>
                )}
                {kematian.pelapor && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Pelapor:</span>
                    <span className="text-foreground truncate">{kematian.pelapor}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button 
                  onClick={() => { setSelectedKematian(kematian); setShowDetailModal(true); }} 
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />Detail
                </button>
              </div>
            </div>
          ))}
          {filteredKematian.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchQuery ? 'Tidak ada data yang cocok' : 'Belum ada laporan kematian'}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lapor Kematian</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Anggota yang Meninggal <span className="text-rukem-danger">*</span></label>
              <select value={formData.anggota_id} onChange={(e) => setFormData({ ...formData, anggota_id: e.target.value })} className="input-modern" required>
                <option value="">Pilih anggota...</option>
                {activeAnggota.map((a) => <option key={a.id} value={a.id}>{a.nama_kepala_keluarga} - RT {a.rt || '-'}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tanggal Wafat <span className="text-rukem-danger">*</span></label>
                <input type="date" value={formData.tanggal_wafat} onChange={(e) => setFormData({ ...formData, tanggal_wafat: e.target.value })} className="input-modern" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Jam Wafat</label>
                <input type="time" value={formData.jam_wafat} onChange={(e) => setFormData({ ...formData, jam_wafat: e.target.value })} className="input-modern" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tempat Wafat</label>
              <input type="text" value={formData.tempat_wafat} onChange={(e) => setFormData({ ...formData, tempat_wafat: e.target.value })} className="input-modern" placeholder="RS, rumah, dll" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Pelapor</label>
              <input type="text" value={formData.pelapor} onChange={(e) => setFormData({ ...formData, pelapor: e.target.value })} className="input-modern" placeholder="Nama pelapor (hubungan)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Keterangan</label>
              <textarea value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="input-modern min-h-[80px]" placeholder="Keterangan tambahan..." />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 btn-secondary">Batal</button>
              <button type="submit" disabled={createKematian.isPending} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {createKematian.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Simpan
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detail Laporan Kematian</DialogTitle></DialogHeader>
          {selectedKematian && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Nama Almarhum/ah</p>
                <p className="font-semibold text-foreground">{selectedKematian.anggota?.nama_kepala_keluarga || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Wafat</p>
                  <p className="font-medium">{selectedKematian.tanggal_wafat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jam Wafat</p>
                  <p className="font-medium">{selectedKematian.jam_wafat || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempat Wafat</p>
                <p className="font-medium">{selectedKematian.tempat_wafat || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pelapor</p>
                <p className="font-medium">{selectedKematian.pelapor || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Keterangan</p>
                <p className="font-medium">{selectedKematian.keterangan || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Konfirmasi Laporan Kematian"
        description={`Anda akan melaporkan kematian "${selectedAnggotaName}" pada tanggal ${formData.tanggal_wafat}. Pastikan data sudah benar karena akan mempengaruhi hak santunan.`}
        confirmText="Ya, Laporkan"
        cancelText="Periksa Lagi"
        onConfirm={handleConfirmSubmit}
        isLoading={createKematian.isPending}
      />
    </DashboardLayout>
  );
}
