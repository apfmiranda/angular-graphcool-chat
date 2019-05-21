import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatTabComponent } from './components/chat-tab/chat-tab.component';

@NgModule({
  declarations: [ChatTabComponent],
  imports: [
    SharedModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }
