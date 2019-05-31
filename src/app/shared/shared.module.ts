import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  MatMenuModule,
  MatLineModule} from '@angular/material';
import { NoRecordComponent } from './components/no-record/no-record.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { FromNowPipe } from './pipes/from-now.pipe';

@NgModule({
  declarations: [
    AvatarComponent,
    NoRecordComponent,
    FromNowPipe
  ],
  imports: [
    MatIconModule,
    CommonModule
  ],
  exports: [
    AvatarComponent,
    CommonModule,
    FromNowPipe,
    NoRecordComponent,
    ReactiveFormsModule,
    FormsModule,
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
    MatMenuModule,
    MatSlideToggleModule
  ]
})
export class SharedModule { }
