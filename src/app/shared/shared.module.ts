import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatToolbarModule,
  MatInputModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatListModule,
  MatIconModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatLineModule} from '@angular/material';

@NgModule({
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatLineModule,
    MatSidenavModule,
    MatIconModule,
    MatSlideToggleModule
  ]
})
export class SharedModule { }
