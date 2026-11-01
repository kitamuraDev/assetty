import type { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home'),
    canActivate: [authGuard],
    data: { title: 'マイページ' },
  },
  {
    path: 'register/assets',
    loadComponent: () => import('./features/assets-register/assets-register'),
    canActivate: [authGuard],
    data: { title: '資産情報登録' },
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login'),
    data: { title: 'ログイン' },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found'),
    data: { title: '404 Not Found' },
  },
];
