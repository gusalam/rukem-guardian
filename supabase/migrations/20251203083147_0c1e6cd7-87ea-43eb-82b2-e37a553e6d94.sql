-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin_rw', 'admin_rt', 'operator');

-- 2. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  rt VARCHAR(5),
  rw VARCHAR(5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create anggota table (main member data)
CREATE TABLE public.anggota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_data VARCHAR(50),
  nomor_anggota VARCHAR(50) UNIQUE,
  no_kk VARCHAR(20),
  nama_kepala_keluarga VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
  agama VARCHAR(50),
  status_perkawinan VARCHAR(50),
  pekerjaan VARCHAR(100),
  pendidikan VARCHAR(100),
  
  alamat TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  kota VARCHAR(100),
  provinsi VARCHAR(100),
  kode_pos VARCHAR(10),
  
  kewarganegaraan VARCHAR(50) DEFAULT 'WNI',
  no_ktp VARCHAR(20),
  no_hp VARCHAR(20),
  email VARCHAR(255),
  
  tanggal_pembukuan DATE,
  tanggal_daftar DATE,
  status_keluar BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create keanggotaan_rukem table
CREATE TABLE public.keanggotaan_rukem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id UUID REFERENCES public.anggota(id) ON DELETE CASCADE NOT NULL UNIQUE,
  terdaftar BOOLEAN DEFAULT FALSE,
  status_keanggotaan VARCHAR(20) CHECK (status_keanggotaan IN ('aktif', 'keluar', 'meninggal')),
  tanggal_mulai DATE,
  jenis_iuran VARCHAR(20) CHECK (jenis_iuran IN ('bulanan', 'per_kejadian')),
  status_iuran VARCHAR(20) CHECK (status_iuran IN ('lancar', 'menunggak')),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create kematian table
CREATE TABLE public.kematian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id UUID REFERENCES public.anggota(id) ON DELETE RESTRICT NOT NULL UNIQUE,
  tanggal_wafat DATE NOT NULL,
  jam_wafat TIME,
  tempat_wafat VARCHAR(255),
  pelapor VARCHAR(255),
  no_surat_kematian VARCHAR(100),
  keterangan TEXT,
  status_verifikasi VARCHAR(20) DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'verified')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create santunan table
CREATE TABLE public.santunan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id UUID REFERENCES public.anggota(id) ON DELETE RESTRICT NOT NULL UNIQUE,
  kematian_id UUID REFERENCES public.kematian(id) ON DELETE RESTRICT NOT NULL,
  hak_santunan BOOLEAN DEFAULT TRUE,
  nominal NUMERIC(15,2),
  tanggal_pencairan DATE,
  metode_pencairan VARCHAR(20) CHECK (metode_pencairan IN ('tunai', 'transfer', 'e-wallet')),
  status_santunan VARCHAR(20) DEFAULT 'pending' CHECK (status_santunan IN ('pending', 'approved', 'disbursed', 'rejected')),
  bukti_serah_terima TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create kas_rukem table
CREATE TABLE public.kas_rukem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  jenis_transaksi VARCHAR(10) NOT NULL CHECK (jenis_transaksi IN ('masuk', 'keluar')),
  kategori VARCHAR(100),
  sumber VARCHAR(255),
  nominal NUMERIC(15,2) NOT NULL,
  saldo_akhir NUMERIC(15,2),
  keterangan TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keanggotaan_rukem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kematian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.santunan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_rukem ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any role (is authenticated staff)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin RW can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin_rw'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for anggota (all staff can read, admin can modify)
CREATE POLICY "Staff can view anggota" ON public.anggota
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert anggota" ON public.anggota
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update anggota" ON public.anggota
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for keanggotaan_rukem
CREATE POLICY "Staff can view keanggotaan" ON public.keanggotaan_rukem
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage keanggotaan" ON public.keanggotaan_rukem
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for kematian
CREATE POLICY "Staff can view kematian" ON public.kematian
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert kematian" ON public.kematian
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admin can update kematian" ON public.kematian
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin_rw') OR 
    public.has_role(auth.uid(), 'admin_rt')
  );

-- RLS Policies for santunan
CREATE POLICY "Staff can view santunan" ON public.santunan
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert santunan" ON public.santunan
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admin RW can manage santunan" ON public.santunan
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin_rw'));

-- RLS Policies for kas_rukem
CREATE POLICY "Staff can view kas" ON public.kas_rukem
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Admin can manage kas" ON public.kas_rukem
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin_rw') OR 
    public.has_role(auth.uid(), 'admin_rt')
  );

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anggota_updated_at BEFORE UPDATE ON public.anggota
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keanggotaan_updated_at BEFORE UPDATE ON public.keanggotaan_rukem
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kematian_updated_at BEFORE UPDATE ON public.kematian
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_santunan_updated_at BEFORE UPDATE ON public.santunan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Validation: Santunan requires kematian
CREATE OR REPLACE FUNCTION public.validate_santunan()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if kematian exists for this anggota
  IF NOT EXISTS (
    SELECT 1 FROM public.kematian WHERE anggota_id = NEW.anggota_id
  ) THEN
    RAISE EXCEPTION 'Santunan tidak dapat dibuat tanpa data kematian';
  END IF;
  
  -- Check if anggota is registered in RUKEM
  IF NOT EXISTS (
    SELECT 1 FROM public.keanggotaan_rukem 
    WHERE anggota_id = NEW.anggota_id AND terdaftar = true
  ) THEN
    RAISE EXCEPTION 'Anggota tidak terdaftar di RUKEM';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_santunan_trigger
  BEFORE INSERT ON public.santunan
  FOR EACH ROW EXECUTE FUNCTION public.validate_santunan();

-- Create indexes for better performance
CREATE INDEX idx_anggota_rt_rw ON public.anggota(rt, rw);
CREATE INDEX idx_anggota_nama ON public.anggota(nama_kepala_keluarga);
CREATE INDEX idx_keanggotaan_anggota ON public.keanggotaan_rukem(anggota_id);
CREATE INDEX idx_kematian_anggota ON public.kematian(anggota_id);
CREATE INDEX idx_santunan_anggota ON public.santunan(anggota_id);
CREATE INDEX idx_kas_tanggal ON public.kas_rukem(tanggal);