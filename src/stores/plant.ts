import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CodeUnit, HmLog, Backlog, Aktivitas, Bap, DailyRigid, DailyArtic, AchievementData } from '../types';
import { getSupabase } from '../services/supabase';
import { useAuthStore } from './auth';
import Swal from 'sweetalert2';

export const usePlantStore = defineStore('plant', () => {
  // --- INITIAL SEED DATA ---
  const initialUnits: CodeUnit[] = [
    { id: 'u1', code_unit: 'RD-777D-01', egi: 'CAT 777D', type: 'Rigid', lokasi: 'Pit North Block 4', current_hm: 12450.5, status: 'Operating', model: 'CAT 777D Off-Highway Truck', serial_number: '777D-SN09812' },
    { id: 'u2', code_unit: 'RD-777D-02', egi: 'CAT 777D', type: 'Rigid', lokasi: 'Pit South Block 1', current_hm: 14890.0, status: 'Operating', model: 'CAT 777D Off-Highway Truck', serial_number: '777D-SN09813' },
    { id: 'u3', code_unit: 'RD-785C-01', egi: 'CAT 785C', type: 'Rigid', lokasi: 'Workshop Bay 2', current_hm: 18320.2, status: 'Under Maintenance', model: 'CAT 785C Mining Dump', serial_number: '785C-SN11450' },
    { id: 'u4', code_unit: 'AT-740B-01', egi: 'CAT 740B', type: 'Artic', lokasi: 'Disposal East Area', current_hm: 8920.0, status: 'Operating', model: 'CAT 740B Articulated Hauler', serial_number: '740B-SN3321' },
    { id: 'u5', code_unit: 'AT-745C-02', egi: 'CAT 745C', type: 'Artic', lokasi: 'Workshop Bay 4', current_hm: 6540.8, status: 'Under Maintenance', model: 'CAT 745C Articulated Hauler', serial_number: '745C-SN5589' },
    { id: 'u6', code_unit: 'MG-24M-01', egi: 'CAT 24M', type: 'Support', lokasi: 'Haul Road Section C', current_hm: 11200.0, status: 'Operating', model: 'Motor Grader CAT 24M', serial_number: '24M-SN9910' },
    { id: 'u7', code_unit: 'DZ-D10T-01', egi: 'CAT D10T', type: 'Support', lokasi: 'Stockpile Area A', current_hm: 15400.0, status: 'Standby', model: 'Track-Type Tractor D10T', serial_number: 'D10T-SN8821' }
  ];

  const initialBaps: Bap[] = [
    {
      id: 'bap-01',
      timestamp: '2025-02-23 08:30',
      code_unit: 'RD-785C-01',
      hm: 18320.2,
      plan_action: 'Troubleshoot & Replace Main Hydraulic Pump Seal Kit & Flushing',
      durasi_perbaikan: '4.5 Jam',
      deskripsi_bap: 'Ditemukan rembesan oli hidrolik berlebih pada area main pump discharge flange saat unit beroperasi di Pit South.',
      lokasi_action_bap: 'Workshop Plant 2 Bay 2',
      kebutuhan_part: '1x Seal Kit Main Pump (P/N: 295-4412), 2x O-Ring Flange (P/N: 1J-9671), 40L Hydraulic Oil Tellus S2 V46',
      catatan: 'Prioritas perbaikan tinggi untuk mencegah kontaminasi sistem hidrolik utama.',
      foto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      mo: 'MO-2025-0891',
      notif: 'NOTIF-PLN-5541',
      status: 'Open',
      pic: 'Agus Hendrawan',
      approved_by: 'Budi Santoso, S.T.',
      created_at: '2025-02-23 08:30:00'
    },
    {
      id: 'bap-02',
      timestamp: '2025-02-22 14:15',
      code_unit: 'AT-745C-02',
      hm: 6540.8,
      plan_action: 'Pergantian Center Articulation Bearing & Shim Adjustment',
      durasi_perbaikan: '6 Jam',
      deskripsi_bap: 'Terdengar knocking sound abnormal pada sambungan artikulasi tengah saat unit bermanuver muatan penuh.',
      lokasi_action_bap: 'Workshop Plant 2 Bay 4',
      kebutuhan_part: '1 Set Spherical Bearing (P/N: 334-9018), 4x Shim Plate 0.5mm, 1 Tube Heavy Duty Grease EP2',
      catatan: 'LOTO telah dipasang. Menunggu kedatangan part dari Central Warehouse.',
      foto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
      mo: 'MO-2025-0844',
      notif: 'NOTIF-PLN-5512',
      status: 'Approved',
      pic: 'Dedi Kurniawan',
      approved_by: 'Budi Santoso, S.T.',
      created_at: '2025-02-22 14:15:00'
    },
    {
      id: 'bap-03',
      timestamp: '2025-02-21 10:00',
      code_unit: 'RD-777D-01',
      hm: 12400.0,
      plan_action: 'Perbaikan Common Rail Pressure Sensor Harness',
      durasi_perbaikan: '2 Jam',
      deskripsi_bap: 'Lampu check engine menyala intermiten, kode error 100-3 Engine Oil Pressure Open Circuit.',
      lokasi_action_bap: 'Pit North Laydown',
      kebutuhan_part: '1x Harness Connector 3-Pin Deutsch, Wiring Repair Kit',
      catatan: 'Unit telah selesai diperbaiki dan kembali beroperasi normal.',
      foto: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      mo: 'MO-2025-0799',
      notif: 'NOTIF-PLN-5480',
      status: 'Completed',
      pic: 'Agus Hendrawan',
      approved_by: 'Budi Santoso, S.T.',
      created_at: '2025-02-21 10:00:00'
    }
  ];

  const initialDailyRigid: DailyRigid[] = [
    {
      id: 'dr-01',
      timestamp: '2025-02-23 07:00',
      planning: 'Scheduled P1 Daily Inspection & Greasing Shift 1',
      inspection_type: 'P1 (Daily)',
      code_unit: 'RD-777D-01',
      egi: 'CAT 777D',
      date: '2025-02-23',
      start_time: '07:00',
      finish_time: '08:30',
      total_hours: 1.5,
      hm: 12450.5,
      engine_oil_level: 'Normal',
      tm_oil_level: 'Normal',
      hyd_oil_level: 'Normal',
      v_belts: 'Normal',
      eg_oil_leakage: 'Normal',
      common_rail_connector: 'Normal',
      injector_tube: 'Normal',
      fm_radio: 'Normal',
      fatigue_warning: 'Normal',
      power_window: 'Normal',
      operator_seat: 'Normal',
      hand_rail: 'Normal',
      common_rail_pressure_on: 'Normal',
      power_supplay_voltage_on: 'Normal',
      susp_pressure_fl: 'Normal',
      susp_pressure_fr: 'Normal',
      susp_pressure_rl: 'Normal',
      susp_pressure_rr: 'Normal',
      tyre_condition: 'Normal',
      deviation: 'Semua parameter inspeksi dalam batas spesifikasi standar OEM CAT.',
      pic: 'Agus Hendrawan',
      foto1: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      foto2: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
      foto3: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      foto4: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      status: 'Approved',
      created_at: '2025-02-23 07:00:00'
    },
    {
      id: 'dr-02',
      timestamp: '2025-02-23 07:15',
      planning: 'P1 Daily Shift 1 & Suspension Pressure Check',
      inspection_type: 'P1 (Daily)',
      code_unit: 'RD-777D-02',
      egi: 'CAT 777D',
      date: '2025-02-23',
      start_time: '07:15',
      finish_time: '08:45',
      total_hours: 1.5,
      hm: 14890.0,
      engine_oil_level: 'Normal',
      tm_oil_level: 'Normal',
      hyd_oil_level: 'Normal',
      v_belts: 'Action Needed',
      eg_oil_leakage: 'Normal',
      common_rail_connector: 'Normal',
      injector_tube: 'Normal',
      fm_radio: 'Normal',
      fatigue_warning: 'Normal',
      power_window: 'Normal',
      operator_seat: 'Normal',
      hand_rail: 'Normal',
      common_rail_pressure_on: 'Normal',
      power_supplay_voltage_on: 'Normal',
      susp_pressure_fl: 'Normal',
      susp_pressure_fr: 'Normal',
      susp_pressure_rl: 'Normal',
      susp_pressure_rr: 'Normal',
      tyre_condition: 'Normal',
      deviation: 'V-Belt alternator sedikit kendor (tegangan defleksi >15mm). Perlu penyetelan tensioner pada next service.',
      pic: 'Dedi Kurniawan',
      foto1: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      foto2: '',
      foto3: '',
      foto4: '',
      status: 'Submitted',
      created_at: '2025-02-23 07:15:00'
    }
  ];

  const initialDailyArtic: DailyArtic[] = [
    {
      id: 'da-01',
      timestamp: '2025-02-23 07:30',
      planning: 'Articulated Hauler 40-Point Daily Inspection Shift 1',
      inspection_type: 'P1 (Daily)',
      code_unit: 'AT-740B-01',
      egi: 'CAT 740B',
      date: '2025-02-23',
      start_time: '07:30',
      finish_time: '09:00',
      total_hours: 1.5,
      hm: 8920.0,
      air_pressure: 'Normal',
      lock_door: 'Normal',
      wiper: 'Normal',
      lever_hyd_cv: 'Normal',
      grease_fitting: 'Normal',
      pin_lock_artic: 'Normal',
      artic_frame_lubrication: 'Normal',
      pinion_segment_circle: 'Normal',
      spacer_wear_plate_circle: 'Normal',
      circle_motor: 'Normal',
      guide_blade: 'Normal',
      rotary_lamp: 'Normal',
      radio: 'Normal',
      loto: 'Normal',
      work_lamp: 'Normal',
      battery: 'Normal',
      pdu: 'Normal',
      radiator: 'Normal',
      eg_oil_level: 'Normal',
      fuel_wiggins_pressureless_system: 'Normal',
      vbelt_ac: 'Normal',
      tm_oil_level: 'Normal',
      spider_joint: 'Normal',
      hyd_oil_level: 'Normal',
      hyd_oil_leaks: 'Normal',
      lh_steering_cylinder: 'Normal',
      rh_steering_cylinder: 'Normal',
      leaning_cylinder: 'Normal',
      blade_side_shift_cylinder: 'Normal',
      power_tilt_cylinder: 'Normal',
      drawbar_cylinder: 'Normal',
      lh_lift_cylinder: 'Normal',
      rh_lift_cylinder: 'Normal',
      lh_artic_cylinder: 'Normal',
      rh_artic_cylinder: 'Normal',
      ripper_cylinder: 'Normal',
      pic: 'Agus Hendrawan',
      deviation: 'Kondisi keseluruhan unit prima, greasing point terisi penuh.',
      foto1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
      foto2: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      foto3: '',
      foto4: '',
      status: 'Approved',
      created_at: '2025-02-23 07:30:00'
    }
  ];

  const initialBacklogs: Backlog[] = [
    {
      id: 'bk-01',
      timestamp: '2025-02-22 16:00',
      code_unit: 'RD-777D-02',
      mo_backlog: 'MO-BK-9901',
      reservasi: 'RES-8812',
      backlog_description: 'Penggantian V-Belt Alternator dan AC Compressor',
      part_number: '9L-6643 / 6N-6652',
      part_description: 'V-Belt Set Heavy Duty E/G 3508B',
      qty: 2,
      status: 'Waiting Part',
      priority: 'Medium',
      pic: 'Dedi Kurniawan',
      parts_list: [
        { part_number: '9L-6643', part_description: 'V-Belt Alternator', qty: 1, unit: 'PC', status: 'Ordered' },
        { part_number: '6N-6652', part_description: 'V-Belt AC Compressor', qty: 1, unit: 'PC', status: 'Available' }
      ],
      created_at: '2025-02-22 16:00:00'
    },
    {
      id: 'bk-02',
      timestamp: '2025-02-20 11:30',
      code_unit: 'RD-785C-01',
      mo_backlog: 'MO-BK-9850',
      reservasi: 'RES-8760',
      backlog_description: 'Penggantian Seal Kit Cylinder Hoist LH & RH',
      part_number: '235-9011',
      part_description: 'Hoist Cylinder Seal Kit Komplit',
      qty: 2,
      status: 'In Progress',
      priority: 'High',
      pic: 'Agus Hendrawan',
      parts_list: [
        { part_number: '235-9011', part_description: 'Hoist Cylinder Seal Kit', qty: 2, unit: 'SET', status: 'Available' }
      ],
      created_at: '2025-02-20 11:30:00'
    },
    {
      id: 'bk-03',
      timestamp: '2025-02-18 09:00',
      code_unit: 'MG-24M-01',
      mo_backlog: 'MO-BK-9721',
      reservasi: 'RES-8650',
      backlog_description: 'Penggantian Cutting Edge Blade & End Bit',
      part_number: '4T-6659 / 7D-2052',
      part_description: 'Cutting Edge Grader Blade 8ft Curved',
      qty: 4,
      status: 'Closed',
      priority: 'Low',
      pic: 'Budi Santoso, S.T.',
      parts_list: [
        { part_number: '4T-6659', part_description: 'Cutting Edge Grader', qty: 2, unit: 'PC', status: 'Available' },
        { part_number: '7D-2052', part_description: 'End Bit Overlay', qty: 2, unit: 'PC', status: 'Available' }
      ],
      created_at: '2025-02-18 09:00:00'
    }
  ];

  const initialAktivitas: Aktivitas[] = [
    {
      id: 'akt-01',
      timestamp: '2025-02-23 08:00',
      code_unit: 'RD-777D-01',
      hm: 12450.5,
      deskripsi_aktivitas: 'Pemeriksaan rutin level fluida & greasing automatic system',
      catatan: 'Tekanan greasing auto pump 2800 PSI, nozzle terisi merata ke seluruh pivot joint.',
      foto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      pic: 'Agus Hendrawan',
      created_at: '2025-02-23 08:00:00'
    },
    {
      id: 'akt-02',
      timestamp: '2025-02-23 09:30',
      code_unit: 'RD-785C-01',
      hm: 18320.2,
      deskripsi_aktivitas: 'Dismantling Main Hydraulic Pump untuk penggantian seal kit',
      catatan: 'Oil drain selesai 200 liter, flushing filter suction telah dibersihkan.',
      foto: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      pic: 'Agus Hendrawan',
      created_at: '2025-02-23 09:30:00'
    },
    {
      id: 'akt-03',
      timestamp: '2025-02-22 15:00',
      code_unit: 'AT-745C-02',
      hm: 6540.8,
      deskripsi_aktivitas: 'Inspeksi clearance articulation bearing menggunakan dial indicator',
      catatan: 'Clearance terukur 1.8mm (toleransi max 0.8mm), konfirmasi pembuatan BAP & Backlog.',
      foto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
      pic: 'Dedi Kurniawan',
      created_at: '2025-02-22 15:00:00'
    }
  ];

  const initialHmLogs: HmLog[] = [
    { id: 'hm-01', code_unit: 'RD-777D-01', date: '2025-02-23', hm_start: 12438.0, hm_end: 12450.5, hm_diff: 12.5, shift: 'Day', pic: 'Agus Hendrawan', notes: 'Operasi normal Pit North Block 4', created_at: '2025-02-23 17:00:00' },
    { id: 'hm-02', code_unit: 'RD-777D-02', date: '2025-02-23', hm_start: 14878.5, hm_end: 14890.0, hm_diff: 11.5, shift: 'Day', pic: 'Dedi Kurniawan', notes: 'Operasi Pit South Block 1', created_at: '2025-02-23 17:00:00' },
    { id: 'hm-03', code_unit: 'AT-740B-01', date: '2025-02-23', hm_start: 8908.0, hm_end: 8920.0, hm_diff: 12.0, shift: 'Day', pic: 'Agus Hendrawan', notes: 'Disposal East Area Hauling', created_at: '2025-02-23 17:00:00' }
  ];

  // --- REFS & LOCALSTORAGE PERSISTENCE ---
  const loadLocal = <T>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`reporting_plant2_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = <T>(key: string, data: T) => {
    try {
      localStorage.setItem(`reporting_plant2_${key}`, JSON.stringify(data));
    } catch (e: any) {
      console.warn(`LocalStorage save error for ${key}:`, e);
      // Quota exceeded recovery: clear legacy redundant keys and retry
      try {
        localStorage.removeItem('plant2_user');
        localStorage.removeItem('plant2_code_units');
        localStorage.removeItem('plant2_baps');
        localStorage.removeItem('plant2_daily_rigid');
        localStorage.removeItem('plant2_daily_artic');
        localStorage.removeItem('plant2_backlogs');
        localStorage.removeItem('plant2_aktivitas');
        localStorage.removeItem('plant2_hm_logs');
        localStorage.setItem(`reporting_plant2_${key}`, JSON.stringify(data));
      } catch (inner) {
        console.warn('LocalStorage secondary save failed:', inner);
      }
    }
  };

  const codeUnits = ref<CodeUnit[]>(loadLocal('code_units', initialUnits));
  const baps = ref<Bap[]>(loadLocal('baps', initialBaps));
  const dailyRigidList = ref<DailyRigid[]>(loadLocal('daily_rigid', initialDailyRigid));
  const dailyArticList = ref<DailyArtic[]>(loadLocal('daily_artic', initialDailyArtic));
  const backlogs = ref<Backlog[]>(loadLocal('backlogs', initialBacklogs));
  const aktivitasList = ref<Aktivitas[]>(loadLocal('aktivitas', initialAktivitas));
  const hmLogs = ref<HmLog[]>(loadLocal('hm_logs', initialHmLogs));

  // --- SYNC HELPER ---
  function persistAll() {
    saveLocal('code_units', codeUnits.value);
    saveLocal('baps', baps.value);
    saveLocal('daily_rigid', dailyRigidList.value);
    saveLocal('daily_artic', dailyArticList.value);
    saveLocal('backlogs', backlogs.value);
    saveLocal('aktivitas', aktivitasList.value);
    saveLocal('hm_logs', hmLogs.value);
  }

  // --- COMPUTED STATS ---
  const totalUnits = computed(() => codeUnits.value.length);
  const operatingUnits = computed(() => codeUnits.value.filter(u => u.status === 'Operating').length);
  const maintenanceUnits = computed(() => codeUnits.value.filter(u => u.status === 'Under Maintenance' || u.status === 'Breakdown').length);
  
  const totalBaps = computed(() => baps.value.length);
  const openBaps = computed(() => baps.value.filter(b => b.status === 'Open' || b.status === 'Draft').length);
  const approvedBaps = computed(() => baps.value.filter(b => b.status === 'Approved').length);
  const completedBaps = computed(() => baps.value.filter(b => b.status === 'Completed').length);

  const totalDailyPlanToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const rigidToday = dailyRigidList.value.filter(r => r.date === today).length;
    const articToday = dailyArticList.value.filter(a => a.date === today).length;
    return rigidToday + articToday;
  });

  const pendingBacklogs = computed(() => backlogs.value.filter(bk => bk.status !== 'Closed').length);

  // Daily Achievement Chart Data (7 Days)
  const achievementDailyData = computed((): AchievementData[] => {
    const days: AchievementData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });
      const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      const target = 10; // 10 units target per day
      const rigidCount = dailyRigidList.value.filter(r => r.date === dateStr).length || (i > 2 ? Math.floor(Math.random() * 3) + 4 : 2);
      const articCount = dailyArticList.value.filter(a => a.date === dateStr).length || (i > 2 ? Math.floor(Math.random() * 2) + 3 : 1);
      const total = rigidCount + articCount;
      const pct = Math.min(100, Math.round((total / target) * 100));

      days.push({
        date: dayLabel,
        month: monthStr,
        target,
        actual_rigid: rigidCount,
        actual_artic: articCount,
        total_actual: total,
        percentage: pct
      });
    }
    return days;
  });

  // Monthly Achievement Chart Data (6 Months)
  const achievementMonthlyData = computed((): AchievementData[] => {
    const months = ['Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'];
    const mockTargets = [280, 290, 300, 310, 300, 280];
    const mockRigid = [150, 165, 170, 182, 175, 160];
    const mockArtic = [110, 115, 118, 119, 115, 108];

    return months.map((m, idx) => {
      const target = mockTargets[idx];
      const actual_rigid = mockRigid[idx];
      const actual_artic = mockArtic[idx];
      const total = actual_rigid + actual_artic;
      const pct = Math.round((total / target) * 100);
      return {
        date: m,
        month: m,
        target,
        actual_rigid,
        actual_artic,
        total_actual: total,
        percentage: pct
      };
    });
  });

  // --- CRUD ACTIONS: CODE UNIT ---
  function addCodeUnit(unit: Omit<CodeUnit, 'id'>) {
    const newUnit: CodeUnit = {
      ...unit,
      id: 'u-' + Date.now(),
      created_at: new Date().toISOString()
    };
    codeUnits.value.unshift(newUnit);
    persistAll();
    
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('code_units').insert(newUnit).then(({ error }) => {
        if (error) {
          console.error('Supabase code_units insert error:', error);
          Swal.fire({
            icon: 'warning',
            title: 'Tersimpan Lokal (Supabase Notice)',
            html: `<small class="text-muted">Data tersimpan di browser, tetapi Supabase menolak:</small><br><code class="text-danger font-monospace text-xs">${error.message}</code><br><br><small>Pastikan Anda sudah menjalankan Skrip SQL Fix di menu Pengaturan.</small>`,
            confirmButtonText: 'OK'
          });
        }
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Unit Berhasil Ditambahkan',
      text: `Code Unit ${newUnit.code_unit} telah didaftarkan ke Master Data.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  function updateCodeUnit(id: string, data: Partial<CodeUnit>) {
    const index = codeUnits.value.findIndex(u => u.id === id);
    if (index !== -1) {
      codeUnits.value[index] = { ...codeUnits.value[index], ...data, updated_at: new Date().toISOString() };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('code_units').update(data).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase code_units update error:', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Unit Diperbarui',
        text: `Data ${codeUnits.value[index].code_unit} berhasil diperbarui.`,
        timer: 1800,
        showConfirmButton: false
      });
    }
  }

  function deleteCodeUnit(id: string) {
    const unit = codeUnits.value.find(u => u.id === id);
    if (!unit) return;

    Swal.fire({
      title: 'Hapus Unit?',
      text: `Apakah Anda yakin ingin menghapus Code Unit ${unit.code_unit}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        codeUnits.value = codeUnits.value.filter(u => u.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('code_units').delete().eq('id', id).then(({ error }) => {
            if (error) console.warn('Supabase code_units delete error:', error);
          });
        }
        Swal.fire('Terhapus!', 'Unit telah berhasil dihapus dari sistem.', 'success');
      }
    });
  }

  // Helper for reporting Supabase sync errors clearly to the user
  function handleSupabaseError(tableName: string, actionName: string, error: any) {
    if (!error) return;
    console.error(`Supabase [${tableName}] ${actionName} error:`, error);
    let extraAdvice = 'Jalankan skrip SQL Quick Fix di menu Pengaturan jika terjadi error RLS atau tipe kolom.';
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      extraAdvice = 'Error RLS (Hak Akses): Silakan buka menu <strong>Supabase & Setup</strong> lalu jalankan <strong>Skrip SQL Fix RLS</strong> di SQL Editor Supabase.';
    } else if (error.code === '22P02' || error.message?.includes('invalid input syntax')) {
      extraAdvice = 'Error Tipe Kolom: Tipe kolom ID di database perlu diubah ke TEXT menggunakan Skrip SQL Fix.';
    } else if (error.code === '428C9' || error.message?.includes('cannot insert a non-DEFAULT value')) {
      extraAdvice = 'Error Generated Column: Kolom hm_diff dihitung otomatis oleh Postgres.';
    }
    
    Swal.fire({
      icon: 'warning',
      title: `Sinkronisasi Supabase Gagal (${tableName})`,
      html: `
        <div class="text-start">
          <p class="mb-2">Data berhasil disimpan di browser (Offline/Lokal), tetapi gagal terkirim ke Supabase Cloud:</p>
          <div class="p-2 bg-light rounded text-danger font-monospace small mb-2" style="font-size: 0.8rem; word-break: break-all;">
            ${error.message || JSON.stringify(error)}
          </div>
          <p class="text-muted small mb-0">${extraAdvice}</p>
        </div>
      `,
      confirmButtonText: 'Tutup'
    });
  }

  // --- CRUD ACTIONS: HM LOGS ---
  function sanitizeHmLog(log: HmLog) {
    const { hm_diff, ...clean } = log as any;
    return clean;
  }

  function addHmLog(log: Omit<HmLog, 'id' | 'created_at'>) {
    const newLog: HmLog = {
      ...log,
      id: 'hm-' + Date.now(),
      created_at: new Date().toISOString()
    };
    hmLogs.value.unshift(newLog);
    // Update current_hm in code_units
    const unit = codeUnits.value.find(u => u.code_unit === log.code_unit);
    if (unit && log.hm_end > unit.current_hm) {
      unit.current_hm = log.hm_end;
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('code_units').update({ current_hm: log.hm_end }).eq('code_unit', log.code_unit).then(({ error }) => {
          if (error) console.warn('Supabase unit current_hm update error:', error);
        });
      }
    }
    persistAll();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('hm_logs').insert(sanitizeHmLog(newLog)).then(({ error }) => {
        if (error) handleSupabaseError('hm_logs', 'insert', error);
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'HM Log Disimpan',
      text: `HM Log ${log.code_unit} (${log.hm_start} -> ${log.hm_end}) tersimpan.`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  // --- CRUD ACTIONS: BAP ---
  function addBap(bapData: Omit<Bap, 'id' | 'created_at'>) {
    const newBap: Bap = {
      ...bapData,
      id: 'bap-' + Date.now(),
      created_at: new Date().toISOString()
    };
    baps.value.unshift(newBap);
    persistAll();
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('baps').insert(newBap).then(({ error }) => {
        if (error) handleSupabaseError('baps', 'insert', error);
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'BAP Berhasil Dibuat',
      text: `Berita Acara Pemeriksaan untuk ${newBap.code_unit} telah dicatat.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  function updateBap(id: string, data: Partial<Bap>) {
    const idx = baps.value.findIndex(b => b.id === id);
    if (idx !== -1) {
      baps.value[idx] = { ...baps.value[idx], ...data };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('baps').update(data).eq('id', id).then(({ error }) => {
          if (error) handleSupabaseError('baps', 'update', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'BAP Diperbarui',
        text: 'Perubahan data BAP berhasil disimpan.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  }

  function deleteBap(id: string) {
    Swal.fire({
      title: 'Hapus BAP?',
      text: 'Dokumen BAP yang dihapus tidak dapat dipulihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        baps.value = baps.value.filter(b => b.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('baps').delete().eq('id', id).then(({ error }) => {
            if (error) handleSupabaseError('baps', 'delete', error);
          });
        }
        Swal.fire('Terhapus!', 'Dokumen BAP berhasil dihapus.', 'success');
      }
    });
  }

  // --- CRUD ACTIONS: DAILY RIGID ---
  function sanitizeDailyRigid(item: DailyRigid) {
    const { aktivitas_list, backlog_list, ...clean } = item as any;
    return clean;
  }

  function addDailyRigid(item: Omit<DailyRigid, 'id' | 'created_at'>) {
    const newItem: DailyRigid = {
      ...item,
      id: 'dr-' + Date.now(),
      created_at: new Date().toISOString()
    };
    dailyRigidList.value.unshift(newItem);
    persistAll();
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('daily_rigid').insert(sanitizeDailyRigid(newItem)).then(({ error }) => {
        if (error) handleSupabaseError('daily_rigid', 'insert', error);
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Daily Rigid Tersimpan',
      text: `Inspeksi harian unit ${newItem.code_unit} berhasil disimpan.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  function updateDailyRigid(id: string, data: Partial<DailyRigid>) {
    const idx = dailyRigidList.value.findIndex(d => d.id === id);
    if (idx !== -1) {
      dailyRigidList.value[idx] = { ...dailyRigidList.value[idx], ...data };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        const { aktivitas_list, backlog_list, ...cleanData } = data as any;
        supabase.from('daily_rigid').update(cleanData).eq('id', id).then(({ error }) => {
          if (error) handleSupabaseError('daily_rigid', 'update', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Daily Rigid Diperbarui',
        timer: 1800,
        showConfirmButton: false
      });
    }
  }

  function deleteDailyRigid(id: string) {
    Swal.fire({
      title: 'Hapus Laporan Daily Rigid?',
      text: 'Laporan inspeksi ini akan dihapus dari sistem.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(r => {
      if (r.isConfirmed) {
        dailyRigidList.value = dailyRigidList.value.filter(d => d.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('daily_rigid').delete().eq('id', id).then(({ error }) => {
            if (error) handleSupabaseError('daily_rigid', 'delete', error);
          });
        }
        Swal.fire('Terhapus!', 'Laporan Daily Rigid telah dihapus.', 'success');
      }
    });
  }

  // --- CRUD ACTIONS: DAILY ARTIC ---
  function sanitizeDailyArtic(item: DailyArtic) {
    const { aktivitas_list, backlog_list, ...clean } = item as any;
    return clean;
  }

  function addDailyArtic(item: Omit<DailyArtic, 'id' | 'created_at'>) {
    const newItem: DailyArtic = {
      ...item,
      id: 'da-' + Date.now(),
      created_at: new Date().toISOString()
    };
    dailyArticList.value.unshift(newItem);
    persistAll();
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('daily_artic').insert(sanitizeDailyArtic(newItem)).then(({ error }) => {
        if (error) handleSupabaseError('daily_artic', 'insert', error);
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Daily Artic Tersimpan',
      text: `Inspeksi 40-point Artic untuk unit ${newItem.code_unit} berhasil disimpan.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  function updateDailyArtic(id: string, data: Partial<DailyArtic>) {
    const idx = dailyArticList.value.findIndex(d => d.id === id);
    if (idx !== -1) {
      dailyArticList.value[idx] = { ...dailyArticList.value[idx], ...data };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        const { aktivitas_list, backlog_list, ...cleanData } = data as any;
        supabase.from('daily_artic').update(cleanData).eq('id', id).then(({ error }) => {
          if (error) handleSupabaseError('daily_artic', 'update', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Daily Artic Diperbarui',
        timer: 1800,
        showConfirmButton: false
      });
    }
  }

  function deleteDailyArtic(id: string) {
    Swal.fire({
      title: 'Hapus Laporan Daily Artic?',
      text: 'Laporan inspeksi Artic ini akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(r => {
      if (r.isConfirmed) {
        dailyArticList.value = dailyArticList.value.filter(d => d.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('daily_artic').delete().eq('id', id).then(({ error }) => {
            if (error) handleSupabaseError('daily_artic', 'delete', error);
          });
        }
        Swal.fire('Terhapus!', 'Laporan Daily Artic telah dihapus.', 'success');
      }
    });
  }

  // --- CRUD ACTIONS: AKTIVITAS ---
  function addAktivitas(item: Omit<Aktivitas, 'id' | 'created_at'>) {
    const newItem: Aktivitas = {
      ...item,
      id: 'akt-' + Date.now(),
      created_at: new Date().toISOString()
    };
    aktivitasList.value.unshift(newItem);
    persistAll();
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('aktivitas').insert(newItem).then(({ error }) => {
        if (error) handleSupabaseError('aktivitas', 'insert', error);
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Aktivitas Dicatat',
      text: `Aktivitas ${newItem.code_unit} berhasil ditambahkan.`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  function updateAktivitas(id: string, data: Partial<Aktivitas>) {
    const idx = aktivitasList.value.findIndex(a => a.id === id);
    if (idx !== -1) {
      aktivitasList.value[idx] = { ...aktivitasList.value[idx], ...data };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('aktivitas').update(data).eq('id', id).then(({ error }) => {
          if (error) handleSupabaseError('aktivitas', 'update', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Aktivitas Diperbarui',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  function deleteAktivitas(id: string) {
    Swal.fire({
      title: 'Hapus Aktivitas?',
      text: 'Log aktivitas ini akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    }).then(r => {
      if (r.isConfirmed) {
        aktivitasList.value = aktivitasList.value.filter(a => a.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('aktivitas').delete().eq('id', id).then(({ error }) => {
            if (error) handleSupabaseError('aktivitas', 'delete', error);
          });
        }
        Swal.fire('Terhapus!', 'Log aktivitas berhasil dihapus.', 'success');
      }
    });
  }

  // --- CRUD ACTIONS: BACKLOG ---
  function addBacklog(item: Omit<Backlog, 'id' | 'created_at'>) {
    const newItem: Backlog = {
      ...item,
      id: 'bk-' + Date.now(),
      created_at: new Date().toISOString()
    };
    backlogs.value.unshift(newItem);
    persistAll();
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('backlogs').insert(newItem).then(({ error }) => {
        if (error) handleSupabaseError('backlogs', 'insert', error);
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Backlog Dicatat',
      text: `Backlog ${newItem.mo_backlog} untuk ${newItem.code_unit} berhasil ditambahkan.`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  function updateBacklog(id: string, data: Partial<Backlog>) {
    const idx = backlogs.value.findIndex(b => b.id === id);
    if (idx !== -1) {
      backlogs.value[idx] = { ...backlogs.value[idx], ...data };
      persistAll();
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('backlogs').update(data).eq('id', id).then(({ error }) => {
          if (error) handleSupabaseError('backlogs', 'update', error);
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Backlog Diperbarui',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  function deleteBacklog(id: string) {
    Swal.fire({
      title: 'Hapus Backlog?',
      text: 'Item backlog ini akan dihapus dari antrean perbaikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff3e1d',
      cancelButtonColor: '#8592a3',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal'
    }).then(r => {
      if (r.isConfirmed) {
        backlogs.value = backlogs.value.filter(b => b.id !== id);
        persistAll();
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('backlogs').delete().eq('id', id).then(({ error }) => {
            if (error) handleSupabaseError('backlogs', 'delete', error);
          });
        }
        Swal.fire('Terhapus!', 'Item backlog berhasil dihapus.', 'success');
      }
    });
  }

  // --- FETCH FROM SUPABASE IF CONNECTED ---
  async function fetchFromSupabase() {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const [uRes, bRes, rRes, aRes, bkRes, aktRes, hmRes] = await Promise.all([
        supabase.from('code_units').select('*'),
        supabase.from('baps').select('*'),
        supabase.from('daily_rigid').select('*'),
        supabase.from('daily_artic').select('*'),
        supabase.from('backlogs').select('*'),
        supabase.from('aktivitas').select('*'),
        supabase.from('hm_logs').select('*')
      ]);

      let hasSupabaseData = false;

      if (uRes.data && uRes.data.length > 0) {
        codeUnits.value = uRes.data;
        hasSupabaseData = true;
      }
      if (bRes.data && bRes.data.length > 0) {
        baps.value = bRes.data;
        hasSupabaseData = true;
      }
      if (rRes.data && rRes.data.length > 0) {
        dailyRigidList.value = rRes.data;
        hasSupabaseData = true;
      }
      if (aRes.data && aRes.data.length > 0) {
        dailyArticList.value = aRes.data;
        hasSupabaseData = true;
      }
      if (bkRes.data && bkRes.data.length > 0) {
        backlogs.value = bkRes.data;
        hasSupabaseData = true;
      }
      if (aktRes.data && aktRes.data.length > 0) {
        aktivitasList.value = aktRes.data;
        hasSupabaseData = true;
      }
      if (hmRes.data && hmRes.data.length > 0) {
        hmLogs.value = hmRes.data.map(l => ({
          ...l,
          hm_diff: l.hm_diff !== undefined && l.hm_diff !== null 
            ? Number(l.hm_diff) 
            : Number((Number(l.hm_end) - Number(l.hm_start)).toFixed(2))
        }));
        hasSupabaseData = true;
      }

      persistAll();
      return hasSupabaseData;
    } catch (e) {
      console.warn('Could not pull from Supabase tables:', e);
      return false;
    }
  }

  // --- SYNC LOCAL DATA TO SUPABASE (SEEDING / PUSH) ---
  async function pushAllDataToSupabase() {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase belum terkonfigurasi. Silakan simpan Project URL dan Anon Key di Pengaturan.');
    }

    // 0. User Profiles
    const authStore = useAuthStore();
    if (authStore.user) {
      try {
        await authStore.updateProfile(authStore.user);
      } catch (e) {
        console.warn('Sync profile warning:', e);
      }
    }

    // 1. Code Units
    if (codeUnits.value.length > 0) {
      const { error } = await supabase.from('code_units').upsert(codeUnits.value, { onConflict: 'code_unit' });
      if (error) {
        throw new Error(`Gagal menyimpan Master Unit (code_units): ${error.message} (Kode: ${error.code})`);
      }
    }

    // 2. BAPs
    if (baps.value.length > 0) {
      const { error } = await supabase.from('baps').upsert(baps.value, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan Berita Acara (baps): ${error.message} (Kode: ${error.code})`);
      }
    }

    // 3. Daily Rigid (sanitize virtual relations)
    if (dailyRigidList.value.length > 0) {
      const cleanRigid = dailyRigidList.value.map(sanitizeDailyRigid);
      const { error } = await supabase.from('daily_rigid').upsert(cleanRigid, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan Daily Rigid: ${error.message} (Kode: ${error.code})`);
      }
    }

    // 4. Daily Artic
    if (dailyArticList.value.length > 0) {
      const cleanArtic = dailyArticList.value.map(sanitizeDailyArtic);
      const { error } = await supabase.from('daily_artic').upsert(cleanArtic, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan Daily Artic: ${error.message} (Kode: ${error.code})`);
      }
    }

    // 5. Backlogs
    if (backlogs.value.length > 0) {
      const { error } = await supabase.from('backlogs').upsert(backlogs.value, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan Backlogs: ${error.message} (Kode: ${error.code})`);
      }
    }

    // 6. Aktivitas
    if (aktivitasList.value.length > 0) {
      const { error } = await supabase.from('aktivitas').upsert(aktivitasList.value, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan Aktivitas: ${error.message} (Kode: ${error.code})`);
      }
    }

    // 7. HM Logs (sanitize hm_diff if table has GENERATED column)
    if (hmLogs.value.length > 0) {
      const cleanLogs = hmLogs.value.map(sanitizeHmLog);
      const { error } = await supabase.from('hm_logs').upsert(cleanLogs, { onConflict: 'id' });
      if (error) {
        throw new Error(`Gagal menyimpan HM Logs: ${error.message} (Kode: ${error.code})`);
      }
    }

    return true;
  }

  async function initStore() {
    await fetchFromSupabase();
  }

  return {
    codeUnits,
    baps,
    dailyRigidList,
    dailyArticList,
    backlogs,
    aktivitasList,
    hmLogs,
    totalUnits,
    operatingUnits,
    maintenanceUnits,
    totalBaps,
    openBaps,
    approvedBaps,
    completedBaps,
    totalDailyPlanToday,
    pendingBacklogs,
    achievementDailyData,
    achievementMonthlyData,
    initStore,
    addCodeUnit,
    updateCodeUnit,
    deleteCodeUnit,
    addHmLog,
    addBap,
    updateBap,
    deleteBap,
    addDailyRigid,
    updateDailyRigid,
    deleteDailyRigid,
    addDailyArtic,
    updateDailyArtic,
    deleteDailyArtic,
    addAktivitas,
    updateAktivitas,
    deleteAktivitas,
    addBacklog,
    updateBacklog,
    deleteBacklog,
    fetchFromSupabase,
    pushAllDataToSupabase
  };
});
