import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useKas, useKasSummary, useKasChartData, useAddKasMasuk } from '@/hooks/useKas';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Loader2, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function Kas() {
  const { data: transactions, isLoading } = useKas();
  const { data: summary } = useKasSummary();
  const { data: chartData } = useKasChartData();
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const addKasMasuk = useAddKasMasuk();

  // Form state
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    keterangan: '',
  });

  const filteredTransactions = (transactions || []).filter(t => filterType === 'all' || t.jenis_transaksi === filterType);

  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  const formatCurrencyShort = (value: number) => value >= 1000000 ? `Rp ${(value / 1000000).toFixed(1)}Jt` : formatCurrency(value);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await addKasMasuk.mutateAsync({
        tanggal: formData.tanggal,
        nominal: parseFloat(formData.nominal),
        keterangan: formData.keterangan.trim(),
      });
      toast.success('Kas masuk berhasil ditambahkan');
      setIsModalOpen(false);
      setIsConfirmOpen(false);
      setFormData({ tanggal: new Date().toISOString().split('T')[0], nominal: '', keterangan: '' });
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan kas masuk. Silakan coba lagi.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kas RUKEM</h1>
            <p className="text-sm text-muted-foreground">Riwayat pemasukan dan pengeluaran kas</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Kas Masuk</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kas Masuk / Iuran</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nominal">Nominal (Rp)</Label>
                  <Input
                    id="nominal"
                    type="number"
                    placeholder="Contoh: 50000"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea
                    id="keterangan"
                    placeholder="Contoh: Iuran bulanan RT 01"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={addKasMasuk.isPending}>
                    {addKasMasuk.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Simpan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Konfirmasi Kas Masuk"
            description={`Anda akan menambahkan kas masuk sebesar Rp ${parseFloat(formData.nominal || '0').toLocaleString('id-ID')}. Lanjutkan?`}
            confirmText="Ya, Simpan"
            cancelText="Batal"
            onConfirm={handleConfirmSubmit}
            isLoading={addKasMasuk.isPending}
          />
        </div>

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
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', t.jenis_transaksi === 'masuk' ? 'bg-rukem-success-light' : 'bg-rukem-danger-light')}>
                    {t.jenis_transaksi === 'masuk' ? <ArrowUpRight className="w-4 h-4 text-rukem-success" /> : <ArrowDownRight className="w-4 h-4 text-rukem-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.keterangan || t.kategori || '-'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /><span>{t.tanggal}</span>
                    </div>
                  </div>
                  <p className={cn('text-sm font-semibold font-mono', t.jenis_transaksi === 'masuk' ? 'text-rukem-success' : 'text-rukem-danger')}>
                    {t.jenis_transaksi === 'masuk' ? '+' : '-'}{formatCurrencyShort(Number(t.nominal))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
