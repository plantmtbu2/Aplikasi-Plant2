import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile, Role, UserRole } from '../types';
import { getSupabase } from '../services/supabase';
import { formatDirectImageUrl, DEFAULT_AVATARS, compressImage, generateSafeUUID } from '../services/imageHelper';
import Swal from 'sweetalert2';

const DEMO_PROFILES: Record<Role, UserProfile> = {
  Planner: {
    id: 'p1',
    nrp: 'PLN-88001',
    nama: 'Budi Santoso, S.T.',
    email: 'planner@plant2.com',
    role: 'Planner',
    foto_profil: DEFAULT_AVATARS.Planner,
    foto: DEFAULT_AVATARS.Planner,
    phone: '+62 812-3456-7890',
    department: 'Planning & Plant Reliability Dept',
    shift: 'Day Shift',
    created_at: '2025-01-10'
  },
  Maintenance: {
    id: 'p2',
    nrp: 'MTC-99002',
    nama: 'Agus Hendrawan',
    email: 'maintenance@plant2.com',
    role: 'Maintenance',
    foto_profil: DEFAULT_AVATARS.Maintenance,
    foto: DEFAULT_AVATARS.Maintenance,
    phone: '+62 813-9876-5432',
    department: 'Heavy Equipment Field Maintenance',
    shift: 'Day Shift',
    created_at: '2025-01-15'
  }
};

export const useAuthStore = defineStore('auth', () => {
  const savedUser = localStorage.getItem('reporting_plant2_user') || localStorage.getItem('plant2_user');
  const user = ref<UserProfile | null>(savedUser ? JSON.parse(savedUser) : DEMO_PROFILES.Planner);
  const isAuthenticated = ref<boolean>(!!user.value);
  const isDarkMode = ref<boolean>(localStorage.getItem('reporting_plant2_theme') === 'dark');

  const isPlanner = computed(() => user.value?.role === 'Planner');
  const isMaintenance = computed(() => user.value?.role === 'Maintenance');

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('reporting_plant2_theme', isDarkMode.value ? 'dark' : 'light');
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-style');
      document.documentElement.classList.remove('light-style');
      document.body.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-style');
      document.documentElement.classList.add('light-style');
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }

  function applyInitialTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-style');
      document.documentElement.classList.remove('light-style');
      document.body.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-style');
      document.documentElement.classList.add('light-style');
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }

  async function initAuth() {
    applyInitialTheme();
    
    // Check saved session in local storage
    const stored = localStorage.getItem('reporting_plant2_user') || localStorage.getItem('plant2_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          user.value = {
            ...parsed,
            foto_profil: formatDirectImageUrl(parsed.foto_profil || parsed.foto),
            foto: formatDirectImageUrl(parsed.foto_profil || parsed.foto)
          };
          isAuthenticated.value = true;
        }
      } catch (e) {
        console.warn('Failed to parse saved user in localStorage:', e);
      }
    }

    // Check Supabase profiles table if Supabase is connected
    const supabase = getSupabase();
    if (supabase) {
      try {
        // 1. If auth session exists
        const { data: authData } = await supabase.auth.getSession();
        const activeEmail = authData?.session?.user?.email || user.value?.email;

        if (activeEmail) {
          const { data: prof, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', activeEmail)
            .maybeSingle();

          if (!error && prof) {
            const cleanFoto = formatDirectImageUrl(prof.foto_profil) || (prof.role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance);
            user.value = {
              id: prof.id,
              nrp: prof.nrp,
              nama: prof.nama,
              email: prof.email,
              role: prof.role,
              foto_profil: cleanFoto,
              foto: cleanFoto,
              phone: prof.phone || '',
              department: prof.department || '',
              shift: prof.shift || 'Day Shift'
            };
            isAuthenticated.value = true;
            localStorage.setItem('reporting_plant2_user', JSON.stringify(user.value));
            localStorage.setItem('plant2_user', JSON.stringify(user.value));
          }
        }
      } catch (err) {
        console.warn('Supabase session check error in initAuth:', err);
      }
    }
  }

  async function login(email: string, pass: string, roleOrRemember: UserRole | boolean = true, rememberParam: boolean = true) {
    const remember = typeof roleOrRemember === 'boolean' ? roleOrRemember : rememberParam;
    const explicitRole = typeof roleOrRemember === 'string' ? roleOrRemember : undefined;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
        });
        if (error) {
          console.warn('Supabase Auth error, checking local profiles:', error.message);
        } else if (data?.user) {
          // Fetch profile from profiles table
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (prof) {
            const cleanFoto = formatDirectImageUrl(prof.foto_profil) || (prof.role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance);
            user.value = {
              id: prof.id,
              nrp: prof.nrp,
              nama: prof.nama,
              email: prof.email,
              role: prof.role,
              foto_profil: cleanFoto,
              foto: cleanFoto,
              phone: prof.phone || '',
              department: prof.department || '',
              shift: prof.shift || 'Day Shift'
            };
            isAuthenticated.value = true;
            if (remember) {
              localStorage.setItem('reporting_plant2_user', JSON.stringify(user.value));
              localStorage.setItem('plant2_user', JSON.stringify(user.value));
            }
            return true;
          }
        }
      } catch (err) {
        console.warn('Supabase connection error in login:', err);
      }
    }

    // Local / Demo Login Match
    const cleanEmail = email.toLowerCase().trim();
    if (explicitRole) {
      user.value = { ...DEMO_PROFILES[explicitRole] };
    } else if (cleanEmail.includes('planner') || cleanEmail === 'planner@plant2.com' || cleanEmail === 'admin@plant2.com') {
      user.value = { ...DEMO_PROFILES.Planner };
    } else {
      user.value = { ...DEMO_PROFILES.Maintenance };
    }

    isAuthenticated.value = true;
    if (remember) {
      localStorage.setItem('reporting_plant2_user', JSON.stringify(user.value));
      localStorage.setItem('plant2_user', JSON.stringify(user.value));
    }
    return true;
  }

  async function switchRole(role: Role) {
    user.value = { ...DEMO_PROFILES[role] };
    isAuthenticated.value = true;
    localStorage.setItem('reporting_plant2_user', JSON.stringify(user.value));
    localStorage.setItem('plant2_user', JSON.stringify(user.value));

    // Try to fetch specific profile from Supabase if present
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', role)
          .maybeSingle();

        if (prof) {
          const cleanFoto = formatDirectImageUrl(prof.foto_profil) || (role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance);
          user.value = {
            id: prof.id,
            nrp: prof.nrp,
            nama: prof.nama,
            email: prof.email,
            role: prof.role,
            foto_profil: cleanFoto,
            foto: cleanFoto,
            phone: prof.phone || '',
            department: prof.department || '',
            shift: prof.shift || 'Day Shift'
          };
          localStorage.setItem('reporting_plant2_user', JSON.stringify(user.value));
          localStorage.setItem('plant2_user', JSON.stringify(user.value));
        }
      } catch (e) {
        console.warn('Could not fetch role profile from Supabase:', e);
      }
    }
  }

  function safeSaveUserLocally(userData: UserProfile) {
    try {
      localStorage.setItem('reporting_plant2_user', JSON.stringify(userData));
      localStorage.setItem('plant2_user', JSON.stringify(userData));
    } catch (e: any) {
      console.warn('LocalStorage quota exceeded or write failed:', e);
      // Attempt recovery: Remove redundant legacy keys if quota was exceeded
      try {
        localStorage.removeItem('plant2_user');
        // If userData has a massive base64, create a lightweight version without base64 for local storage
        const lightweight = {
          ...userData,
          foto_profil: userData.foto_profil?.startsWith('data:') 
            ? (userData.role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance) 
            : userData.foto_profil,
          foto: userData.foto?.startsWith('data:') 
            ? (userData.role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance) 
            : userData.foto
        };
        localStorage.setItem('reporting_plant2_user', JSON.stringify(lightweight));
      } catch (innerErr) {
        console.warn('LocalStorage fallback save failed:', innerErr);
      }
    }
  }

  async function updateProfile(updated: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    if (!user.value) return { success: false, error: 'User tidak ditemukan' };

    let rawFoto = updated.foto_profil || updated.foto || user.value.foto_profil || user.value.foto || '';
    
    // If user provided a large data:image base64, compress it to max 300px JPEG (< 20KB)
    if (rawFoto && rawFoto.startsWith('data:image')) {
      try {
        rawFoto = await compressImage(rawFoto, 300, 0.75);
      } catch (compErr) {
        console.warn('Image compression warning:', compErr);
      }
    }

    const cleanFoto = formatDirectImageUrl(rawFoto) || (user.value.role === 'Planner' ? DEFAULT_AVATARS.Planner : DEFAULT_AVATARS.Maintenance);

    const mergedUser: UserProfile = {
      ...user.value,
      ...updated,
      foto_profil: cleanFoto,
      foto: cleanFoto
    };

    user.value = mergedUser;
    safeSaveUserLocally(mergedUser);

    const supabase = getSupabase();
    if (supabase) {
      const basePayload: Record<string, any> = {
        nrp: mergedUser.nrp,
        nama: mergedUser.nama,
        email: mergedUser.email,
        role: mergedUser.role,
        foto_profil: cleanFoto,
        phone: mergedUser.phone || '',
        department: mergedUser.department || (mergedUser.role === 'Planner' ? 'Planning & Plant Reliability Dept' : 'Heavy Equipment Field Maintenance'),
        shift: mergedUser.shift || 'Day Shift',
        updated_at: new Date().toISOString()
      };

      try {
        // Step 1: Check existing record by email, nrp, or role
        let existingRecord: any = null;

        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', mergedUser.email)
          .maybeSingle();

        if (byEmail) {
          existingRecord = byEmail;
        } else {
          const { data: byNrp } = await supabase
            .from('profiles')
            .select('*')
            .eq('nrp', mergedUser.nrp)
            .maybeSingle();
          if (byNrp) {
            existingRecord = byNrp;
          } else {
            const { data: byRole } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', mergedUser.role)
              .maybeSingle();
            if (byRole) {
              existingRecord = byRole;
            }
          }
        }

        if (existingRecord) {
          // Record exists -> update by ID
          const { error: updateErr } = await supabase
            .from('profiles')
            .update(basePayload)
            .eq('id', existingRecord.id);

          if (!updateErr) {
            return { success: true };
          }

          console.warn('Update by ID failed, trying update by email:', updateErr.message);
          const { error: updateEmailErr } = await supabase
            .from('profiles')
            .update(basePayload)
            .eq('email', mergedUser.email);

          if (!updateEmailErr) {
            return { success: true };
          }

          // If columns might be missing (e.g. phone/department/shift), try essential columns
          const minimalPayload = {
            nama: mergedUser.nama,
            nrp: mergedUser.nrp,
            email: mergedUser.email,
            role: mergedUser.role,
            foto_profil: cleanFoto,
            updated_at: new Date().toISOString()
          };
          const { error: minErr } = await supabase
            .from('profiles')
            .update(minimalPayload)
            .eq('id', existingRecord.id);

          if (!minErr) {
            return { success: true };
          }

          return { success: false, error: minErr.message || updateErr.message };
        } else {
          // No record exists -> insert or upsert
          const newUuid = (mergedUser.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mergedUser.id))
            ? mergedUser.id
            : generateSafeUUID();

          mergedUser.id = newUuid;
          user.value.id = newUuid;
          safeSaveUserLocally(user.value);

          // Try Insert with safe UUID
          const insertPayload = {
            id: newUuid,
            ...basePayload
          };

          const { error: insertErr } = await supabase
            .from('profiles')
            .insert(insertPayload);

          if (!insertErr) {
            return { success: true };
          }

          console.warn('Insert with UUID failed, trying upsert on email:', insertErr.message);
          const { error: upsertErr } = await supabase
            .from('profiles')
            .upsert(insertPayload, { onConflict: 'email' });

          if (!upsertErr) {
            return { success: true };
          }

          // Try minimal insert
          const minInsertPayload = {
            id: newUuid,
            nama: mergedUser.nama,
            nrp: mergedUser.nrp,
            email: mergedUser.email,
            role: mergedUser.role,
            foto_profil: cleanFoto
          };
          const { error: minInsertErr } = await supabase
            .from('profiles')
            .insert(minInsertPayload);

          if (!minInsertErr) {
            return { success: true };
          }

          console.error('All profile save attempts failed:', minInsertErr);
          return { success: false, error: minInsertErr.message || upsertErr.message || insertErr.message };
        }
      } catch (err: any) {
        console.error('Supabase profile exception:', err);
        return { success: false, error: err?.message || 'Terjadi gangguan saat menghubungi database Supabase' };
      }
    }

    return { success: true };
  }

  async function resetPassword(email: string) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(email);
      } catch (e) {
        console.warn('Supabase reset password exception:', e);
      }
    }
    Swal.fire({
      icon: 'success',
      title: 'Tautan Reset Terkirim',
      text: `Instruksi pembaruan password telah dikirimkan ke ${email}. Silakan periksa inbox email Anda.`,
      timer: 3500,
      showConfirmButton: true,
      confirmButtonText: 'Kembali ke Login'
    });
    return true;
  }

  function logout() {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().then(() => {});
    }
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('reporting_plant2_user');
    localStorage.removeItem('plant2_user');
  }

  return {
    user,
    isAuthenticated,
    isDarkMode,
    isPlanner,
    isMaintenance,
    initAuth,
    toggleDarkMode,
    applyInitialTheme,
    login,
    resetPassword,
    switchRole,
    updateProfile,
    logout
  };
});
