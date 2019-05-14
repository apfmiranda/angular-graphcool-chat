import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { GraphQLModule } from './../graphql.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule } from '@angular/material';

@NgModule({
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    GraphQLModule
  ]
})
export class CoreModule {

  constructor(
    @Optional() @SkipSelf() parentModel: CoreModule
  ) {

    if (parentModel) {
      throw new Error('CoreModule já foi lido. Importe apenas no AppModule');
    }
  }
}
