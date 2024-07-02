import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: '/',
    redirect: { name: 'sleep' }
  },
  {
    path: '/sleep',
    name: 'sleep',
    component: () => import('../views/SleepView.vue') 
  },
  {
    path: '/wakeup',
    name: 'wakeup',
    component: () => import('../views/WakeUpView.vue')
  },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('../views/MenuView.vue')
  },
  {
    path: '/glucose',
    name: 'glucose',
    component: () => import('../views/CheckGlucoseView.vue')
  },
  {
    path: '/medicine',
    name: 'medicine',
    component: () => import('../views/TakeMedicineView.vue')
  },
  {
    path: '/buddy',
    name: 'buddy',
    component: () => import('../views/TalkingBuddyView.vue')
  },
  {
    path: '/call',
    name: 'call',
    component: () => import('../views/VideoCallView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/sos',
    name: 'sos',
    component: () => import('../views/SosView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
