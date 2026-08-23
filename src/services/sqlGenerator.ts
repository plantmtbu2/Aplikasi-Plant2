export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- REPORTING PLANT2 - FULL SUPABASE POSTGRESQL DATABASE SCHEMA
-- Compatible with Supabase Cloud & Self-Hosted aaPanel / Docker
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Planner & Maintenance)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID,
    nrp VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Planner', 'Maintenance')),
    foto_profil TEXT DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    department VARCHAR(100) DEFAULT 'Plant 2 Heavy Equipment',
    shift VARCHAR(20) DEFAULT 'Day Shift',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CODE UNITS (Master Alat Berat)
CREATE TABLE IF NOT EXISTS public.code_units (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code_unit VARCHAR(50) NOT NULL UNIQUE,
    egi VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Rigid', 'Artic', 'Support', 'Excavator', 'Dozer', 'Grader')),
    lokasi VARCHAR(100) NOT NULL,
    current_hm NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Operating' CHECK (status IN ('Operating', 'Under Maintenance', 'Standby', 'Breakdown')),
    model VARCHAR(100) DEFAULT '',
    serial_number VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HM LOGS
CREATE TABLE IF NOT EXISTS public.hm_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code_unit VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    hm_start NUMERIC(10, 2) NOT NULL,
    hm_end NUMERIC(10, 2) NOT NULL,
    hm_diff NUMERIC(10, 2) DEFAULT 0,
    shift VARCHAR(20) DEFAULT 'Day',
    pic VARCHAR(150) NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BAP (Berita Acara Pemeriksaan)
CREATE TABLE IF NOT EXISTS public.baps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    code_unit VARCHAR(50) NOT NULL,
    hm NUMERIC(10, 2) NOT NULL,
    plan_action TEXT NOT NULL,
    durasi_perbaikan VARCHAR(50) NOT NULL,
    deskripsi_bap TEXT NOT NULL,
    lokasi_action_bap VARCHAR(150) NOT NULL,
    kebutuhan_part TEXT DEFAULT '',
    catatan TEXT DEFAULT '',
    foto TEXT DEFAULT '',
    mo VARCHAR(100) DEFAULT '',
    notif VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Draft', 'Open', 'Approved', 'Completed', 'Rejected')),
    pic VARCHAR(150) NOT NULL,
    approved_by VARCHAR(150) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DAILY RIGID INSPECTION
CREATE TABLE IF NOT EXISTS public.daily_rigid (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    planning VARCHAR(100) NOT NULL,
    inspection_type VARCHAR(50) NOT NULL,
    code_unit VARCHAR(50) NOT NULL,
    egi VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    finish_time TIME NOT NULL,
    total_hours NUMERIC(6, 2) NOT NULL,
    hm NUMERIC(10, 2) NOT NULL,
    
    -- Check items
    engine_oil_level VARCHAR(30) DEFAULT 'Normal',
    tm_oil_level VARCHAR(30) DEFAULT 'Normal',
    hyd_oil_level VARCHAR(30) DEFAULT 'Normal',
    v_belts VARCHAR(30) DEFAULT 'Normal',
    eg_oil_leakage VARCHAR(30) DEFAULT 'Normal',
    common_rail_connector VARCHAR(30) DEFAULT 'Normal',
    injector_tube VARCHAR(30) DEFAULT 'Normal',
    fm_radio VARCHAR(30) DEFAULT 'Normal',
    fatigue_warning VARCHAR(30) DEFAULT 'Normal',
    power_window VARCHAR(30) DEFAULT 'Normal',
    operator_seat VARCHAR(30) DEFAULT 'Normal',
    hand_rail VARCHAR(30) DEFAULT 'Normal',
    common_rail_pressure_on VARCHAR(30) DEFAULT 'Normal',
    power_supplay_voltage_on VARCHAR(30) DEFAULT 'Normal',
    susp_pressure_fl VARCHAR(30) DEFAULT 'Normal',
    susp_pressure_fr VARCHAR(30) DEFAULT 'Normal',
    susp_pressure_rl VARCHAR(30) DEFAULT 'Normal',
    susp_pressure_rr VARCHAR(30) DEFAULT 'Normal',
    tyre_condition VARCHAR(30) DEFAULT 'Normal',
    
    deviation TEXT DEFAULT '',
    pic VARCHAR(150) NOT NULL,
    foto1 TEXT DEFAULT '',
    foto2 TEXT DEFAULT '',
    foto3 TEXT DEFAULT '',
    foto4 TEXT DEFAULT '',
    status VARCHAR(30) DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Revision')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DAILY ARTIC INSPECTION (40+ items)
CREATE TABLE IF NOT EXISTS public.daily_artic (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    planning VARCHAR(100) NOT NULL,
    inspection_type VARCHAR(50) NOT NULL,
    code_unit VARCHAR(50) NOT NULL,
    egi VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    finish_time TIME NOT NULL,
    total_hours NUMERIC(6, 2) NOT NULL,
    hm NUMERIC(10, 2) NOT NULL,

    air_pressure VARCHAR(30) DEFAULT 'Normal',
    lock_door VARCHAR(30) DEFAULT 'Normal',
    wiper VARCHAR(30) DEFAULT 'Normal',
    lever_hyd_cv VARCHAR(30) DEFAULT 'Normal',
    grease_fitting VARCHAR(30) DEFAULT 'Normal',
    pin_lock_artic VARCHAR(30) DEFAULT 'Normal',
    artic_frame_lubrication VARCHAR(30) DEFAULT 'Normal',
    pinion_segment_circle VARCHAR(30) DEFAULT 'Normal',
    spacer_wear_plate_circle VARCHAR(30) DEFAULT 'Normal',
    circle_motor VARCHAR(30) DEFAULT 'Normal',
    guide_blade VARCHAR(30) DEFAULT 'Normal',
    rotary_lamp VARCHAR(30) DEFAULT 'Normal',
    radio VARCHAR(30) DEFAULT 'Normal',
    loto VARCHAR(30) DEFAULT 'Normal',
    work_lamp VARCHAR(30) DEFAULT 'Normal',
    battery VARCHAR(30) DEFAULT 'Normal',
    pdu VARCHAR(30) DEFAULT 'Normal',
    radiator VARCHAR(30) DEFAULT 'Normal',
    eg_oil_level VARCHAR(30) DEFAULT 'Normal',
    fuel_wiggins_pressureless_system VARCHAR(30) DEFAULT 'Normal',
    vbelt_ac VARCHAR(30) DEFAULT 'Normal',
    tm_oil_level VARCHAR(30) DEFAULT 'Normal',
    spider_joint VARCHAR(30) DEFAULT 'Normal',
    hyd_oil_level VARCHAR(30) DEFAULT 'Normal',
    hyd_oil_leaks VARCHAR(30) DEFAULT 'Normal',
    lh_steering_cylinder VARCHAR(30) DEFAULT 'Normal',
    rh_steering_cylinder VARCHAR(30) DEFAULT 'Normal',
    leaning_cylinder VARCHAR(30) DEFAULT 'Normal',
    blade_side_shift_cylinder VARCHAR(30) DEFAULT 'Normal',
    power_tilt_cylinder VARCHAR(30) DEFAULT 'Normal',
    drawbar_cylinder VARCHAR(30) DEFAULT 'Normal',
    lh_lift_cylinder VARCHAR(30) DEFAULT 'Normal',
    rh_lift_cylinder VARCHAR(30) DEFAULT 'Normal',
    lh_artic_cylinder VARCHAR(30) DEFAULT 'Normal',
    rh_artic_cylinder VARCHAR(30) DEFAULT 'Normal',
    ripper_cylinder VARCHAR(30) DEFAULT 'Normal',

    pic VARCHAR(150) NOT NULL,
    deviation TEXT DEFAULT '',
    foto1 TEXT DEFAULT '',
    foto2 TEXT DEFAULT '',
    foto3 TEXT DEFAULT '',
    foto4 TEXT DEFAULT '',
    status VARCHAR(30) DEFAULT 'Submitted' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Revision')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AKTIVITAS
CREATE TABLE IF NOT EXISTS public.aktivitas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    code_unit VARCHAR(50) NOT NULL,
    hm NUMERIC(10, 2) NOT NULL,
    deskripsi_aktivitas TEXT NOT NULL,
    catatan TEXT DEFAULT '',
    foto TEXT DEFAULT '',
    pic VARCHAR(150) NOT NULL,
    plan_daily_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BACKLOG & SPARE PARTS
CREATE TABLE IF NOT EXISTS public.backlogs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    code_unit VARCHAR(50) NOT NULL,
    mo_backlog VARCHAR(100) NOT NULL,
    reservasi VARCHAR(100) NOT NULL,
    backlog_description TEXT NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    part_description VARCHAR(200) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Waiting Part', 'Closed')),
    priority VARCHAR(30) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    pic VARCHAR(150) NOT NULL,
    parts_list JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_code_units_status ON public.code_units(status);
CREATE INDEX IF NOT EXISTS idx_baps_unit ON public.baps(code_unit);
CREATE INDEX IF NOT EXISTS idx_baps_status ON public.baps(status);
CREATE INDEX IF NOT EXISTS idx_daily_rigid_date ON public.daily_rigid(date);
CREATE INDEX IF NOT EXISTS idx_daily_artic_date ON public.daily_artic(date);
CREATE INDEX IF NOT EXISTS idx_backlogs_status ON public.backlogs(status);
CREATE INDEX IF NOT EXISTS idx_aktivitas_unit ON public.aktivitas(code_unit);

-- ROW LEVEL SECURITY (RLS) - PERMISSIVE PUBLIC ACCESS (ANON & AUTHENTICATED)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hm_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rigid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_artic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlogs ENABLE ROW LEVEL SECURITY;

-- Grant access on all tables to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public access on profiles" ON public.profiles;
CREATE POLICY "Public access on profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on code_units" ON public.code_units;
CREATE POLICY "Public access on code_units" ON public.code_units FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on hm_logs" ON public.hm_logs;
CREATE POLICY "Public access on hm_logs" ON public.hm_logs FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on baps" ON public.baps;
CREATE POLICY "Public access on baps" ON public.baps FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on daily_rigid" ON public.daily_rigid;
CREATE POLICY "Public access on daily_rigid" ON public.daily_rigid FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on daily_artic" ON public.daily_artic;
CREATE POLICY "Public access on daily_artic" ON public.daily_artic FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on aktivitas" ON public.aktivitas;
CREATE POLICY "Public access on aktivitas" ON public.aktivitas FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on backlogs" ON public.backlogs;
CREATE POLICY "Public access on backlogs" ON public.backlogs FOR ALL TO public USING (true) WITH CHECK (true);

-- SEED DATA (INITIAL DATA FOR SEEDING)
INSERT INTO public.code_units (id, code_unit, egi, type, lokasi, current_hm, status, model, serial_number)
VALUES 
('u1', 'RD-777D-01', 'CAT 777D', 'Rigid', 'Pit North Block 4', 12450.5, 'Operating', 'Caterpillar 777D Off-Highway Truck', '777D-SN09812'),
('u2', 'RD-777D-02', 'CAT 777D', 'Rigid', 'Pit South Block 1', 14890.0, 'Operating', 'Caterpillar 777D Off-Highway Truck', '777D-SN09813'),
('u3', 'RD-785C-01', 'CAT 785C', 'Rigid', 'Workshop Bay 2', 18320.2, 'Under Maintenance', 'Caterpillar 785C Mining Dump', '785C-SN11450'),
('u4', 'AT-740B-01', 'CAT 740B', 'Artic', 'Disposal East Area', 8920.0, 'Operating', 'Caterpillar 740B Articulated Truck', '740B-SN3321'),
('u5', 'AT-745C-02', 'CAT 745C', 'Artic', 'Workshop Bay 4', 6540.8, 'Under Maintenance', 'Caterpillar 745C Articulated Hauler', '745C-SN5589'),
('u6', 'MG-24M-01', 'CAT 24M', 'Support', 'Haul Road Section C', 11200.0, 'Operating', 'Motor Grader CAT 24M', '24M-SN9910'),
('u7', 'DZ-D10T-01', 'CAT D10T', 'Support', 'Stockpile Area A', 15400.0, 'Standby', 'Track-Type Tractor D10T', 'D10T-SN8821')
ON CONFLICT (code_unit) DO UPDATE SET 
    egi = EXCLUDED.egi,
    type = EXCLUDED.type,
    lokasi = EXCLUDED.lokasi,
    current_hm = EXCLUDED.current_hm,
    status = EXCLUDED.status,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number;

INSERT INTO public.profiles (id, nrp, nama, email, role, foto_profil, department, shift)
VALUES
('p1', 'PLN-88001', 'Budi Santoso, S.T.', 'planner@plant2.com', 'Planner', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Plant & Maintenance Planning Dept', 'Day Shift'),
('p2', 'MTC-99002', 'Agus Hendrawan', 'maintenance@plant2.com', 'Maintenance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Field Heavy Equipment Maintenance', 'Day Shift')
ON CONFLICT (nrp) DO NOTHING;
`;

export const SUPABASE_RLS_AND_SCHEMA_FIX_SQL = `-- =========================================================================
-- SQL QUICK FIX: REPAIR RLS POLICIES & CONSTRAINTS ON EXISTING SUPABASE DB
-- Jalankan skrip ini jika tabel sudah pernah dibuat sebelumnya
-- =========================================================================

-- 1. Ubah tipe ID menjadi TEXT jika sebelumnya UUID agar kompatibel dengan string ID
ALTER TABLE IF EXISTS public.code_units ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.hm_logs ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.baps ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.daily_rigid ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.daily_artic ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.aktivitas ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS public.backlogs ALTER COLUMN id TYPE TEXT;

-- 2. Pastikan kolom-kolom baru tersedia jika tabel dibuat di versi lama
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS foto_profil TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT '';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS shift VARCHAR(50) DEFAULT 'Day Shift';
ALTER TABLE IF EXISTS public.hm_logs DROP COLUMN IF EXISTS hm_diff;
ALTER TABLE IF EXISTS public.hm_logs ADD COLUMN IF NOT EXISTS hm_diff NUMERIC(10, 2) DEFAULT 0;

-- 3. Hapus policy lama yang membatasi akses
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON public.code_units;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.code_units;
DROP POLICY IF EXISTS "Enable all for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for baps" ON public.baps;
DROP POLICY IF EXISTS "Enable all for daily_rigid" ON public.daily_rigid;
DROP POLICY IF EXISTS "Enable all for daily_artic" ON public.daily_artic;
DROP POLICY IF EXISTS "Enable all for aktivitas" ON public.aktivitas;
DROP POLICY IF EXISTS "Enable all for backlogs" ON public.backlogs;
DROP POLICY IF EXISTS "Enable all for hm_logs" ON public.hm_logs;
DROP POLICY IF EXISTS "Enable all for code_units" ON public.code_units;

-- 4. Buka akses RLS secara penuh untuk Publik / Anon & Authenticated
DROP POLICY IF EXISTS "Public access on profiles" ON public.profiles;
CREATE POLICY "Public access on profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on code_units" ON public.code_units;
CREATE POLICY "Public access on code_units" ON public.code_units FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on hm_logs" ON public.hm_logs;
CREATE POLICY "Public access on hm_logs" ON public.hm_logs FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on baps" ON public.baps;
CREATE POLICY "Public access on baps" ON public.baps FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on daily_rigid" ON public.daily_rigid;
CREATE POLICY "Public access on daily_rigid" ON public.daily_rigid FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on daily_artic" ON public.daily_artic;
CREATE POLICY "Public access on daily_artic" ON public.daily_artic FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on aktivitas" ON public.aktivitas;
CREATE POLICY "Public access on aktivitas" ON public.aktivitas FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on backlogs" ON public.backlogs;
CREATE POLICY "Public access on backlogs" ON public.backlogs FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Berikan Hak Akses Public (Anon & Authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
`;

export function getSupabaseSchemaSql(): string {
  return SUPABASE_SQL_SCHEMA;
}

export function getSupabaseFixSql(): string {
  return SUPABASE_RLS_AND_SCHEMA_FIX_SQL;
}
