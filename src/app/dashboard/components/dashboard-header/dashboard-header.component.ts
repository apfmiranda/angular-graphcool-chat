import { BaseComponent } from './../../../shared/components/base.component';
import { Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent extends BaseComponent<any> {

  @Input() sidenav: MatSidenav;

  constructor(
    authService: AuthService,
    dialog: MatDialog,
    public title: Title
  ) {
    super(authService, dialog);
  }
}

