export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anggota: {
        Row: {
          agama: string | null
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          jenis_kelamin: string | null
          kecamatan: string | null
          kelurahan: string | null
          kewarganegaraan: string | null
          kode_pos: string | null
          kota: string | null
          nama_kepala_keluarga: string
          no_hp: string | null
          no_kk: string | null
          no_ktp: string | null
          nomor_anggota: string | null
          nomor_data: string | null
          pekerjaan: string | null
          pendidikan: string | null
          provinsi: string | null
          rt: string | null
          rw: string | null
          status_keluar: boolean | null
          status_perkawinan: string | null
          tanggal_daftar: string | null
          tanggal_lahir: string | null
          tanggal_pembukuan: string | null
          tempat_lahir: string | null
          updated_at: string | null
        }
        Insert: {
          agama?: string | null
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          kewarganegaraan?: string | null
          kode_pos?: string | null
          kota?: string | null
          nama_kepala_keluarga: string
          no_hp?: string | null
          no_kk?: string | null
          no_ktp?: string | null
          nomor_anggota?: string | null
          nomor_data?: string | null
          pekerjaan?: string | null
          pendidikan?: string | null
          provinsi?: string | null
          rt?: string | null
          rw?: string | null
          status_keluar?: boolean | null
          status_perkawinan?: string | null
          tanggal_daftar?: string | null
          tanggal_lahir?: string | null
          tanggal_pembukuan?: string | null
          tempat_lahir?: string | null
          updated_at?: string | null
        }
        Update: {
          agama?: string | null
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          kewarganegaraan?: string | null
          kode_pos?: string | null
          kota?: string | null
          nama_kepala_keluarga?: string
          no_hp?: string | null
          no_kk?: string | null
          no_ktp?: string | null
          nomor_anggota?: string | null
          nomor_data?: string | null
          pekerjaan?: string | null
          pendidikan?: string | null
          provinsi?: string | null
          rt?: string | null
          rw?: string | null
          status_keluar?: boolean | null
          status_perkawinan?: string | null
          tanggal_daftar?: string | null
          tanggal_lahir?: string | null
          tanggal_pembukuan?: string | null
          tempat_lahir?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kas_rukem: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          jenis_transaksi: string
          kategori: string | null
          keterangan: string | null
          nominal: number
          saldo_akhir: number | null
          sumber: string | null
          tanggal: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          jenis_transaksi: string
          kategori?: string | null
          keterangan?: string | null
          nominal: number
          saldo_akhir?: number | null
          sumber?: string | null
          tanggal: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          jenis_transaksi?: string
          kategori?: string | null
          keterangan?: string | null
          nominal?: number
          saldo_akhir?: number | null
          sumber?: string | null
          tanggal?: string
        }
        Relationships: []
      }
      keanggotaan_rukem: {
        Row: {
          anggota_id: string
          catatan: string | null
          created_at: string | null
          id: string
          jenis_iuran: string | null
          status_iuran: string | null
          status_keanggotaan: string | null
          tanggal_mulai: string | null
          terdaftar: boolean | null
          updated_at: string | null
        }
        Insert: {
          anggota_id: string
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_iuran?: string | null
          status_iuran?: string | null
          status_keanggotaan?: string | null
          tanggal_mulai?: string | null
          terdaftar?: boolean | null
          updated_at?: string | null
        }
        Update: {
          anggota_id?: string
          catatan?: string | null
          created_at?: string | null
          id?: string
          jenis_iuran?: string | null
          status_iuran?: string | null
          status_keanggotaan?: string | null
          tanggal_mulai?: string | null
          terdaftar?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keanggotaan_rukem_anggota_id_fkey"
            columns: ["anggota_id"]
            isOneToOne: true
            referencedRelation: "anggota"
            referencedColumns: ["id"]
          },
        ]
      }
      kematian: {
        Row: {
          anggota_id: string
          created_at: string | null
          id: string
          jam_wafat: string | null
          keterangan: string | null
          no_surat_kematian: string | null
          pelapor: string | null
          status_verifikasi: string | null
          tanggal_wafat: string
          tempat_wafat: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          anggota_id: string
          created_at?: string | null
          id?: string
          jam_wafat?: string | null
          keterangan?: string | null
          no_surat_kematian?: string | null
          pelapor?: string | null
          status_verifikasi?: string | null
          tanggal_wafat: string
          tempat_wafat?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          anggota_id?: string
          created_at?: string | null
          id?: string
          jam_wafat?: string | null
          keterangan?: string | null
          no_surat_kematian?: string | null
          pelapor?: string | null
          status_verifikasi?: string | null
          tanggal_wafat?: string
          tempat_wafat?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kematian_anggota_id_fkey"
            columns: ["anggota_id"]
            isOneToOne: true
            referencedRelation: "anggota"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      santunan: {
        Row: {
          anggota_id: string
          approved_at: string | null
          approved_by: string | null
          bukti_serah_terima: string | null
          created_at: string | null
          hak_santunan: boolean | null
          id: string
          kematian_id: string
          metode_pencairan: string | null
          nominal: number | null
          status_santunan: string | null
          tanggal_pencairan: string | null
          updated_at: string | null
        }
        Insert: {
          anggota_id: string
          approved_at?: string | null
          approved_by?: string | null
          bukti_serah_terima?: string | null
          created_at?: string | null
          hak_santunan?: boolean | null
          id?: string
          kematian_id: string
          metode_pencairan?: string | null
          nominal?: number | null
          status_santunan?: string | null
          tanggal_pencairan?: string | null
          updated_at?: string | null
        }
        Update: {
          anggota_id?: string
          approved_at?: string | null
          approved_by?: string | null
          bukti_serah_terima?: string | null
          created_at?: string | null
          hak_santunan?: boolean | null
          id?: string
          kematian_id?: string
          metode_pencairan?: string | null
          nominal?: number | null
          status_santunan?: string | null
          tanggal_pencairan?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "santunan_anggota_id_fkey"
            columns: ["anggota_id"]
            isOneToOne: true
            referencedRelation: "anggota"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santunan_kematian_id_fkey"
            columns: ["kematian_id"]
            isOneToOne: false
            referencedRelation: "kematian"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          rt: string | null
          rw: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          rt?: string | null
          rw?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          rt?: string | null
          rw?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin_rw" | "admin_rt" | "operator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_rw", "admin_rt", "operator"],
    },
  },
} as const
