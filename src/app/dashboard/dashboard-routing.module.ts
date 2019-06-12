import { DashboardPermissionDeniedComponent } from './components/dashboard-permission-denied/dashboard-permission-denied.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './../login/auth.guard';
import { Routes, RouterModule } from '@angular/router';

import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardResourcesComponent } from './components/dashboard-resources/dashboard-resources.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardHomeComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    children: [
      { path: 'chat', loadChildren: './../chat/chat.module#ChatModule', canActivate: [ AuthGuard ] },
      { path: 'profile', loadChildren: './../user/user.module#UserModule', canActivate: [ AuthGuard ] },
      { path: 'permission-denied', component: DashboardPermissionDeniedComponent, canActivate: [ AuthGuard ] },
      { path: '', component: DashboardResourcesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
