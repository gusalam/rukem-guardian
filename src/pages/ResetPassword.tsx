import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      }
      
      setIsChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes('same as the old password')) {
          setError('Password baru tidak boleh sama dengan password lama');
        } else {
          setError('Gagal mengubah password. Silakan coba lagi.');
        }
      } else {
        setSuccess(true);
        // Sign out after password reset
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
          <p className="text-white/80 mt-4">Memverifikasi...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue flex items-center justify-center p-8">
        <div className="bg-card rounded-2xl p-8 shadow-elevated max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rukem-danger-light mb-6">
            <AlertCircle className="w-8 h-8 text-rukem-danger" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Link Tidak Valid</h2>
          <p className="text-muted-foreground mb-6">
            Link reset password sudah kadaluarsa atau tidak valid. 
            Silakan request link baru.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primary inline-flex items-center gap-2"
          >
            Request Link Baru
          </Link>
        </div>
      </div>
    );
  }

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
            Buat password baru untuk akun Anda
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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

            {success ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rukem-success-light mb-6">
                  <CheckCircle className="w-8 h-8 text-rukem-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Password Berhasil Diubah!</h2>
                <p className="text-muted-foreground mb-6">
                  Password Anda telah berhasil diubah. Silakan login dengan password baru.
                </p>
                <Link
                  to="/login"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Ke Halaman Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Buat Password Baru</h2>
                  <p className="text-muted-foreground mt-2">
                    Masukkan password baru untuk akun Anda
                  </p>
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
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-modern pr-12"
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-modern pr-12"
                        placeholder="Ulangi password baru"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Password Baru</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
