import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Clock, ArrowLeft, LogOut } from 'lucide-react';

export default function PendingApproval() {
  const { user, logout, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-rukem-blue/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">RUKEM</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Menunggu Persetujuan
          </h1>
          <p className="text-muted-foreground mb-6">
            Pendaftaran Anda sedang dalam proses verifikasi oleh admin. 
            Silakan tunggu pemberitahuan melalui email atau coba login kembali nanti.
          </p>

          {/* User Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Terdaftar sebagai:</p>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          Ada pertanyaan? Hubungi admin RT/RW setempat.
        </p>
      </div>
    </div>
  );
}
