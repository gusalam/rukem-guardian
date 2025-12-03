import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { parseCSV, mapCSVToAnggota, downloadCSVTemplate } from '@/lib/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ImportAnggotaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportAnggotaModal({ isOpen, onClose }: ImportAnggotaModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ total: number; valid: number; data: Record<string, string>[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      const validData = mapCSVToAnggota(rows);
      
      setPreview({
        total: rows.length,
        valid: validData.length,
        data: rows.slice(0, 5),
      });
    } catch (error) {
      toast.error('Gagal membaca file CSV');
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const anggotaData = mapCSVToAnggota(rows);

      let success = 0;
      let failed = 0;

      for (const anggota of anggotaData) {
        const { error } = await supabase.from('anggota').insert({
          nama_kepala_keluarga: anggota.nama_kepala_keluarga!,
          nomor_anggota: anggota.nomor_anggota || null,
          no_kk: anggota.no_kk || null,
          no_ktp: anggota.no_ktp || null,
          tempat_lahir: anggota.tempat_lahir || null,
          tanggal_lahir: anggota.tanggal_lahir || null,
          jenis_kelamin: anggota.jenis_kelamin || null,
          agama: anggota.agama || null,
          alamat: anggota.alamat || null,
          rt: anggota.rt || null,
          rw: anggota.rw || null,
          kelurahan: anggota.kelurahan || null,
          kecamatan: anggota.kecamatan || null,
          kota: anggota.kota || null,
          provinsi: anggota.provinsi || null,
          kode_pos: anggota.kode_pos || null,
          no_hp: anggota.no_hp || null,
          email: anggota.email || null,
          pekerjaan: anggota.pekerjaan || null,
          pendidikan: anggota.pendidikan || null,
          status_perkawinan: anggota.status_perkawinan || null,
          tanggal_daftar: anggota.tanggal_daftar || new Date().toISOString().split('T')[0],
        });

        if (error) {
          failed++;
        } else {
          success++;
        }
      }

      setImportResult({ success, failed });
      
      if (success > 0) {
        queryClient.invalidateQueries({ queryKey: ['anggota'] });
        toast.success(`${success} data berhasil diimport`);
      }
      
      if (failed > 0) {
        toast.error(`${failed} data gagal diimport`);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Data Anggota</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Download template CSV untuk format yang benar:
            </p>
            <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : 'Klik atau drag file CSV ke sini'}
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                <span>Total baris: {preview.total}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {preview.valid === preview.total ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span>Data valid: {preview.valid}</span>
              </div>
              
              {preview.data.length > 0 && (
                <div className="mt-3 text-xs">
                  <p className="font-medium mb-1">Preview (5 baris pertama):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        {preview.data.map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-1 px-2">{i + 1}.</td>
                            <td className="py-1 px-2">{row['Nama Kepala Keluarga'] || '-'}</td>
                            <td className="py-1 px-2">{row['RT'] || '-'}/{row['RW'] || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>{importResult.success} data berhasil diimport</span>
              </div>
              {importResult.failed > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{importResult.failed} data gagal</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? 'Tutup' : 'Batal'}
            </Button>
            {!importResult && preview && preview.valid > 0 && (
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {preview.valid} Data
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
