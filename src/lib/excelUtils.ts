import * as XLSX from 'xlsx';
import { AnggotaWithStatus } from '@/hooks/useAnggota';
import { Tables } from '@/integrations/supabase/types';

type Kematian = Tables<'kematian'>;
type Santunan = Tables<'santunan'>;
type KasRukem = Tables<'kas_rukem'>;

interface ExportOptions {
  title: string;
  dateRange?: { start: string; end: string };
  saldoAkhir?: number;
}

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export function generateAnggotaExcel(anggotaList: AnggotaWithStatus[], options: ExportOptions) {
  const data = anggotaList.map((a, index) => ({
    'No': index + 1,
    'No. Anggota': a.nomor_anggota || '-',
    'No. KK': a.no_kk || '-',
    'No. KTP/NIK': a.no_ktp || '-',
    'Nama Kepala Keluarga': a.nama_kepala_keluarga,
    'Jenis Kelamin': a.jenis_kelamin || '-',
    'Tempat Lahir': a.tempat_lahir || '-',
    'Tanggal Lahir': formatDate(a.tanggal_lahir),
    'Agama': a.agama || '-',
    'Pendidikan': a.pendidikan || '-',
    'Pekerjaan': a.pekerjaan || '-',
    'Status Perkawinan': a.status_perkawinan || '-',
    'RT': a.rt || '-',
    'RW': a.rw || '-',
    'Kelurahan': a.kelurahan || '-',
    'Kecamatan': a.kecamatan || '-',
    'Kota': a.kota || '-',
    'Alamat': a.alamat || '-',
    'No. HP': a.no_hp || '-',
    'Email': a.email || '-',
    'Tanggal Daftar': formatDate(a.tanggal_daftar),
    'Status': a.is_meninggal ? 'Meninggal' : a.status_keluar ? 'Keluar' : 'Aktif',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Anggota');
  
  // Auto-size columns
  const colWidths = [
    { wch: 5 },  // No
    { wch: 15 }, // No. Anggota
    { wch: 20 }, // No. KK
    { wch: 20 }, // No. KTP/NIK
    { wch: 30 }, // Nama
    { wch: 12 }, // Jenis Kelamin
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 12 }, // Agama
    { wch: 15 }, // Pendidikan
    { wch: 15 }, // Pekerjaan
    { wch: 15 }, // Status Perkawinan
    { wch: 5 },  // RT
    { wch: 5 },  // RW
    { wch: 15 }, // Kelurahan
    { wch: 15 }, // Kecamatan
    { wch: 15 }, // Kota
    { wch: 40 }, // Alamat
    { wch: 15 }, // No. HP
    { wch: 25 }, // Email
    { wch: 15 }, // Tanggal Daftar
    { wch: 12 }, // Status
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `laporan_anggota_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function generateKematianExcel(
  kematianList: (Kematian & { anggota?: { nama_kepala_keluarga: string; rt?: string; rw?: string } })[],
  options: ExportOptions
) {
  const data = kematianList.map((k, index) => ({
    'No': index + 1,
    'Nama Almarhum': k.anggota?.nama_kepala_keluarga || '-',
    'Tanggal Wafat': formatDate(k.tanggal_wafat),
    'Tempat Wafat': k.tempat_wafat || '-',
    'RT': k.anggota?.rt || '-',
    'RW': k.anggota?.rw || '-',
    'Status': k.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending',
    'No. Surat Kematian': k.no_surat_kematian || '-',
    'Keterangan': k.keterangan || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kematian');

  const colWidths = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    { wch: 20 }, // Tanggal
    { wch: 20 }, // Tempat
    { wch: 5 },  // RT
    { wch: 5 },  // RW
    { wch: 15 }, // Status
    { wch: 20 }, // No Surat
    { wch: 30 }, // Keterangan
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `laporan_kematian_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function generateSantunanExcel(
  santunanList: (Santunan & { anggota?: { nama_kepala_keluarga: string } })[],
  options: ExportOptions
) {
  const data = santunanList.map((s, index) => ({
    'No': index + 1,
    'Nama Penerima': s.anggota?.nama_kepala_keluarga || '-',
    'Nominal': formatCurrency(Number(s.nominal) || 0),
    'Tanggal Pencairan': formatDate(s.tanggal_pencairan),
    'Metode Pencairan': s.metode_pencairan || '-',
    'Status': s.status_santunan === 'approved' ? 'Selesai' : s.status_santunan === 'pending' ? 'Pending' : 'Ditolak',
  }));

  const totalNominal = santunanList.reduce((acc, s) => acc + Number(s.nominal || 0), 0);
  
  // Add total row
  data.push({
    'No': '' as unknown as number,
    'Nama Penerima': 'TOTAL',
    'Nominal': formatCurrency(totalNominal),
    'Tanggal Pencairan': '',
    'Metode Pencairan': '',
    'Status': '',
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Santunan');

  const colWidths = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    { wch: 20 }, // Nominal
    { wch: 20 }, // Tanggal
    { wch: 15 }, // Metode
    { wch: 12 }, // Status
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `laporan_santunan_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function generateKasExcel(kasList: KasRukem[], options: ExportOptions) {
  const data = kasList.map((k, index) => ({
    'No': index + 1,
    'Tanggal': formatDate(k.tanggal),
    'Jenis': k.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar',
    'Kategori': k.kategori || '-',
    'Keterangan': k.keterangan || '-',
    'Nominal': formatCurrency(Number(k.nominal) || 0),
  }));

  const totalMasuk = kasList
    .filter((k) => k.jenis_transaksi === 'masuk')
    .reduce((acc, k) => acc + Number(k.nominal), 0);
  const totalKeluar = kasList
    .filter((k) => k.jenis_transaksi === 'keluar')
    .reduce((acc, k) => acc + Number(k.nominal), 0);
  const saldoAkhir = options.saldoAkhir ?? (totalMasuk - totalKeluar);

  // Add summary rows
  data.push(
    { 'No': '' as unknown as number, 'Tanggal': '', 'Jenis': 'Total Masuk', 'Kategori': '', 'Keterangan': '', 'Nominal': formatCurrency(totalMasuk) },
    { 'No': '' as unknown as number, 'Tanggal': '', 'Jenis': 'Total Keluar', 'Kategori': '', 'Keterangan': '', 'Nominal': formatCurrency(totalKeluar) },
    { 'No': '' as unknown as number, 'Tanggal': '', 'Jenis': 'Saldo Akhir', 'Kategori': '', 'Keterangan': '', 'Nominal': formatCurrency(saldoAkhir) }
  );

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kas');

  const colWidths = [
    { wch: 5 },  // No
    { wch: 20 }, // Tanggal
    { wch: 12 }, // Jenis
    { wch: 15 }, // Kategori
    { wch: 30 }, // Keterangan
    { wch: 20 }, // Nominal
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `laporan_kas_${new Date().toISOString().split('T')[0]}.xlsx`);
}
