import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useRecentKematian } from '@/hooks/useDashboard';
import { useKasChartData } from '@/hooks/useKas';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Wallet,
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Loader2,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentKematian, isLoading: kematianLoading } = useRecentKematian();
  const { data: kasChartData, isLoading: chartLoading } = useKasChartData();

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

  const statsData = [
    {
      label: 'Total Anggota',
      value: stats?.totalAnggota || 0,
      displayValue: (stats?.totalAnggota || 0).toLocaleString('id-ID'),
      icon: Users,
      color: 'bg-rukem-blue',
    },
    {
      label: 'Anggota Aktif',
      value: stats?.anggotaAktif || 0,
      displayValue: (stats?.anggotaAktif || 0).toLocaleString('id-ID'),
      icon: UserCheck,
      color: 'bg-rukem-success',
    },
    {
      label: 'Total Kas',
      value: stats?.totalKas || 0,
      displayValue: formatCurrencyShort(stats?.totalKas || 0),
      icon: Wallet,
      color: 'bg-rukem-warning',
      realtime: true,
    },
    {
      label: 'Total Pengeluaran',
      value: stats?.totalKasKeluar || 0,
      displayValue: formatCurrencyShort(stats?.totalKasKeluar || 0),
      icon: TrendingDown,
      color: 'bg-rukem-danger',
      realtime: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Ringkasan data RUKEM {user?.rw ? `RW ${user.rw}` : ''} hari ini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-slide-up relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {stat.realtime && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-500 font-medium">LIVE</span>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                  {statsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                  ) : (
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mt-1 truncate">
                      {stat.displayValue}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kas Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="stat-card border-l-4 border-l-rukem-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                {statsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-rukem-success">
                    {formatCurrencyShort(stats?.totalKasMasuk || 0)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-5 h-5 text-rukem-success" />
                <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="stat-card border-l-4 border-l-rukem-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                {statsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-rukem-danger">
                    {formatCurrencyShort(stats?.totalKasKeluar || 0)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="w-5 h-5 text-rukem-danger" />
                <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Kas Chart */}
          <div className="xl:col-span-2 stat-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-foreground">Arus Kas RUKEM</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">6 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rukem-blue"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Masuk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rukem-danger"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Keluar</span>
                </div>
              </div>
            </div>
            <div className="h-[200px] sm:h-[250px] lg:h-[280px]">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : kasChartData && kasChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kasChartData}>
                    <defs>
                      <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bulan" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value / 1000000}Jt`}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="masuk"
                      stroke="hsl(210, 80%, 55%)"
                      fill="url(#colorMasuk)"
                      strokeWidth={2}
                      name="Pemasukan"
                    />
                    <Area
                      type="monotone"
                      dataKey="keluar"
                      stroke="hsl(0, 84%, 60%)"
                      fill="url(#colorKeluar)"
                      strokeWidth={2}
                      name="Pengeluaran"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Belum ada data kas
                </div>
              )}
            </div>
          </div>

          {/* Recent Deaths */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Kematian Terbaru</h2>
              <button
                onClick={() => navigate('/kematian')}
                className="text-xs sm:text-sm text-accent hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {kematianLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentKematian && recentKematian.length > 0 ? (
                recentKematian.map((death) => (
                  <div
                    key={death.id}
                    className="flex items-center gap-3 lg:gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{death.nama}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{death.tanggal}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">RT {death.rt}</span>
                      </div>
                    </div>
                    <span
                      className={`badge text-xs ${
                        death.status === 'selesai' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {death.status === 'selesai' ? 'Selesai' : 'Proses'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Belum ada data kematian
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="stat-card">
          <h2 className="text-base lg:text-lg font-semibold text-foreground mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
            <button
              onClick={() => navigate('/anggota')}
              className="p-3 lg:p-4 rounded-xl bg-rukem-blue-light hover:bg-rukem-blue/20 transition-colors group"
            >
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-rukem-blue mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-medium text-foreground">Lihat Anggota</p>
            </button>
            <button
              onClick={() => navigate('/kematian')}
              className="p-3 lg:p-4 rounded-xl bg-rukem-danger-light hover:bg-rukem-danger/20 transition-colors group"
            >
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-rukem-danger mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-medium text-foreground">Lapor Kematian</p>
            </button>
            <button
              onClick={() => navigate('/santunan')}
              className="p-3 lg:p-4 rounded-xl bg-rukem-success-light hover:bg-rukem-success/20 transition-colors group"
            >
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-rukem-success mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-medium text-foreground">Lihat Santunan</p>
            </button>
            <button
              onClick={() => navigate('/kas')}
              className="p-3 lg:p-4 rounded-xl bg-rukem-warning-light hover:bg-rukem-warning/20 transition-colors group"
            >
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-rukem-warning mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-medium text-foreground">Riwayat Kas</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
