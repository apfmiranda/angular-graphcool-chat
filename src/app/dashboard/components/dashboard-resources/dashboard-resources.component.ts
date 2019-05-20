import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-resources',
  template: `
    <mat-nav-list>
      <a mat-list-item [routerLink]="link.url" *ngFor="let link of resources" >
        <mat-icon matListIcon>{{ link.icon }}</mat-icon>
        <h3 matLine>{{ link.title }}</h3>
      </a>
    </mat-nav-list>
  `
})
export class DashboardResourcesComponent {

  resources: {url: string, icon: string, title: string}[] = [
    {
      url: '/dashboard',
      icon: 'home',
      title: 'Dashboard'
    }
  ];

}
