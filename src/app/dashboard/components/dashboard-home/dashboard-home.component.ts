import { BaseComponent } from './../../../shared/components/base.component';
import { Component } from '@angular/core';
import { MatSidenav, MatDialog } from '@angular/material';

import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent extends BaseComponent<any>{

  constructor(
    authService: AuthService,
    dialog: MatDialog
  ) {
    super(authService, dialog);
  }

  onLogout(sidenav: MatSidenav): void {
    sidenav.close();
    this.logout();
  }

}
