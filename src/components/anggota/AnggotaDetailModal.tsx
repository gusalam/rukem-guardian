import { X, User, MapPin, Phone, Calendar, CreditCard } from 'lucide-react';
import { AnggotaWithStatus } from '@/hooks/useAnggota';

interface AnggotaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anggota: AnggotaWithStatus | null;
}

export function AnggotaDetailModal({ isOpen, onClose, anggota }: AnggotaDetailModalProps) {
  if (!isOpen || !anggota) return null;

  const getStatus = () => {
    if (anggota.is_meninggal) return { label: 'Meninggal', class: 'badge-danger' };
    if (anggota.status_keluar) return { label: 'Keluar', class: 'badge-warning' };
    return { label: 'Aktif', class: 'badge-success' };
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{anggota.nama_kepala_keluarga}</h2>
            <p className="text-sm text-muted-foreground font-mono">{anggota.nomor_anggota || '-'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${status.class}`}>{status.label}</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Identitas */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Identitas</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">No. KK</p>
                <p className="font-medium font-mono">{anggota.no_kk || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">No. KTP</p>
                <p className="font-medium font-mono">{anggota.no_ktp || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempat, Tanggal Lahir</p>
                <p className="font-medium">
                  {anggota.tempat_lahir || '-'}, {anggota.tanggal_lahir || '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">
                  {anggota.jenis_kelamin === 'L' ? 'Laki-laki' : anggota.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Agama</p>
                <p className="font-medium">{anggota.agama || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Perkawinan</p>
                <p className="font-medium">{anggota.status_perkawinan || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendidikan</p>
                <p className="font-medium">{anggota.pendidikan || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pekerjaan</p>
                <p className="font-medium">{anggota.pekerjaan || '-'}</p>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Alamat</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p>{anggota.alamat || '-'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">RT/RW</p>
                  <p className="font-medium">{anggota.rt || '-'}/{anggota.rw || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kelurahan</p>
                  <p className="font-medium">{anggota.kelurahan || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kecamatan</p>
                  <p className="font-medium">{anggota.kecamatan || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kota/Kabupaten</p>
                  <p className="font-medium">{anggota.kota || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Provinsi</p>
                  <p className="font-medium">{anggota.provinsi || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kode Pos</p>
                  <p className="font-medium">{anggota.kode_pos || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kontak */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Kontak</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">No. HP</p>
                <p className="font-medium font-mono">{anggota.no_hp || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{anggota.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Keanggotaan */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Keanggotaan RUKEM</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tanggal Daftar</p>
                <p className="font-medium">{anggota.tanggal_daftar || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Keanggotaan</p>
                <p className="font-medium">{anggota.keanggotaan_rukem?.status_keanggotaan || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis Iuran</p>
                <p className="font-medium">{anggota.keanggotaan_rukem?.jenis_iuran || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Iuran</p>
                <span className={`badge ${
                  anggota.keanggotaan_rukem?.status_iuran === 'lancar' ? 'badge-success' : 'badge-warning'
                }`}>
                  {anggota.keanggotaan_rukem?.status_iuran || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Kematian Info (if deceased) */}
          {anggota.is_meninggal && anggota.kematian && (
            <div className="stat-card border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-destructive">Data Kematian</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tanggal Wafat</p>
                  <p className="font-medium">{anggota.kematian.tanggal_wafat}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jam Wafat</p>
                  <p className="font-medium">{anggota.kematian.jam_wafat || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tempat Wafat</p>
                  <p className="font-medium">{anggota.kematian.tempat_wafat || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pelapor</p>
                  <p className="font-medium">{anggota.kematian.pelapor || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
