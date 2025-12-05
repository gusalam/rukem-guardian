import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKas, useKasSummary, useKasChartData, useAddKasMasuk, useAddKasKeluar, useUpdateKas, useDeleteKas } from '@/hooks/useKas';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Loader2, Plus, Minus, Pencil, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type KasRukem = Tables<'kas_rukem'>;

export default function Kas() {
  const { data: transactions, isLoading } = useKas();
  const { data: summary } = useKasSummary();
  const { data: chartData } = useKasChartData();
  const { hasPermission } = useAuth();
  const [filterType, setFilterType] = useState('all');
  
  // Check if user is admin (can manage kas)
  const canManageKas = hasPermission(['admin_rw', 'admin_rt']);
  const [isMasukModalOpen, setIsMasukModalOpen] = useState(false);
  const [isKeluarModalOpen, setIsKeluarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'masuk' | 'keluar' | 'edit'>('masuk');
  const [selectedTransaction, setSelectedTransaction] = useState<KasRukem | null>(null);
  
  const addKasMasuk = useAddKasMasuk();
  const addKasKeluar = useAddKasKeluar();
  const updateKas = useUpdateKas();
  const deleteKas = useDeleteKas();

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    keterangan: '',
    kategori: '',
    jenis_transaksi: 'masuk' as 'masuk' | 'keluar',
  });

  const filteredTransactions = (transactions || []).filter(t => filterType === 'all' || t.jenis_transaksi === filterType);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatCurrencyShort = (value: number) => value >= 1000000 ? `Rp ${(value / 1000000).toFixed(1)}Jt` : formatCurrency(value);

  const resetForm = () => {
    setFormData({ tanggal: new Date().toISOString().split('T')[0], nominal: '', keterangan: '', kategori: '', jenis_transaksi: 'masuk' });
    setSelectedTransaction(null);
  };

  const validateForm = () => {
    if (!formData.tanggal || !formData.nominal || !formData.keterangan.trim()) {
      toast.error('Semua field harus diisi');
      return false;
    }
    const nominal = parseFloat(formData.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      toast.error('Nominal harus berupa angka positif');
      return false;
    }
    return true;
  };

  const handleSubmitMasuk = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmType('masuk');
      setIsConfirmOpen(true);
    }
  };

  const handleSubmitKeluar = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmType('keluar');
      setIsConfirmOpen(true);
    }
  };

  const handleEdit = (transaction: KasRukem) => {
    setSelectedTransaction(transaction);
    setFormData({
      tanggal: transaction.tanggal,
      nominal: String(transaction.nominal),
      keterangan: transaction.keterangan || '',
      kategori: transaction.kategori || '',
      jenis_transaksi: transaction.jenis_transaksi as 'masuk' | 'keluar',
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmType('edit');
      setIsConfirmOpen(true);
    }
  };

  const handleDeleteClick = (transaction: KasRukem) => {
    setSelectedTransaction(transaction);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const payload = {
        tanggal: formData.tanggal,
        nominal: parseFloat(formData.nominal),
        keterangan: formData.keterangan.trim(),
        kategori: formData.kategori || undefined,
      };

      if (confirmType === 'masuk') {
        await addKasMasuk.mutateAsync(payload);
        toast.success('Kas masuk berhasil ditambahkan');
        setIsMasukModalOpen(false);
      } else if (confirmType === 'keluar') {
        await addKasKeluar.mutateAsync(payload);
        toast.success('Kas keluar berhasil ditambahkan');
        setIsKeluarModalOpen(false);
      } else if (confirmType === 'edit' && selectedTransaction) {
        await updateKas.mutateAsync({
          id: selectedTransaction.id,
          ...payload,
          jenis_transaksi: formData.jenis_transaksi,
        });
        toast.success('Transaksi berhasil diperbarui');
        setIsEditModalOpen(false);
      }
      setIsConfirmOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;
    try {
      await deleteKas.mutateAsync(selectedTransaction.id);
      toast.success('Transaksi berhasil dihapus');
      setIsDeleteConfirmOpen(false);
      setSelectedTransaction(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data. Silakan coba lagi.');
    }
  };

  const isPending = addKasMasuk.isPending || addKasKeluar.isPending || updateKas.isPending || deleteKas.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kas RUKEM</h1>
            <p className="text-sm text-muted-foreground">Riwayat pemasukan dan pengeluaran kas</p>
          </div>
          {canManageKas && (
            <div className="flex gap-2">
              <Dialog open={isMasukModalOpen} onOpenChange={setIsMasukModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" variant="default" onClick={resetForm}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Kas Masuk</span>
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Kas Masuk</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitMasuk} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal-masuk">Tanggal</Label>
                    <Input id="tanggal-masuk" type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nominal-masuk">Nominal (Rp)</Label>
                    <Input id="nominal-masuk" type="number" placeholder="Contoh: 50000" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: e.target.value })} min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategori-masuk">Kategori</Label>
                    <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iuran">Iuran Anggota</SelectItem>
                        <SelectItem value="donasi">Donasi</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keterangan-masuk">Keterangan</Label>
                    <Textarea id="keterangan-masuk" placeholder="Contoh: Iuran bulanan RT 01" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={3} required />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsMasukModalOpen(false)}>Batal</Button>
                    <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isKeluarModalOpen} onOpenChange={setIsKeluarModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" variant="destructive" onClick={resetForm}>
                  <Minus className="w-4 h-4" />
                  <span className="hidden sm:inline">Kas Keluar</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Kas Keluar</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitKeluar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal-keluar">Tanggal</Label>
                    <Input id="tanggal-keluar" type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nominal-keluar">Nominal (Rp)</Label>
                    <Input id="nominal-keluar" type="number" placeholder="Contoh: 500000" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: e.target.value })} min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategori-keluar">Kategori</Label>
                    <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santunan">Pembayaran Santunan</SelectItem>
                        <SelectItem value="operasional">Operasional</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keterangan-keluar">Keterangan</Label>
                    <Textarea id="keterangan-keluar" placeholder="Contoh: Santunan almarhum Bapak Ahmad" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={3} required />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsKeluarModalOpen(false)}>Batal</Button>
                    <Button type="submit" variant="destructive" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button>
                  </div>
                </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaksi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jenis-edit">Jenis Transaksi</Label>
                <Select value={formData.jenis_transaksi} onValueChange={(v) => setFormData({ ...formData, jenis_transaksi: v as 'masuk' | 'keluar' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Kas Masuk</SelectItem>
                    <SelectItem value="keluar">Kas Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal-edit">Tanggal</Label>
                <Input id="tanggal-edit" type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nominal-edit">Nominal (Rp)</Label>
                <Input id="nominal-edit" type="number" value={formData.nominal} onChange={(e) => setFormData({ ...formData, nominal: e.target.value })} min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori-edit">Kategori</Label>
                <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {formData.jenis_transaksi === 'masuk' ? (
                      <>
                        <SelectItem value="iuran">Iuran Anggota</SelectItem>
                        <SelectItem value="donasi">Donasi</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="santunan">Pembayaran Santunan</SelectItem>
                        <SelectItem value="operasional">Operasional</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan-edit">Keterangan</Label>
                <Textarea id="keterangan-edit" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={3} required />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title={confirmType === 'edit' ? 'Konfirmasi Edit' : confirmType === 'masuk' ? 'Konfirmasi Kas Masuk' : 'Konfirmasi Kas Keluar'}
          description={confirmType === 'edit' 
            ? `Anda akan mengubah transaksi ini. Lanjutkan?`
            : `Anda akan menambahkan kas ${confirmType} sebesar Rp ${parseFloat(formData.nominal || '0').toLocaleString('id-ID')}. Lanjutkan?`
          }
          confirmText="Ya, Simpan"
          cancelText="Batal"
          onConfirm={handleConfirmSubmit}
          isLoading={isPending}
          variant={confirmType === 'keluar' ? 'destructive' : 'default'}
        />

        <ConfirmDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          title="Hapus Transaksi"
          description={`Anda akan menghapus transaksi "${selectedTransaction?.keterangan || 'ini'}". Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={handleConfirmDelete}
          isLoading={deleteKas.isPending}
          variant="destructive"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="stat-card bg-gradient-to-br from-rukem-navy to-rukem-navy-light text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
              <div><p className="text-xs opacity-80">Saldo Kas</p><p className="text-lg font-bold">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : formatCurrency(summary?.saldo || 0)}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rukem-success-light flex items-center justify-center"><TrendingUp className="w-5 h-5 text-rukem-success" /></div>
              <div><p className="text-xs text-muted-foreground">Total Masuk</p><p className="text-lg font-bold text-rukem-success">{formatCurrencyShort(summary?.totalMasuk || 0)}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rukem-danger-light flex items-center justify-center"><TrendingDown className="w-5 h-5 text-rukem-danger" /></div>
              <div><p className="text-xs text-muted-foreground">Total Keluar</p><p className="text-lg font-bold text-rukem-danger">{formatCurrencyShort(summary?.totalKeluar || 0)}</p></div>
            </div>
          </div>
        </div>

        {chartData && chartData.length > 0 && (
          <div className="stat-card">
            <h2 className="text-base font-semibold mb-4">Grafik Kas (6 Bulan)</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bulan" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000000}Jt`} width={45} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="masuk" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Masuk" />
                  <Bar dataKey="keluar" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Keluar" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Riwayat Transaksi</h2>
            <div className="flex gap-2">
              {['all', 'masuk', 'keluar'].map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium', filterType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                  {type === 'all' ? 'Semua' : type === 'masuk' ? 'Masuk' : 'Keluar'}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada transaksi</div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 20).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', t.jenis_transaksi === 'masuk' ? 'bg-rukem-success-light' : 'bg-rukem-danger-light')}>
                    {t.jenis_transaksi === 'masuk' ? <ArrowUpRight className="w-4 h-4 text-rukem-success" /> : <ArrowDownRight className="w-4 h-4 text-rukem-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.keterangan || t.kategori || '-'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /><span>{t.tanggal}</span>
                      {t.kategori && <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{t.kategori}</span>}
                    </div>
                  </div>
                  <p className={cn('text-sm font-semibold font-mono', t.jenis_transaksi === 'masuk' ? 'text-rukem-success' : 'text-rukem-danger')}>
                    {t.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrencyShort(Number(t.nominal))}
                  </p>
                  {canManageKas && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(t)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(t)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}