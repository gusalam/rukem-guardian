import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnggotaWithStatus } from '@/hooks/useAnggota';
import { Tables } from '@/integrations/supabase/types';

type Kematian = Tables<'kematian'>;
type Santunan = Tables<'santunan'>;
type KasRukem = Tables<'kas_rukem'>;

interface ReportOptions {
  title: string;
  dateRange?: { start: string; end: string };
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

function addHeader(doc: jsPDF, title: string, dateRange?: { start: string; end: string }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RUKUN KEMATIAN (RUKEM)', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  
  if (dateRange?.start && dateRange?.end) {
    doc.setFontSize(10);
    doc.text(
      `Periode: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
      pageWidth / 2,
      35,
      { align: 'center' }
    );
  }
  
  doc.setFontSize(10);
  doc.text(`Dicetak: ${formatDate(new Date().toISOString())}`, pageWidth / 2, dateRange?.start ? 42 : 35, {
    align: 'center',
  });
}

export function generateAnggotaPDF(anggotaList: AnggotaWithStatus[], options: ReportOptions) {
  const doc = new jsPDF('landscape');
  addHeader(doc, options.title, options.dateRange);

  const tableData = anggotaList.map((a, index) => [
    index + 1,
    a.nomor_anggota || '-',
    a.nama_kepala_keluarga,
    `RT ${a.rt || '-'}/RW ${a.rw || '-'}`,
    a.alamat || '-',
    a.no_hp || '-',
    a.is_meninggal ? 'Meninggal' : a.status_keluar ? 'Keluar' : 'Aktif',
  ]);

  autoTable(doc, {
    startY: options.dateRange?.start ? 48 : 42,
    head: [['No', 'No. Anggota', 'Nama Kepala Keluarga', 'RT/RW', 'Alamat', 'No. HP', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 30 },
      4: { cellWidth: 60 },
    },
  });

  doc.save(`laporan_anggota_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateKematianPDF(
  kematianList: (Kematian & { anggota?: { nama_kepala_keluarga: string; rt?: string; rw?: string } })[],
  options: ReportOptions
) {
  const doc = new jsPDF();
  addHeader(doc, options.title, options.dateRange);

  const tableData = kematianList.map((k, index) => [
    index + 1,
    k.anggota?.nama_kepala_keluarga || '-',
    formatDate(k.tanggal_wafat),
    k.tempat_wafat || '-',
    `RT ${k.anggota?.rt || '-'}/RW ${k.anggota?.rw || '-'}`,
    k.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending',
  ]);

  autoTable(doc, {
    startY: options.dateRange?.start ? 48 : 42,
    head: [['No', 'Nama Almarhum', 'Tanggal Wafat', 'Tempat', 'RT/RW', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  doc.save(`laporan_kematian_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateSantunanPDF(
  santunanList: (Santunan & { anggota?: { nama_kepala_keluarga: string } })[],
  options: ReportOptions
) {
  const doc = new jsPDF();
  addHeader(doc, options.title, options.dateRange);

  const tableData = santunanList.map((s, index) => [
    index + 1,
    s.anggota?.nama_kepala_keluarga || '-',
    formatCurrency(Number(s.nominal) || 0),
    formatDate(s.tanggal_pencairan),
    s.metode_pencairan || '-',
    s.status_santunan === 'approved' ? 'Selesai' : s.status_santunan === 'pending' ? 'Pending' : 'Ditolak',
  ]);

  const totalNominal = santunanList.reduce((acc, s) => acc + Number(s.nominal || 0), 0);

  autoTable(doc, {
    startY: options.dateRange?.start ? 48 : 42,
    head: [['No', 'Nama Penerima', 'Nominal', 'Tanggal Pencairan', 'Metode', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    foot: [['', 'Total', formatCurrency(totalNominal), '', '', '']],
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
  });

  doc.save(`laporan_santunan_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateKasPDF(kasList: KasRukem[], options: ReportOptions) {
  const doc = new jsPDF();
  addHeader(doc, options.title, options.dateRange);

  const tableData = kasList.map((k, index) => [
    index + 1,
    formatDate(k.tanggal),
    k.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar',
    k.kategori || '-',
    k.keterangan || '-',
    formatCurrency(Number(k.nominal) || 0),
    formatCurrency(Number(k.saldo_akhir) || 0),
  ]);

  const totalMasuk = kasList
    .filter((k) => k.jenis_transaksi === 'masuk')
    .reduce((acc, k) => acc + Number(k.nominal), 0);
  const totalKeluar = kasList
    .filter((k) => k.jenis_transaksi === 'keluar')
    .reduce((acc, k) => acc + Number(k.nominal), 0);

  autoTable(doc, {
    startY: options.dateRange?.start ? 48 : 42,
    head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal', 'Saldo']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8], textColor: 0, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    foot: [
      ['', '', 'Total Masuk:', '', '', formatCurrency(totalMasuk), ''],
      ['', '', 'Total Keluar:', '', '', formatCurrency(totalKeluar), ''],
      ['', '', 'Saldo Akhir:', '', '', formatCurrency(totalMasuk - totalKeluar), ''],
    ],
    footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' },
  });

  doc.save(`laporan_kas_${new Date().toISOString().split('T')[0]}.pdf`);
}
