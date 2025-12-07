import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        if (resetError.message.includes('rate limit')) {
          setError('Terlalu banyak permintaan. Silakan tunggu beberapa menit.');
        } else {
          setError('Gagal mengirim email reset password. Silakan coba lagi.');
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
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
            Reset password untuk mengakses kembali akun Anda
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            {/* Back to Login */}
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Kembali ke Login</span>
            </Link>

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
                <h2 className="text-2xl font-bold text-foreground mb-4">Email Terkirim!</h2>
                <p className="text-muted-foreground mb-6">
                  Kami telah mengirim link reset password ke <strong>{email}</strong>. 
                  Silakan cek inbox atau folder spam Anda.
                </p>
                <Link
                  to="/login"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Login
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Lupa Password?</h2>
                  <p className="text-muted-foreground mt-2">
                    Masukkan email Anda dan kami akan mengirim link untuk reset password
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
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <span>Kirim Link Reset</span>
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
