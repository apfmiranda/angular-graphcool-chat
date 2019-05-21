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
  MatTabsModule,
  MatLineModule} from '@angular/material';
import { NoRecordComponent } from './components/no-record/no-record.component';

@NgModule({
  declarations: [
    NoRecordComponent
  ],
  imports: [
    MatIconModule
  ],
  exports: [
    CommonModule,
    NoRecordComponent,
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
    MatTabsModule,
    MatSlideToggleModule
  ]
})
export class SharedModule { }
