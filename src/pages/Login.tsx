import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: loginError } = await login(email, password);
    
    if (loginError) {
      setError(loginError);
    } else {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <Shield className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">RUKEM</h1>
          <p className="text-xl text-white/80 mb-2">Sistem Rukun Kematian</p>
          <p className="text-white/60 max-w-md mx-auto">
            Kelola data anggota, laporan kematian, dan santunan dengan mudah dan transparan
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">1,234</p>
              <p className="text-sm text-white/70">Anggota</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-sm text-white/70">Aktif</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-sm text-white/70">Santunan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
                <Shield className="w-9 h-9 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">RUKEM</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
              <p className="text-muted-foreground mt-2">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-rukem-danger-light flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rukem-danger flex-shrink-0" />
                <p className="text-sm text-rukem-danger">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern pr-12"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full btn-primary flex items-center justify-center gap-2',
                  isLoading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3 sm:mb-4">
                Akun Demo untuk Testing:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between p-2 rounded bg-muted/50 gap-1">
                  <span className="text-muted-foreground">Admin RW:</span>
                  <span className="font-mono text-foreground text-xs">admin.rw@rukem.id / admin123</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between p-2 rounded bg-muted/50 gap-1">
                  <span className="text-muted-foreground">Admin RT:</span>
                  <span className="font-mono text-foreground text-xs">admin.rt@rukem.id / admin123</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between p-2 rounded bg-muted/50 gap-1">
                  <span className="text-muted-foreground">Operator:</span>
                  <span className="font-mono text-foreground text-xs">operator@rukem.id / operator123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
