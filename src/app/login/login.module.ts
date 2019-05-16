import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';

import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    LoginRoutingModule
  ]
})
export class LoginModule { }
