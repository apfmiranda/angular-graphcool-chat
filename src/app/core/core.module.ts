import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphQLModule } from './../graphql.module';

@NgModule({
  exports: [
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
