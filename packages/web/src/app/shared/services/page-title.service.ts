import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  setTitle(): void {
    const defaultTitle = this.titleService.getTitle();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;

          // app.routes.ts に data: { title: 'xxx' } があれば title の中身を返す
          // なければ defaultTitle を返す
          if (child?.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return defaultTitle;
        }),
      )
      .subscribe((title: string) => {
        this.titleService.setTitle(`${defaultTitle} - ${title}`);
      });
  }
}
