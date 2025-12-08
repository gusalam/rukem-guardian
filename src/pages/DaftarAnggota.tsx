import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AnggotaForm, AnggotaFormData, defaultAnggotaFormData } from '@/components/anggota/AnggotaForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';

export default function DaftarAnggota() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AnggotaFormData>({
    ...defaultAnggotaFormData,
    tanggal_daftar: new Date().toISOString().split('T')[0],
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_kepala_keluarga.trim()) {
      toast.error('Nama kepala keluarga wajib diisi');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email wajib diisi untuk login');
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama');
      return;
    }
    
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setShowConfirm(false);
    
    try {
      // 1. Create Supabase Auth account
      const redirectUrl = `${window.location.origin}/login`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.nama_kepala_keluarga,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
        } else {
          toast.error(`Gagal membuat akun: ${authError.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Gagal membuat akun. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      // 2. Insert anggota data with user_id and pending status
      const anggotaData = {
        ...formData,
        tanggal_lahir: formData.tanggal_lahir || null,
        tanggal_pembukuan: formData.tanggal_pembukuan || null,
        tanggal_daftar: formData.tanggal_daftar || null,
        user_id: authData.user.id,
        status_anggota: 'pending',
      };

      const { error: anggotaError } = await supabase
        .from('anggota')
        .insert(anggotaData);

      if (anggotaError) {
        console.error('Anggota insert error:', anggotaError);
        toast.error('Gagal menyimpan data anggota. Silakan hubungi admin.');
        setIsLoading(false);
        return;
      }

      // 3. Assign 'anggota' role in user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'anggota',
          rt: formData.rt || null,
          rw: formData.rw || null,
        });

      if (roleError) {
        console.error('Role insert error:', roleError);
        // Don't fail the whole registration for this
      }

      toast.success('Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu tunggu persetujuan admin.');
      navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-rukem-navy-light to-rukem-blue py-8 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-rukem-blue/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RUKEM</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">Daftar Anggota Baru</h1>
            <p className="text-muted-foreground mt-1">
              Isi data lengkap untuk mendaftar sebagai anggota RUKEM. Setelah mendaftar, tunggu persetujuan admin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <AnggotaForm
              formData={formData}
              onChange={handleChange}
              showAdminFields={false}
              showPasswordField={true}
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={handlePasswordChange}
            />

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sudah punya akun? Masuk di sini
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Daftar Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Pendaftaran"
        message="Apakah Anda yakin data yang diisi sudah benar? Setelah mendaftar, data akan diverifikasi oleh admin."
        confirmText="Ya, Daftar"
        cancelText="Periksa Lagi"
      />
    </div>
  );
}
