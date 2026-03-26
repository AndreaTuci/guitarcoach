import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/program',
      name: 'program',
      component: () => import('@/views/ProgramView.vue'),
    },
    {
      path: '/exercise/:id',
      name: 'exercise',
      component: () => import('@/views/ExerciseView.vue'),
    },
    {
      path: '/songs',
      name: 'songs',
      component: () => import('@/views/SongsView.vue'),
    },
  ],
})
