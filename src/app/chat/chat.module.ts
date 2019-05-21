import { NgModule } from '@angular/core';
import { SharedModule } from './../shared/shared.module';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatTabComponent } from './components/chat-tab/chat-tab.component';
import { ChatUsersComponent } from './components/chat-users/chat-users.component';

@NgModule({
  declarations: [ChatTabComponent, ChatUsersComponent],
  imports: [
    SharedModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }
