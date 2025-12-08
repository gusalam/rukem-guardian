import { cn } from '@/lib/utils';

export interface AnggotaFormData {
  nomor_data: string;
  nomor_anggota: string;
  no_kk: string;
  nama_kepala_keluarga: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  pendidikan: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  kewarganegaraan: string;
  no_ktp: string;
  no_hp: string;
  email: string;
  tanggal_pembukuan: string;
  tanggal_daftar: string;
}

export const defaultAnggotaFormData: AnggotaFormData = {
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
};

interface AnggotaFormProps {
  formData: AnggotaFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showAdminFields?: boolean;
  showPasswordField?: boolean;
  password?: string;
  confirmPassword?: string;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AnggotaForm({ 
  formData, 
  onChange, 
  showAdminFields = true,
  showPasswordField = false,
  password = '',
  confirmPassword = '',
  onPasswordChange
}: AnggotaFormProps) {
  return (
    <div className="space-y-6">
      {/* Section: Data Administratif - Only for Admin */}
      {showAdminFields && (
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
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
                className="input-modern"
              />
            </div>
          </div>
        </div>
      )}

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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kecamatan</label>
            <input
              type="text"
              name="kecamatan"
              value={formData.kecamatan}
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kota/Kabupaten</label>
            <input
              type="text"
              name="kota"
              value={formData.kota}
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provinsi</label>
            <input
              type="text"
              name="provinsi"
              value={formData.provinsi}
              onChange={onChange}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kode Pos</label>
            <input
              type="text"
              name="kode_pos"
              value={formData.kode_pos}
              onChange={onChange}
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
              onChange={onChange}
              className="input-modern"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="input-modern"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Section: Password - Only for Registration */}
      {showPasswordField && onPasswordChange && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Akun Login
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onPasswordChange}
                className="input-modern"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Konfirmasi Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onPasswordChange}
                className="input-modern"
                placeholder="Ulangi password"
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
