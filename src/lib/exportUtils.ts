import { AnggotaWithStatus } from '@/hooks/useAnggota';
import { Tables } from '@/integrations/supabase/types';

type Anggota = Tables<'anggota'>;

// Export Anggota to CSV
export function exportAnggotaToCSV(anggotaList: AnggotaWithStatus[]) {
  const headers = [
    'Nomor Anggota',
    'Nama Kepala Keluarga',
    'No KK',
    'No KTP',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Agama',
    'Alamat',
    'RT',
    'RW',
    'Kelurahan',
    'Kecamatan',
    'Kota',
    'Provinsi',
    'Kode Pos',
    'No HP',
    'Email',
    'Pekerjaan',
    'Pendidikan',
    'Status Perkawinan',
    'Tanggal Daftar',
    'Status',
  ];

  const rows = anggotaList.map((a) => [
    a.nomor_anggota || '',
    a.nama_kepala_keluarga,
    a.no_kk || '',
    a.no_ktp || '',
    a.tempat_lahir || '',
    a.tanggal_lahir || '',
    a.jenis_kelamin || '',
    a.agama || '',
    a.alamat || '',
    a.rt || '',
    a.rw || '',
    a.kelurahan || '',
    a.kecamatan || '',
    a.kota || '',
    a.provinsi || '',
    a.kode_pos || '',
    a.no_hp || '',
    a.email || '',
    a.pekerjaan || '',
    a.pendidikan || '',
    a.status_perkawinan || '',
    a.tanggal_daftar || '',
    a.is_meninggal ? 'Meninggal' : a.status_keluar ? 'Keluar' : 'Aktif',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `data_anggota_rukem_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Parse CSV file
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    results.push(row);
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// Map CSV headers to database fields
const headerMapping: Record<string, keyof Anggota> = {
  'Nomor Anggota': 'nomor_anggota',
  'Nama Kepala Keluarga': 'nama_kepala_keluarga',
  'No KK': 'no_kk',
  'No KTP': 'no_ktp',
  'Tempat Lahir': 'tempat_lahir',
  'Tanggal Lahir': 'tanggal_lahir',
  'Jenis Kelamin': 'jenis_kelamin',
  'Agama': 'agama',
  'Alamat': 'alamat',
  'RT': 'rt',
  'RW': 'rw',
  'Kelurahan': 'kelurahan',
  'Kecamatan': 'kecamatan',
  'Kota': 'kota',
  'Provinsi': 'provinsi',
  'Kode Pos': 'kode_pos',
  'No HP': 'no_hp',
  'Email': 'email',
  'Pekerjaan': 'pekerjaan',
  'Pendidikan': 'pendidikan',
  'Status Perkawinan': 'status_perkawinan',
  'Tanggal Daftar': 'tanggal_daftar',
};

export function mapCSVToAnggota(csvRows: Record<string, string>[]): Partial<Anggota>[] {
  return csvRows.map((row) => {
    const anggota: Partial<Anggota> = {};
    
    Object.entries(row).forEach(([header, value]) => {
      const field = headerMapping[header];
      if (field && value) {
        (anggota as Record<string, string>)[field] = value;
      }
    });

    return anggota;
  }).filter((a) => a.nama_kepala_keluarga);
}

// Download template CSV
export function downloadCSVTemplate() {
  const headers = [
    'Nomor Anggota',
    'Nama Kepala Keluarga',
    'No KK',
    'No KTP',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Agama',
    'Alamat',
    'RT',
    'RW',
    'Kelurahan',
    'Kecamatan',
    'Kota',
    'Provinsi',
    'Kode Pos',
    'No HP',
    'Email',
    'Pekerjaan',
    'Pendidikan',
    'Status Perkawinan',
    'Tanggal Daftar',
  ];

  const exampleRow = [
    'RK-001',
    'Budi Santoso',
    '1234567890123456',
    '1234567890123456',
    'Jakarta',
    '1990-01-15',
    'Laki-laki',
    'Islam',
    'Jl. Merdeka No. 1',
    '001',
    '002',
    'Kelurahan A',
    'Kecamatan B',
    'Jakarta',
    'DKI Jakarta',
    '12345',
    '081234567890',
    'budi@email.com',
    'Wiraswasta',
    'S1',
    'Kawin',
    '2024-01-01',
  ];

  const csvContent = [
    headers.join(','),
    exampleRow.map((cell) => `"${cell}"`).join(','),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'template_import_anggota.csv';
  link.click();
  URL.revokeObjectURL(url);
}
