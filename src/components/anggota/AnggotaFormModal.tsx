import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateAnggota, useUpdateAnggota, AnggotaWithStatus } from '@/hooks/useAnggota';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

interface AnggotaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  anggota: AnggotaWithStatus | null;
}

export function AnggotaFormModal({ isOpen, onClose, anggota }: AnggotaFormModalProps) {
  const createAnggota = useCreateAnggota();
  const updateAnggota = useUpdateAnggota();
  
  const isEditing = !!anggota;
  const isLoading = createAnggota.isPending || updateAnggota.isPending;
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    nomor_data: '',
    nomor_anggota: '',
    no_kk: '',
    nama_kepala_keluarga: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    status_perkawinan: '',
    pekerjaan: '',
    pendidikan: '',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    kewarganegaraan: 'WNI',
    no_ktp: '',
    no_hp: '',
    email: '',
    tanggal_pembukuan: '',
    tanggal_daftar: '',
  });

  useEffect(() => {
    if (anggota) {
      setFormData({
        nomor_data: anggota.nomor_data || '',
        nomor_anggota: anggota.nomor_anggota || '',
        no_kk: anggota.no_kk || '',
        nama_kepala_keluarga: anggota.nama_kepala_keluarga || '',
        tempat_lahir: anggota.tempat_lahir || '',
        tanggal_lahir: anggota.tanggal_lahir || '',
        jenis_kelamin: anggota.jenis_kelamin || '',
        agama: anggota.agama || '',
        status_perkawinan: anggota.status_perkawinan || '',
        pekerjaan: anggota.pekerjaan || '',
        pendidikan: anggota.pendidikan || '',
        alamat: anggota.alamat || '',
        rt: anggota.rt || '',
        rw: anggota.rw || '',
        kelurahan: anggota.kelurahan || '',
        kecamatan: anggota.kecamatan || '',
        kota: anggota.kota || '',
        provinsi: anggota.provinsi || '',
        kode_pos: anggota.kode_pos || '',
        kewarganegaraan: anggota.kewarganegaraan || 'WNI',
        no_ktp: anggota.no_ktp || '',
        no_hp: anggota.no_hp || '',
        email: anggota.email || '',
        tanggal_pembukuan: anggota.tanggal_pembukuan || '',
        tanggal_daftar: anggota.tanggal_daftar || '',
      });
    } else {
      setFormData({
        nomor_data: '',
        nomor_anggota: '',
        no_kk: '',
        nama_kepala_keluarga: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        agama: '',
        status_perkawinan: '',
        pekerjaan: '',
        pendidikan: '',
        alamat: '',
        rt: '',
        rw: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        provinsi: '',
        kode_pos: '',
        kewarganegaraan: 'WNI',
        no_ktp: '',
        no_hp: '',
        email: '',
        tanggal_pembukuan: '',
        tanggal_daftar: new Date().toISOString().split('T')[0],
      });
    }
  }, [anggota, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kepala_keluarga.trim()) {
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    const dataToSubmit = {
      ...formData,
      tanggal_lahir: formData.tanggal_lahir || null,
      tanggal_pembukuan: formData.tanggal_pembukuan || null,
      tanggal_daftar: formData.tanggal_daftar || null,
    };

    try {
      if (isEditing && anggota) {
        await updateAnggota.mutateAsync({ id: anggota.id, data: dataToSubmit });
      } else {
        await createAnggota.mutateAsync(dataToSubmit);
      }
      setShowConfirm(false);
      onClose();
    } catch (error) {
      setShowConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Anggota' : 'Tambah Anggota Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Section: Data Administratif */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Data Administratif
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor Data</label>
                  <input
                    type="text"
                    name="nomor_data"
                    value={formData.nomor_data}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Nomor data"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor Anggota</label>
                  <input
                    type="text"
                    name="nomor_anggota"
                    value={formData.nomor_anggota}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="RK-2024-XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Daftar</label>
                  <input
                    type="date"
                    name="tanggal_daftar"
                    value={formData.tanggal_daftar}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
              </div>
            </div>

            {/* Section: Identitas */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Identitas Kepala Keluarga
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Nama Kepala Keluarga <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_kepala_keluarga"
                    value={formData.nama_kepala_keluarga}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. KK</label>
                  <input
                    type="text"
                    name="no_kk"
                    value={formData.no_kk}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="16 digit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. KTP</label>
                  <input
                    type="text"
                    name="no_ktp"
                    value={formData.no_ktp}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="16 digit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleChange}
                    className="input-modern"
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agama</label>
                  <select
                    name="agama"
                    value={formData.agama}
                    onChange={handleChange}
                    className="input-modern"
                  >
                    <option value="">Pilih</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status Perkawinan</label>
                  <select
                    name="status_perkawinan"
                    value={formData.status_perkawinan}
                    onChange={handleChange}
                    className="input-modern"
                  >
                    <option value="">Pilih</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pendidikan</label>
                  <select
                    name="pendidikan"
                    value={formData.pendidikan}
                    onChange={handleChange}
                    className="input-modern"
                  >
                    <option value="">Pilih</option>
                    <option value="Tidak Sekolah">Tidak Sekolah</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="D1-D3">D1-D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="Pekerjaan"
                  />
                </div>
              </div>
            </div>

            {/* Section: Alamat */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Alamat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="input-modern min-h-[80px]"
                    placeholder="Jalan, nomor rumah, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RT</label>
                  <input
                    type="text"
                    name="rt"
                    value={formData.rt}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RW</label>
                  <input
                    type="text"
                    name="rw"
                    value={formData.rw}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kelurahan</label>
                  <input
                    type="text"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kecamatan</label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kota/Kabupaten</label>
                  <input
                    type="text"
                    name="kota"
                    value={formData.kota}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Provinsi</label>
                  <input
                    type="text"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kode Pos</label>
                  <input
                    type="text"
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Section: Kontak */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Kontak
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">No. HP</label>
                  <input
                    type="tel"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-modern"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={cn('btn-primary flex items-center gap-2', isLoading && 'opacity-70')}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </button>
          </div>
        </form>
      </div>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={isEditing ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Tambah Anggota'}
        description={isEditing 
          ? `Anda akan menyimpan perubahan data anggota "${formData.nama_kepala_keluarga}". Lanjutkan?`
          : `Anda akan menambahkan anggota baru "${formData.nama_kepala_keluarga}". Lanjutkan?`
        }
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={handleConfirmSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
