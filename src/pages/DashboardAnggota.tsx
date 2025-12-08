import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  Wallet, 
  Heart, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AnggotaData {
  id: string;
  nama_kepala_keluarga: string;
  email: string;
  status_anggota: string;
  nomor_anggota: string;
  rt: string;
  rw: string;
  created_at: string;
}

export default function DashboardAnggota() {
  const { user, logout, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch anggota data for current user
  const { data: anggotaData, isLoading } = useQuery({
    queryKey: ['my-anggota-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AnggotaData | null;
    },
    enabled: !!user?.id,
  });

  // Fetch iuran/keanggotaan data
  const { data: keanggotaanData } = useQuery({
    queryKey: ['my-keanggotaan', anggotaData?.id],
    queryFn: async () => {
      if (!anggotaData?.id) return null;
      const { data, error } = await supabase
        .from('keanggotaan_rukem')
        .select('*')
        .eq('anggota_id', anggotaData.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!anggotaData?.id,
  });

  // Fetch santunan data for this anggota
  const { data: santunanData } = useQuery({
    queryKey: ['my-santunan', anggotaData?.id],
    queryFn: async () => {
      if (!anggotaData?.id) return [];
      const { data, error } = await supabase
        .from('santunan')
        .select('*')
        .eq('anggota_id', anggotaData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!anggotaData?.id,
  });

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is anggota role
    if (user?.role !== 'anggota') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isInitialized, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard-anggota' },
    { icon: Wallet, label: 'Iuran Saya', path: '/dashboard-anggota/iuran' },
    { icon: Heart, label: 'Santunan', path: '/dashboard-anggota/santunan' },
    { icon: Bell, label: 'Pengumuman', path: '/dashboard-anggota/pengumuman' },
    { icon: User, label: 'Profil Saya', path: '/dashboard-anggota/profil' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50',
          'w-64 -translate-x-full lg:translate-x-0',
          sidebarOpen && 'translate-x-0',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 flex items-center justify-between border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">RUKEM</h1>
                <p className="text-xs text-sidebar-foreground/60">Portal Anggota</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary rounded-full items-center justify-center text-sidebar-primary-foreground shadow-md hover:scale-110 transition-transform"
        >
          {collapsed ? <Menu className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'nav-item',
                      isActive && 'active',
                      collapsed && 'lg:justify-center lg:px-3'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={cn('font-medium', collapsed && 'lg:hidden')}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold">
                  {anggotaData?.nama_kepala_keluarga?.charAt(0) || user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {anggotaData?.nama_kepala_keluarga || user?.name}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white mt-1">
                    Anggota
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        collapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold">RUKEM</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Dashboard Anggota</h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang, {anggotaData?.nama_kepala_keluarga || user?.name}
            </p>
          </div>

          {/* Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Status Anggota */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  anggotaData?.status_anggota === 'active' ? 'bg-green-500/10' : 'bg-amber-500/10'
                )}>
                  {anggotaData?.status_anggota === 'active' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Clock className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Keanggotaan</p>
                  <p className={cn(
                    'text-lg font-bold capitalize',
                    anggotaData?.status_anggota === 'active' ? 'text-green-500' : 'text-amber-500'
                  )}>
                    {anggotaData?.status_anggota === 'active' ? 'Aktif' : 'Menunggu Verifikasi'}
                  </p>
                </div>
              </div>
            </div>

            {/* Nomor Anggota */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Anggota</p>
                  <p className="text-lg font-bold text-foreground">
                    {anggotaData?.nomor_anggota || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Iuran */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  keanggotaanData?.status_iuran === 'lancar' ? 'bg-green-500/10' : 'bg-red-500/10'
                )}>
                  <Wallet className={cn(
                    'w-6 h-6',
                    keanggotaanData?.status_iuran === 'lancar' ? 'text-green-500' : 'text-red-500'
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Iuran</p>
                  <p className={cn(
                    'text-lg font-bold capitalize',
                    keanggotaanData?.status_iuran === 'lancar' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {keanggotaanData?.status_iuran || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info Keanggotaan */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Informasi Keanggotaan</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wilayah</span>
                  <span className="font-medium">RT {anggotaData?.rt || '-'} / RW {anggotaData?.rw || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jenis Iuran</span>
                  <span className="font-medium capitalize">{keanggotaanData?.jenis_iuran || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Bergabung</span>
                  <span className="font-medium">
                    {keanggotaanData?.tanggal_mulai 
                      ? format(new Date(keanggotaanData.tanggal_mulai), 'dd MMM yyyy', { locale: id })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Santunan Terakhir */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Riwayat Santunan</h2>
              </div>
              <div className="p-4">
                {santunanData && santunanData.length > 0 ? (
                  <div className="space-y-3">
                    {santunanData.slice(0, 3).map((s) => (
                      <div key={s.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{formatCurrency(s.nominal || 0)}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.created_at ? format(new Date(s.created_at), 'dd MMM yyyy', { locale: id }) : '-'}
                          </p>
                        </div>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          s.status_santunan === 'approved' ? 'bg-green-500/10 text-green-500' :
                          s.status_santunan === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        )}>
                          {s.status_santunan === 'approved' ? 'Disetujui' :
                           s.status_santunan === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada riwayat santunan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
