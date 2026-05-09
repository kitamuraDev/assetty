import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { httpResource } from '@angular/common/http';
import { Component, inject, viewChild } from '@angular/core';

import type { UserInfoResponseType } from '@api-spec/shared/user.schema';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule],
  template: `
    @let user = userInfo.value();
    @let userNameInitial = user?.name?.at(0);

    <header class="sticky top-0 z-50 border-b border-slate-300 bg-white shadow-sm">
      <div class="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
        <h1 class="font-heading text-3xl font-extrabold italic">Assetty</h1>
        <button
          type="button"
          aria-label="ユーザーメニューを開閉する"
          class="cursor-pointer"
          ngMenuTrigger
          #origin
          #trigger="ngMenuTrigger"
          [menu]="userMenu()"
        >
          <span class="grid place-content-center h-10 w-10 rounded-full text-lg font-bold bg-black text-white">{{ userNameInitial }}</span>
        </button>
      </div>
    </header>

    <ng-template
      [cdkConnectedOverlayOpen]="trigger.expanded()"
      [cdkConnectedOverlay]="{ origin, usePopover: 'inline' }"
      [cdkConnectedOverlayPositions]="[{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 12 }]"
      cdkAttachPopoverAsChild
    >
      <menu ngMenu #userMenu="ngMenu" class="w-[70vw] max-w-70 p-4 rounded-lg bg-slate-50 shadow-sm">
        <ng-template ngMenuContent>
          <li ngMenuItem value="ユーザープロフィール" class="flex items-center gap-3">
            <span class="shrink-0 grid place-content-center h-10 w-10 rounded-full text-lg font-bold bg-black text-white">{{ userNameInitial }}</span>
            <div class="flex flex-col items-start min-w-0 text-sm text-slate-700">
              <span class="w-full truncate font-bold">{{ user?.name }}</span>
              <span class="w-full truncate font-normal">@{{ user?.id }}</span>
            </div>
          </li>

          <hr class="mt-5 mb-3 -mx-4 border-slate-300" />

          <li ngMenuItem value="ログアウト">
            <button
              type="button"
              (click)="onLogout()"
              aria-label="ログアウトする"
              class="w-full flex justify-start items-center gap-2 px-3 py-3 rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-white"
            >
              <img src="/icons/logout.svg" alt="ログアウトアイコン" width="18" height="18">
              <span>ログアウト</span>
            </button>
          </li>

        </ng-template>
      </menu>
    </ng-template>
  `,
})
export class HeaderComponent {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly authService = inject(AuthService);

  readonly userInfo = httpResource<UserInfoResponseType>(() => ({
    url: `${this.API_BASE_URL}/user`,
    method: 'GET',
    credentials: 'include',
  }));
  userMenu = viewChild<Menu<string>>('userMenu');

  onLogout(): void {
    const isConfirmed = confirm('ログアウトしますか？');

    if (isConfirmed) {
      this.authService.logout();
    }
  }
}
