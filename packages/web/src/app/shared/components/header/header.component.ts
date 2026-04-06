import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { httpResource } from '@angular/common/http';
import { Component, viewChild } from '@angular/core';

import type { UserInfoResponseType } from '@api-spec/shared/user.schema';
import { environment } from '../../../../environments/environment';

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
      <menu ngMenu #userMenu="ngMenu" class="p-4 rounded-lg bg-slate-50">
        <ng-template ngMenuContent>
          <li ngMenuItem value="ユーザープロフィール" class="flex items-center gap-3">
            <span class="grid place-content-center h-10 w-10 rounded-full text-lg font-bold bg-black text-white">{{ userNameInitial }}</span>
            <div class="flex flex-col items-start text-sm text-slate-700">
              <span>{{ user?.name }}</span>
              <span>@{{ user?.id }}</span>
            </div>
          </li>
        </ng-template>
      </menu>
    </ng-template>
  `,
})
export class HeaderComponent {
  private readonly API_BASE_URL = environment.API_BASE_URL;

  readonly userInfo = httpResource<UserInfoResponseType>(() => ({
    url: `${this.API_BASE_URL}/user`,
    method: 'GET',
    credentials: 'include',
  }));
  userMenu = viewChild<Menu<string>>('userMenu');
}
