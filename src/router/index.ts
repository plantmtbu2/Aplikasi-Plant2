import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

// Views
import DashboardView from '../views/DashboardView.vue';
import CodeUnitView from '../views/CodeUnitView.vue';
import HmView from '../views/HmView.vue';
import BacklogView from '../views/BacklogView.vue';
import PlanDailyRigidView from '../views/PlanDailyRigidView.vue';
import PlanDailyArticView from '../views/PlanDailyArticView.vue';
import BapView from '../views/BapView.vue';
import AktivitasView from '../views/AktivitasView.vue';
import LaporanView from '../views/LaporanView.vue';
import ProfilePlannerView from '../views/ProfilePlannerView.vue';
import ProfileMaintenanceView from '../views/ProfileMaintenanceView.vue';
import SettingsView from '../views/SettingsView.vue';
import LoginView from '../views/LoginView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard - REPORTING PLANT2', requiresAuth: true }
      },
      // Data Master
      {
        path: 'master/code-unit',
        name: 'CodeUnit',
        component: CodeUnitView,
        meta: { title: 'Master Code Unit - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'master/hm',
        name: 'HmTracking',
        component: HmView,
        meta: { title: 'Pencatatan HM - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'master/backlog',
        name: 'Backlog',
        component: BacklogView,
        meta: { title: 'Backlog & Spare Part - REPORTING PLANT2', requiresAuth: true }
      },
      // Plan Today
      {
        path: 'plan/daily-rigid',
        name: 'PlanDailyRigid',
        component: PlanDailyRigidView,
        meta: { title: 'Plan Daily Rigid - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'plan/daily-artic',
        name: 'PlanDailyArtic',
        component: PlanDailyArticView,
        meta: { title: 'Plan Daily Artic - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'plan/bap',
        name: 'Bap',
        component: BapView,
        meta: { title: 'Berita Acara Pemeriksaan (BAP) - REPORTING PLANT2', requiresAuth: true }
      },
      // Aktivitas
      {
        path: 'aktivitas',
        name: 'Aktivitas',
        component: AktivitasView,
        meta: { title: 'Log Aktivitas - REPORTING PLANT2', requiresAuth: true }
      },
      // Laporan
      {
        path: 'laporan',
        name: 'Laporan',
        component: LaporanView,
        meta: { title: 'Laporan Plant 2 - REPORTING PLANT2', requiresAuth: true }
      },
      // Profil & Pengaturan
      {
        path: 'profil/planner',
        name: 'ProfilePlanner',
        component: ProfilePlannerView,
        meta: { title: 'Profil Planner (Admin) - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'profil/maintenance',
        name: 'ProfileMaintenance',
        component: ProfileMaintenanceView,
        meta: { title: 'Profil Maintenance (User) - REPORTING PLANT2', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: { title: 'Pengaturan & Supabase - REPORTING PLANT2', requiresAuth: true }
      }
    ]
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { title: 'Login - REPORTING PLANT2', guestOnly: true }
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: ResetPasswordView,
        meta: { title: 'Reset Password - REPORTING PLANT2', guestOnly: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  const storedUser = localStorage.getItem('reporting_plant2_user') || localStorage.getItem('plant2_user');
  const isAuthenticated = !!storedUser;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
