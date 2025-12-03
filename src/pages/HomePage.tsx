import { useNavigate } from 'react-router-dom';
import { usePublicStats } from '@/hooks/usePublicStats';
import { 
  Shield, 
  Users, 
  Wallet, 
  Heart, 
  FileText, 
  ArrowRight, 
  Radio,
  Loader2 
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = usePublicStats();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} Miliar`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} Juta`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const statsData = [
    {
      label: 'Total Anggota',
      value: stats?.totalAnggota || 0,
      displayValue: (stats?.totalAnggota || 0).toLocaleString('id-ID'),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      delay: '0ms',
    },
    {
      label: 'Saldo Kas RUKEM',
      value: stats?.saldoKas || 0,
      displayValue: formatCurrency(stats?.saldoKas || 0),
      icon: Wallet,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      delay: '100ms',
    },
    {
      label: 'Total Santunan Tersalurkan',
      value: stats?.totalSantunan || 0,
      displayValue: formatCurrency(stats?.totalSantunan || 0),
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-500/10',
      delay: '200ms',
    },
    {
      label: 'Santunan Disalurkan',
      value: stats?.santunanCount || 0,
      displayValue: `${(stats?.santunanCount || 0).toLocaleString('id-ID')} Keluarga`,
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      delay: '300ms',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-rukem-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RUKEM</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2 group"
          >
            Masuk
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6">
              <Radio className="w-3 h-3 text-green-400 animate-pulse" />
              <span>Data Real-time dari Database</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Sistem Rukun Kematian
              <br />
              <span className="text-rukem-blue-light">Transparan & Terpercaya</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Kelola data anggota, laporan kematian, dan santunan dengan mudah. 
              Semua data terintegrasi dan dapat dipantau secara real-time.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-primary rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-100 flex items-center gap-2 mx-auto"
            >
              Masuk ke Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {statsData.map((stat, index) => (
              <div
                key={stat.label}
                className="relative group animate-slide-up"
                style={{ animationDelay: stat.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
                  style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-2.5 h-2.5 text-green-400 animate-pulse" />
                      <span className="text-[10px] text-green-400 font-medium">LIVE</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white/50 mt-2" />
                    ) : (
                      <p className="text-2xl lg:text-3xl font-bold text-white truncate">
                        {stat.displayValue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manajemen Anggota</h3>
              <p className="text-white/60 text-sm">
                Kelola data anggota dengan mudah dan terstruktur
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Laporan Kematian</h3>
              <p className="text-white/60 text-sm">
                Pencatatan dan verifikasi laporan kematian secara cepat
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pencairan Santunan</h3>
              <p className="text-white/60 text-sm">
                Proses santunan transparan dan dapat dilacak
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} RUKEM - Rukun Kematian. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
