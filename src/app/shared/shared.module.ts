import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatDialogModule,
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
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';
import { ReadFilePipe } from './pipes/read-file.pipe';
import { DialogConfirmComponent } from './components/dialog-confirm/dialog-confirm/dialog-confirm.component';
import { WarningComponent } from './components/warning/warning.component';

@NgModule({
  declarations: [
    AvatarComponent,
    NoRecordComponent,
    FromNowPipe,
    ImagePreviewComponent,
    ReadFilePipe,
    DialogConfirmComponent,
    WarningComponent
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatToolbarModule,
    CommonModule
  ],
  entryComponents: [
    ImagePreviewComponent,
    DialogConfirmComponent
  ],
  exports: [
    AvatarComponent,
    CommonModule,
    ReadFilePipe,
    FromNowPipe,
    ImagePreviewComponent,
    NoRecordComponent,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
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
    MatSlideToggleModule,
    DialogConfirmComponent,
    WarningComponent
  ]
})
export class SharedModule { }
