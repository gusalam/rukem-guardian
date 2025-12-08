export type UserRole = 'admin_rw' | 'admin_rt' | 'operator' | 'anggota';
export type AnggotaStatus = 'pending' | 'active' | 'rejected';

export type MemberStatus = 'aktif' | 'keluar' | 'meninggal';
export type IuranType = 'bulanan' | 'per_kejadian';
export type IuranStatus = 'lancar' | 'menunggak';
export type SantunanStatus = 'pending' | 'approved' | 'disbursed' | 'rejected';
export type PaymentMethod = 'tunai' | 'transfer' | 'e-wallet';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rt?: string;
  rw?: string;
}

export interface Member {
  id: string;
  nomor_data: string;
  tanggal_pembukuan: string;
  tanggal_daftar: string;
  nomor_pokok_anggota: string;
  status_keluar: boolean;
  
  // Identitas KK
  nomor_kk: string;
  nama_kepala_keluarga: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
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
  no_hp: string;
  
  // Keanggotaan RUKEM
  terdaftar_rukem: boolean;
  status_keanggotaan: MemberStatus;
  tanggal_mulai_rukem?: string;
  jenis_iuran: IuranType;
  status_iuran: IuranStatus;
  
  // Status Kematian
  status_hidup: 'hidup' | 'meninggal';
  tanggal_wafat?: string;
  jam_wafat?: string;
  tempat_wafat?: string;
  pelapor?: string;
  nomor_surat_kematian?: string;
  keterangan_kematian?: string;
  
  // Santunan
  hak_santunan: boolean;
  nominal_santunan?: number;
  tanggal_pencairan?: string;
  metode_pencairan?: PaymentMethod;
  status_santunan?: SantunanStatus;
  bukti_serah_terima?: string;
  
  created_at: string;
  updated_at: string;
}

export interface DeathReport {
  id: string;
  member_id: string;
  member: Member;
  tanggal_lapor: string;
  pelapor: string;
  status: 'pending' | 'verified';
  created_at: string;
}

export interface Santunan {
  id: string;
  member_id: string;
  member: Member;
  nominal: number;
  status: SantunanStatus;
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  metode_pencairan?: PaymentMethod;
  bukti_serah_terima?: string;
  created_at: string;
}

export interface KasTransaction {
  id: string;
  tanggal: string;
  jenis: 'masuk' | 'keluar';
  kategori: string;
  deskripsi: string;
  nominal: number;
  saldo_akhir: number;
  created_by: string;
  created_at: string;
}

export interface DashboardStats {
  total_anggota: number;
  anggota_aktif: number;
  total_kas: number;
  total_santunan_tahun_ini: number;
}
