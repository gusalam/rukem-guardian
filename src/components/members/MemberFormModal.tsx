import { useState } from 'react';
import { X, User, Home, Shield, Heart, Wallet, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
}

const tabs = [
  { id: 'umum', label: 'Data Umum', icon: User },
  { id: 'identitas', label: 'Identitas KK', icon: Home },
  { id: 'keanggotaan', label: 'Keanggotaan', icon: Shield },
  { id: 'kematian', label: 'Status Kematian', icon: Heart },
  { id: 'santunan', label: 'Santunan', icon: Wallet },
];

export function MemberFormModal({ isOpen, onClose, member }: MemberFormModalProps) {
  const [activeTab, setActiveTab] = useState('umum');
  const [formData, setFormData] = useState({
    // Data Umum
    nomor_data: member?.id || 'AUTO',
    tanggal_pembukuan: '',
    tanggal_daftar: '',
    nomor_pokok_anggota: '',
    status_keluar: false,
    
    // Identitas KK
    nomor_kk: '',
    nama_kepala_keluarga: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
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
    no_hp: '',
    
    // Keanggotaan
    terdaftar_rukem: true,
    status_keanggotaan: 'aktif',
    tanggal_mulai_rukem: '',
    jenis_iuran: 'bulanan',
    status_iuran: 'lancar',
    
    // Kematian
    status_hidup: 'hidup',
    tanggal_wafat: '',
    jam_wafat: '',
    tempat_wafat: '',
    pelapor: '',
    nomor_surat_kematian: '',
    keterangan_kematian: '',
    
    // Santunan
    hak_santunan: true,
    nominal_santunan: '',
    tanggal_pencairan: '',
    metode_pencairan: 'tunai',
    status_santunan: 'pending',
  });

  const isReadOnly = member?.status_keanggotaan === 'meninggal';

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-elevated overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {member ? (isReadOnly ? 'Detail Anggota' : 'Edit Anggota') : 'Tambah Anggota Baru'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isReadOnly ? 'Data anggota yang sudah meninggal tidak dapat diubah' : 'Lengkapi data sesuai tahapan'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border overflow-x-auto scrollbar-thin">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {index < currentTabIndex && (
                <Check className="w-4 h-4 text-rukem-success" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)] scrollbar-thin">
          {/* Tab 1: Data Umum */}
          {activeTab === 'umum' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor Data
                </label>
                <input
                  type="text"
                  value={formData.nomor_data}
                  disabled
                  className="input-modern bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Diisi otomatis oleh sistem</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal Pembukuan
                </label>
                <input
                  type="date"
                  value={formData.tanggal_pembukuan}
                  onChange={(e) => handleInputChange('tanggal_pembukuan', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal Daftar
                </label>
                <input
                  type="date"
                  value={formData.tanggal_daftar}
                  onChange={(e) => handleInputChange('tanggal_daftar', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor Pokok Anggota
                </label>
                <input
                  type="text"
                  value={formData.nomor_pokok_anggota}
                  onChange={(e) => handleInputChange('nomor_pokok_anggota', e.target.value)}
                  placeholder="RK-2024-XXX"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status_keluar}
                    onChange={(e) => handleInputChange('status_keluar', e.target.checked)}
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    disabled={isReadOnly}
                  />
                  <span className="text-sm font-medium text-foreground">Status Keluar</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 2: Identitas KK */}
          {activeTab === 'identitas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor KK
                </label>
                <input
                  type="text"
                  value={formData.nomor_kk}
                  onChange={(e) => handleInputChange('nomor_kk', e.target.value)}
                  placeholder="16 digit nomor KK"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Kepala Keluarga
                </label>
                <input
                  type="text"
                  value={formData.nama_kepala_keluarga}
                  onChange={(e) => handleInputChange('nama_kepala_keluarga', e.target.value)}
                  placeholder="Nama lengkap"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempat_lahir}
                  onChange={(e) => handleInputChange('tempat_lahir', e.target.value)}
                  placeholder="Kota/Kabupaten"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => handleInputChange('tanggal_lahir', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) => handleInputChange('jenis_kelamin', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Agama
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) => handleInputChange('agama', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status Perkawinan
                </label>
                <select
                  value={formData.status_perkawinan}
                  onChange={(e) => handleInputChange('status_perkawinan', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="">Pilih Status</option>
                  <option value="belum_kawin">Belum Kawin</option>
                  <option value="kawin">Kawin</option>
                  <option value="cerai_hidup">Cerai Hidup</option>
                  <option value="cerai_mati">Cerai Mati</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={formData.pekerjaan}
                  onChange={(e) => handleInputChange('pekerjaan', e.target.value)}
                  placeholder="Jenis pekerjaan"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pendidikan Terakhir
                </label>
                <select
                  value={formData.pendidikan}
                  onChange={(e) => handleInputChange('pendidikan', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="tidak_sekolah">Tidak Sekolah</option>
                  <option value="sd">SD/Sederajat</option>
                  <option value="smp">SMP/Sederajat</option>
                  <option value="sma">SMA/Sederajat</option>
                  <option value="d3">D3</option>
                  <option value="s1">S1</option>
                  <option value="s2">S2</option>
                  <option value="s3">S3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  No. HP
                </label>
                <input
                  type="tel"
                  value={formData.no_hp}
                  onChange={(e) => handleInputChange('no_hp', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  placeholder="Jalan, Gang, No. Rumah"
                  rows={2}
                  className="input-modern resize-none"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">RT</label>
                <input
                  type="text"
                  value={formData.rt}
                  onChange={(e) => handleInputChange('rt', e.target.value)}
                  placeholder="001"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">RW</label>
                <input
                  type="text"
                  value={formData.rw}
                  onChange={(e) => handleInputChange('rw', e.target.value)}
                  placeholder="005"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kelurahan
                </label>
                <input
                  type="text"
                  value={formData.kelurahan}
                  onChange={(e) => handleInputChange('kelurahan', e.target.value)}
                  placeholder="Nama Kelurahan"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => handleInputChange('kecamatan', e.target.value)}
                  placeholder="Nama Kecamatan"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kota/Kabupaten
                </label>
                <input
                  type="text"
                  value={formData.kota}
                  onChange={(e) => handleInputChange('kota', e.target.value)}
                  placeholder="Nama Kota"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.provinsi}
                  onChange={(e) => handleInputChange('provinsi', e.target.value)}
                  placeholder="Nama Provinsi"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.kode_pos}
                  onChange={(e) => handleInputChange('kode_pos', e.target.value)}
                  placeholder="5 digit"
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Keanggotaan */}
          {activeTab === 'keanggotaan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.terdaftar_rukem}
                    onChange={(e) => handleInputChange('terdaftar_rukem', e.target.checked)}
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    disabled={isReadOnly}
                  />
                  <span className="text-sm font-medium text-foreground">Terdaftar RUKEM</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status Keanggotaan
                </label>
                <select
                  value={formData.status_keanggotaan}
                  onChange={(e) => handleInputChange('status_keanggotaan', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="aktif">Aktif</option>
                  <option value="keluar">Tidak Aktif / Keluar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal Mulai RUKEM
                </label>
                <input
                  type="date"
                  value={formData.tanggal_mulai_rukem}
                  onChange={(e) => handleInputChange('tanggal_mulai_rukem', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Jenis Iuran
                </label>
                <select
                  value={formData.jenis_iuran}
                  onChange={(e) => handleInputChange('jenis_iuran', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="bulanan">Bulanan</option>
                  <option value="per_kejadian">Per Kejadian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status Iuran
                </label>
                <select
                  value={formData.status_iuran}
                  onChange={(e) => handleInputChange('status_iuran', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="lancar">Lancar</option>
                  <option value="menunggak">Menunggak</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 4: Status Kematian */}
          {activeTab === 'kematian' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={formData.status_hidup}
                  onChange={(e) => handleInputChange('status_hidup', e.target.value)}
                  className="input-modern"
                  disabled={isReadOnly}
                >
                  <option value="hidup">Hidup</option>
                  <option value="meninggal">Meninggal</option>
                </select>
              </div>

              {formData.status_hidup === 'meninggal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-rukem-danger-light rounded-xl border border-rukem-danger/20">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-rukem-danger flex items-center gap-2 mb-4">
                      <Heart className="w-4 h-4" />
                      Data Kematian
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tanggal Wafat
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_wafat}
                      onChange={(e) => handleInputChange('tanggal_wafat', e.target.value)}
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jam Wafat
                    </label>
                    <input
                      type="time"
                      value={formData.jam_wafat}
                      onChange={(e) => handleInputChange('jam_wafat', e.target.value)}
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tempat Wafat
                    </label>
                    <input
                      type="text"
                      value={formData.tempat_wafat}
                      onChange={(e) => handleInputChange('tempat_wafat', e.target.value)}
                      placeholder="Rumah / Rumah Sakit"
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pelapor
                    </label>
                    <input
                      type="text"
                      value={formData.pelapor}
                      onChange={(e) => handleInputChange('pelapor', e.target.value)}
                      placeholder="Nama pelapor"
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nomor Surat Kematian
                    </label>
                    <input
                      type="text"
                      value={formData.nomor_surat_kematian}
                      onChange={(e) => handleInputChange('nomor_surat_kematian', e.target.value)}
                      placeholder="Nomor surat dari kelurahan"
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Keterangan
                    </label>
                    <textarea
                      value={formData.keterangan_kematian}
                      onChange={(e) => handleInputChange('keterangan_kematian', e.target.value)}
                      placeholder="Keterangan tambahan"
                      rows={3}
                      className="input-modern resize-none"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Santunan */}
          {activeTab === 'santunan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hak_santunan}
                    onChange={(e) => handleInputChange('hak_santunan', e.target.checked)}
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    disabled={isReadOnly}
                  />
                  <span className="text-sm font-medium text-foreground">Berhak Menerima Santunan</span>
                </label>
              </div>
              
              {formData.hak_santunan && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nominal Santunan
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={formData.nominal_santunan}
                        onChange={(e) => handleInputChange('nominal_santunan', e.target.value)}
                        placeholder="0"
                        className="input-modern pl-12"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tanggal Pencairan
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_pencairan}
                      onChange={(e) => handleInputChange('tanggal_pencairan', e.target.value)}
                      className="input-modern"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Metode Pencairan
                    </label>
                    <select
                      value={formData.metode_pencairan}
                      onChange={(e) => handleInputChange('metode_pencairan', e.target.value)}
                      className="input-modern"
                      disabled={isReadOnly}
                    >
                      <option value="tunai">Tunai</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="e-wallet">E-Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status Santunan
                    </label>
                    <select
                      value={formData.status_santunan}
                      onChange={(e) => handleInputChange('status_santunan', e.target.value)}
                      className="input-modern"
                      disabled={isReadOnly}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Disetujui</option>
                      <option value="disbursed">Dicairkan</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload Bukti Serah Terima
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Wallet className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG atau PDF (Maks. 5MB)
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={goToPrevTab}
            disabled={currentTabIndex === 0}
            className={cn(
              'btn-secondary flex items-center gap-2',
              currentTabIndex === 0 && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Sebelumnya
          </button>
          
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary">
              Batal
            </button>
            {currentTabIndex === tabs.length - 1 ? (
              <button className="btn-primary" disabled={isReadOnly}>
                {isReadOnly ? 'Tutup' : 'Simpan Data'}
              </button>
            ) : (
              <button onClick={goToNextTab} className="btn-primary flex items-center gap-2">
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
