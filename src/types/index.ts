export type Role = 'Planner' | 'Maintenance';
export type UserRole = Role;

export interface UserProfile {
  id: string;
  nrp: string;
  nama: string;
  email: string;
  role: Role;
  foto_profil: string;
  foto?: string;
  phone?: string;
  department?: string;
  shift?: string;
  created_at?: string;
}

export interface CodeUnit {
  id: string;
  code_unit: string;
  egi: string;
  type: 'Rigid' | 'Artic' | 'Support' | 'Excavator' | 'Dozer' | 'Grader';
  lokasi: string;
  current_hm: number;
  status: 'Operating' | 'Under Maintenance' | 'Standby' | 'Breakdown';
  model?: string;
  serial_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HmLog {
  id: string;
  code_unit: string;
  date: string;
  hm_start: number;
  hm_end: number;
  hm_diff: number;
  shift: 'Day' | 'Night';
  pic: string;
  notes?: string;
  created_at: string;
}

export interface BacklogPart {
  id?: string;
  part_number: string;
  part_description: string;
  qty: number;
  unit: string;
  status?: 'Available' | 'Ordered' | 'Backorder';
}

export interface Backlog {
  id: string;
  timestamp: string;
  code_unit: string;
  mo_backlog: string;
  reservasi: string;
  backlog_description: string;
  part_number: string;
  part_description: string;
  qty: number;
  status: 'Open' | 'In Progress' | 'Waiting Part' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  pic: string;
  parts_list?: BacklogPart[];
  created_at: string;
}

export interface Aktivitas {
  id: string;
  timestamp: string;
  code_unit: string;
  hm: number;
  deskripsi_aktivitas: string;
  catatan: string;
  foto: string;
  pic: string;
  plan_daily_id?: string;
  created_at: string;
}

export interface Bap {
  id: string;
  timestamp: string;
  code_unit: string;
  hm: number;
  plan_action: string;
  durasi_perbaikan: string; // e.g. "4 Jam" / "2.5 Hours"
  deskripsi_bap: string;
  lokasi_action_bap: string;
  kebutuhan_part: string;
  catatan: string;
  foto: string;
  mo: string;
  notif: string;
  status: 'Draft' | 'Open' | 'Approved' | 'Completed' | 'Rejected';
  pic: string;
  approved_by?: string;
  created_at: string;
}

export type InspectionStatus = 'Normal' | 'Abnormal' | 'Action Needed' | 'N/A';

export interface DailyRigid {
  id: string;
  timestamp: string;
  planning: string;
  inspection_type: 'P1 (Daily)' | 'P2 (Weekly)' | 'P3 (Monthly)' | 'Pre-Shift' | 'Post-Shift';
  code_unit: string;
  egi: string;
  date: string;
  start_time: string;
  finish_time: string;
  total_hours: number;
  hm: number;
  
  // Inspection Checklist Items
  engine_oil_level: InspectionStatus;
  tm_oil_level: InspectionStatus;
  hyd_oil_level: InspectionStatus;
  v_belts: InspectionStatus;
  eg_oil_leakage: InspectionStatus;
  common_rail_connector: InspectionStatus;
  injector_tube: InspectionStatus;
  fm_radio: InspectionStatus;
  fatigue_warning: InspectionStatus;
  power_window: InspectionStatus;
  operator_seat: InspectionStatus;
  hand_rail: InspectionStatus;
  common_rail_pressure_on: InspectionStatus;
  power_supplay_voltage_on: InspectionStatus;
  susp_pressure_fl: InspectionStatus;
  susp_pressure_fr: InspectionStatus;
  susp_pressure_rl: InspectionStatus;
  susp_pressure_rr: InspectionStatus;
  tyre_condition: InspectionStatus;
  
  deviation: string;
  pic: string;
  foto1: string;
  foto2: string;
  foto3: string;
  foto4: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Revision';
  
  aktivitas_list?: Aktivitas[];
  backlog_list?: Backlog[];
  created_at: string;
}

export interface DailyArtic {
  id: string;
  timestamp: string;
  planning: string;
  inspection_type: 'P1 (Daily)' | 'P2 (Weekly)' | 'P3 (Monthly)' | 'Pre-Shift' | 'Post-Shift';
  code_unit: string;
  egi: string;
  date: string;
  start_time: string;
  finish_time: string;
  total_hours: number;
  hm: number;

  // Artic Specific Checklist Items (40+ items)
  air_pressure: InspectionStatus;
  lock_door: InspectionStatus;
  wiper: InspectionStatus;
  lever_hyd_cv: InspectionStatus;
  grease_fitting: InspectionStatus;
  pin_lock_artic: InspectionStatus;
  artic_frame_lubrication: InspectionStatus;
  pinion_segment_circle: InspectionStatus;
  spacer_wear_plate_circle: InspectionStatus;
  circle_motor: InspectionStatus;
  guide_blade: InspectionStatus;
  rotary_lamp: InspectionStatus;
  radio: InspectionStatus;
  loto: InspectionStatus;
  work_lamp: InspectionStatus;
  battery: InspectionStatus;
  pdu: InspectionStatus;
  radiator: InspectionStatus;
  eg_oil_level: InspectionStatus;
  fuel_wiggins_pressureless_system: InspectionStatus;
  vbelt_ac: InspectionStatus;
  tm_oil_level: InspectionStatus;
  spider_joint: InspectionStatus;
  hyd_oil_level: InspectionStatus;
  hyd_oil_leaks: InspectionStatus;
  lh_steering_cylinder: InspectionStatus;
  rh_steering_cylinder: InspectionStatus;
  leaning_cylinder: InspectionStatus;
  blade_side_shift_cylinder: InspectionStatus;
  power_tilt_cylinder: InspectionStatus;
  drawbar_cylinder: InspectionStatus;
  lh_lift_cylinder: InspectionStatus;
  rh_lift_cylinder: InspectionStatus;
  lh_artic_cylinder: InspectionStatus;
  rh_artic_cylinder: InspectionStatus;
  ripper_cylinder: InspectionStatus;

  pic: string;
  deviation: string;
  foto1: string;
  foto2: string;
  foto3: string;
  foto4: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Revision';

  aktivitas_list?: Aktivitas[];
  backlog_list?: Backlog[];
  created_at: string;
}

export interface AchievementData {
  date: string;
  month: string;
  target: number;
  actual_rigid: number;
  actual_artic: number;
  total_actual: number;
  percentage: number;
}
