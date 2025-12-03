import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useKasSummary, useKas } from '@/hooks/useKas';
import { useAnggota } from '@/hooks/useAnggota';
import { useKematian } from '@/hooks/useKematian';
import { useSantunan } from '@/hooks/useSantunan';
import {
  generateAnggotaPDF,
  generateKematianPDF,
  generateSantunanPDF,
  generateKasPDF,
} from '@/lib/pdfUtils';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Heart,
  Wallet,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const reportTypes = [
  {
    id: 'anggota',
    title: 'Laporan Anggota',
    description: 'Daftar lengkap anggota RUKEM',
    icon: Users,
    color: 'bg-rukem-blue',
  },
  {
    id: 'kematian',
    title: 'Laporan Kematian',
    description: 'Rekap data kematian per periode',
    icon: Heart,
    color: 'bg-rukem-danger',
  },
  {
    id: 'santunan',
    title: 'Laporan Santunan',
    description: 'Rincian pencairan santunan',
    icon: Wallet,
    color: 'bg-rukem-success',
  },
  {
    id: 'kas',
    title: 'Laporan Kas',
    description: 'Arus kas masuk dan keluar',
    icon: BarChart3,
    color: 'bg-rukem-warning',
  },
];

export default function Laporan() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: kasSummary, isLoading: kasLoading } = useKasSummary();
  const { data: anggotaList } = useAnggota();
  const { data: kematianList } = useKematian();
  const { data: santunanList } = useSantunan();
  const { data: kasList } = useKas();
  
  const [selectedReport, setSelectedReport] = useState('anggota');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    }
    return formatCurrency(value);
  };

  const filterByDateRange = <T extends { tanggal_wafat?: string; created_at?: string | null; tanggal?: string }>(
    data: T[] | undefined,
    dateField: keyof T
  ): T[] => {
    if (!data) return [];
    if (!dateRange.start && !dateRange.end) return data;
    
    return data.filter((item) => {
      const itemDate = item[dateField] as string | null | undefined;
      if (!itemDate) return true;
      
      const date = new Date(itemDate);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const options = {
        title: reportTypes.find((r) => r.id === selectedReport)?.title || 'Laporan',
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
      };

      switch (selectedReport) {
        case 'anggota':
          if (!anggotaList || anggotaList.length === 0) {
            toast.error('Tidak ada data anggota');
            return;
          }
          generateAnggotaPDF(anggotaList, options);
          toast.success('Laporan anggota berhasil diexport');
          break;
          
        case 'kematian':
          const filteredKematian = filterByDateRange(kematianList, 'tanggal_wafat');
          if (filteredKematian.length === 0) {
            toast.error('Tidak ada data kematian');
            return;
          }
          generateKematianPDF(
            filteredKematian.map((k) => ({
              ...k,
              anggota: k.anggota ? {
                nama_kepala_keluarga: k.anggota.nama_kepala_keluarga,
                rt: k.anggota.rt ?? undefined,
                rw: k.anggota.rw ?? undefined,
              } : undefined,
            })),
            options
          );
          toast.success('Laporan kematian berhasil diexport');
          break;
          
        case 'santunan':
          const filteredSantunan = filterByDateRange(santunanList, 'created_at');
          if (filteredSantunan.length === 0) {
            toast.error('Tidak ada data santunan');
            return;
          }
          generateSantunanPDF(
            filteredSantunan.map((s) => ({
              ...s,
              anggota: s.anggota ? {
                nama_kepala_keluarga: s.anggota.nama_kepala_keluarga,
              } : undefined,
            })),
            options
          );
          toast.success('Laporan santunan berhasil diexport');
          break;
          
        case 'kas':
          const filteredKas = filterByDateRange(kasList, 'tanggal');
          if (filteredKas.length === 0) {
            toast.error('Tidak ada data kas');
            return;
          }
          generateKasPDF(filteredKas, options);
          toast.success('Laporan kas berhasil diexport');
          break;
      }
    } catch (error) {
      toast.error('Gagal mengexport laporan');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewData = () => {
    switch (selectedReport) {
      case 'anggota':
        return { count: anggotaList?.length || 0, label: 'anggota' };
      case 'kematian':
        return { count: filterByDateRange(kematianList, 'tanggal_wafat').length, label: 'data kematian' };
      case 'santunan':
        return { count: filterByDateRange(santunanList, 'created_at').length, label: 'data santunan' };
      case 'kas':
        return { count: filterByDateRange(kasList, 'tanggal').length, label: 'transaksi kas' };
      default:
        return { count: 0, label: 'data' };
    }
  };

  const previewData = getPreviewData();
  const isLoading = statsLoading || kasLoading;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-sm text-muted-foreground">Generate dan export laporan dalam format PDF</p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={cn(
                'p-3 sm:p-4 rounded-xl border text-left transition-all duration-200',
                selectedReport === report.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:bg-muted/30'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3',
                  report.color
                )}
              >
                <report.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">{report.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{report.description}</p>
            </button>
          ))}
        </div>

        {/* Filter & Actions */}
        <div className="stat-card">
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">Filter Laporan</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 lg:mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="input-modern pl-12 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tanggal Akhir
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="input-modern pl-12 w-full"
                />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="border border-border rounded-xl p-4 sm:p-6 bg-muted/20">
            <div className="text-center py-8 sm:py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground">
                {reportTypes.find((r) => r.id === selectedReport)?.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {previewData.count > 0 
                  ? `${previewData.count} ${previewData.label} siap diexport`
                  : `Tidak ada ${previewData.label} untuk periode ini`
                }
              </p>
              {(dateRange.start || dateRange.end) && (
                <p className="text-xs text-muted-foreground mt-2">
                  Filter: {dateRange.start || '...'} s/d {dateRange.end || '...'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats - Real Data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="stat-card text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-rukem-blue">
                {(stats?.totalAnggota || 0).toLocaleString('id-ID')}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">Total Anggota</p>
          </div>
          <div className="stat-card text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-rukem-danger">
                {stats?.santunanCount || 0}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">Kematian Tahun Ini</p>
          </div>
          <div className="stat-card text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-rukem-success">
                {formatCurrencyShort(stats?.totalSantunan || 0)}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">Santunan Disalurkan</p>
          </div>
          <div className="stat-card text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-rukem-warning">
                {formatCurrencyShort(kasSummary?.saldo || 0)}
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">Saldo Kas</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
