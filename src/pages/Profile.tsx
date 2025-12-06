import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Camera, Loader2, Lock, User, Mail, Shield } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Profile() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch profile data including avatar
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin_rw':
        return { label: 'Admin RW', color: 'bg-blue-500' };
      case 'admin_rt':
        return { label: 'Admin RT', color: 'bg-green-500' };
      case 'operator':
        return { label: 'Operator', color: 'bg-amber-500' };
      default:
        return { label: 'User', color: 'bg-gray-500' };
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Format file harus JPG, PNG, WebP, atau GIF');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Delete existing avatar if any
      await supabase.storage.from('avatars').remove([fileName]);
      
      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('id', user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      toast.success('Foto profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Gagal mengunggah foto profil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!fullName.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Password baru tidak boleh kosong');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password berhasil diperbarui');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.message.includes('should be different')) {
        toast.error('Password baru harus berbeda dari password lama');
      } else {
        toast.error('Gagal memperbarui password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const roleBadge = getRoleBadge(user?.role || null);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Profil
            </CardTitle>
            <CardDescription>
              Perbarui foto dan nama profil Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 cursor-pointer group" onClick={handleAvatarClick}>
                  <AvatarImage src={profile?.avatar_url || undefined} alt={user?.name} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{profile?.full_name || user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${roleBadge.color}`}>
                  <Shield className="w-3 h-3" />
                  {roleBadge.label}
                </span>
              </div>
            </div>

            <Separator />

            {/* Update Name Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
              </div>
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>
              Perbarui password akun Anda untuk keamanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                />
              </div>
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Perbarui Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
