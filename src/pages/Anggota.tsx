import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAnggota, useDeleteAnggota, AnggotaWithStatus } from '@/hooks/useAnggota';
import { AnggotaFormModal } from '@/components/anggota/AnggotaFormModal';
import { AnggotaDetailModal } from '@/components/anggota/AnggotaDetailModal';
import { ImportAnggotaModal } from '@/components/anggota/ImportAnggotaModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { exportAnggotaToCSV } from '@/lib/exportUtils';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Heart,
  Loader2,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'aktif' | 'keluar' | 'meninggal';

const statusFilters: { value: StatusFilter; label: string; icon: typeof Users }[] = [
  { value: 'all', label: 'Semua', icon: Users },
  { value: 'aktif', label: 'Aktif', icon: UserCheck },
  { value: 'keluar', label: 'Keluar', icon: UserX },
  { value: 'meninggal', label: 'Meninggal', icon: Heart },
];

export default function Anggota() {
  const { hasPermission } = useAuth();
  const { data: anggotaList, isLoading, error } = useAnggota();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState<AnggotaWithStatus | null>(null);
  const [anggotaToDelete, setAnggotaToDelete] = useState<AnggotaWithStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const deleteAnggota = useDeleteAnggota();
  const canEdit = hasPermission(['admin_rw', 'admin_rt', 'operator']);
  const canDelete = hasPermission(['admin_rw', 'admin_rt']);

  const getStatus = (anggota: AnggotaWithStatus): StatusFilter => {
    if (anggota.is_meninggal) return 'meninggal';
    if (anggota.status_keluar) return 'keluar';
    return 'aktif';
  };

  const filteredAnggota = (anggotaList || []).filter((anggota) => {
    const matchesSearch =
      anggota.nama_kepala_keluarga.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anggota.nomor_anggota || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getStatus(anggota);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAnggota.length / itemsPerPage);
  const paginatedAnggota = filteredAnggota.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (anggota: AnggotaWithStatus) => {
    const status = getStatus(anggota);
    switch (status) {
      case 'aktif':
        return <span className="badge badge-success">Aktif</span>;
      case 'keluar':
        return <span className="badge badge-warning">Keluar</span>;
      case 'meninggal':
        return <span className="badge badge-danger">Meninggal</span>;
    }
  };

  const getIuranBadge = (status: string | null) => {
    if (!status) return <span className="badge badge-info">-</span>;
    return status === 'lancar' ? (
      <span className="badge badge-success">Lancar</span>
    ) : (
      <span className="badge badge-warning">Menunggak</span>
    );
  };

  const handleAddAnggota = () => {
    setSelectedAnggota(null);
    setIsFormOpen(true);
  };

  const handleEditAnggota = (anggota: AnggotaWithStatus) => {
    setSelectedAnggota(anggota);
    setIsFormOpen(true);
  };

  const handleViewAnggota = (anggota: AnggotaWithStatus) => {
    setSelectedAnggota(anggota);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (anggota: AnggotaWithStatus) => {
    setAnggotaToDelete(anggota);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (anggotaToDelete) {
      await deleteAnggota.mutateAsync(anggotaToDelete.id);
      setIsDeleteDialogOpen(false);
      setAnggotaToDelete(null);
    }
  };

  const handleExport = () => {
    if (!anggotaList || anggotaList.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    exportAnggotaToCSV(filteredAnggota);
    toast.success('Data berhasil diekspor ke CSV');
  };

  const statusCounts = {
    all: anggotaList?.length || 0,
    aktif: anggotaList?.filter(a => !a.is_meninggal && !a.status_keluar).length || 0,
    keluar: anggotaList?.filter(a => a.status_keluar && !a.is_meninggal).length || 0,
    meninggal: anggotaList?.filter(a => a.is_meninggal).length || 0,
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-2">Gagal memuat data anggota</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Data Anggota RUKEM</h1>
            <p className="text-sm text-muted-foreground">Kelola data anggota rukun kematian</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleExport} className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
            {canEdit && (
              <>
                <button onClick={() => setIsImportOpen(true)} className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import CSV</span>
                  <span className="sm:hidden">Import</span>
                </button>
                <button onClick={handleAddAnggota} className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none">
                  <Plus className="w-5 h-5" />
                  <span>Tambah</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setCurrentPage(1);
              }}
              className={cn(
                'p-3 sm:p-4 rounded-xl border transition-all duration-200',
                statusFilter === filter.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/30'
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <filter.icon
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5',
                    statusFilter === filter.value ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div className="text-left">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {statusCounts[filter.value]}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground">{filter.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama atau nomor anggota..."
            className="input-modern pl-12 w-full"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Table - Desktop */}
            <div className="stat-card overflow-hidden p-0 hidden lg:block">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>No. Anggota</th>
                      <th>Nama Kepala Keluarga</th>
                      <th>Alamat</th>
                      <th>RT/RW</th>
                      <th>No. HP</th>
                      <th>Status</th>
                      <th>Iuran</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAnggota.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data anggota'}
                        </td>
                      </tr>
                    ) : (
                      paginatedAnggota.map((anggota) => (
                        <tr key={anggota.id}>
                          <td className="font-mono text-sm">{anggota.nomor_anggota || '-'}</td>
                          <td className="font-medium">{anggota.nama_kepala_keluarga}</td>
                          <td className="text-muted-foreground max-w-[200px] truncate">
                            {anggota.alamat || '-'}
                          </td>
                          <td>{anggota.rt || '-'}/{anggota.rw || '-'}</td>
                          <td className="font-mono text-sm">{anggota.no_hp || '-'}</td>
                          <td>{getStatusBadge(anggota)}</td>
                          <td>{getIuranBadge(anggota.keanggotaan_rukem?.status_iuran || null)}</td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewAnggota(anggota)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </button>
                              {canEdit && !anggota.is_meninggal && (
                                <button
                                  onClick={() => handleEditAnggota(anggota)}
                                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                                </button>
                              )}
                              {canDelete && !anggota.is_meninggal && (
                                <button
                                  onClick={() => handleDeleteClick(anggota)}
                                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredAnggota.length)} dari {filteredAnggota.length} anggota
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card List - Mobile/Tablet */}
            <div className="lg:hidden space-y-3">
              {paginatedAnggota.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data anggota'}
                </div>
              ) : (
                paginatedAnggota.map((anggota) => (
                  <div key={anggota.id} className="stat-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{anggota.nama_kepala_keluarga}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          {anggota.nomor_anggota || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(anggota)}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm">
                      <p className="text-muted-foreground truncate">{anggota.alamat || '-'}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>RT {anggota.rt || '-'}/RW {anggota.rw || '-'}</span>
                        <span className="font-mono">{anggota.no_hp || '-'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Iuran:</span>
                        {getIuranBadge(anggota.keanggotaan_rukem?.status_iuran || null)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewAnggota(anggota)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {canEdit && !anggota.is_meninggal && (
                          <button
                            onClick={() => handleEditAnggota(anggota)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        {canDelete && !anggota.is_meninggal && (
                          <button
                            onClick={() => handleDeleteClick(anggota)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAnggota.length)} dari {filteredAnggota.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnggotaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        anggota={selectedAnggota}
      />
      <AnggotaDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        anggota={selectedAnggota}
      />
      <ImportAnggotaModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Data Anggota"
        description={`Apakah Anda yakin ingin menghapus data anggota "${anggotaToDelete?.nama_kepala_keluarga}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        isLoading={deleteAnggota.isPending}
        variant="destructive"
      />
    </DashboardLayout>
  );
}
