import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatToolbarModule,
  MatInputModule,
  MatButtonModule } from '@angular/material';

@NgModule({
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class SharedModule { }
