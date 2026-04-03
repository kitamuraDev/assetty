import type { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component'),
    canActivate: [authGuard],
    data: { title: 'マイページ' },
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component'),
    data: { title: 'ログイン' },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component'),
    data: { title: '404 Not Found' },
  },
];
