import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphQLModule } from './../graphql.module';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { Title } from '@angular/platform-browser';


@NgModule({
  imports: [
    SharedModule,
    RouterModule
  ],
  exports: [
    GraphQLModule,
    BrowserAnimationsModule
  ],
  providers: [
    Title
  ],
  declarations: [NotFoundComponent]
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
