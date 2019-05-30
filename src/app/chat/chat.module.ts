import {
  Router,
  RouterEvent,
  NavigationEnd,
  RoutesRecognized
} from '@angular/router';

import { NgModule } from '@angular/core';
import { filter } from 'rxjs/operators';

import { AuthService } from './../core/services/auth.service';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatService } from './services/chat.service';
import { ChatTabComponent } from './components/chat-tab/chat-tab.component';
import { ChatUsersComponent } from './components/chat-users/chat-users.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { UserService } from '../core/services/user.service';
import { SharedModule } from './../shared/shared.module';

@NgModule({
  declarations: [
    ChatTabComponent,
    ChatUsersComponent,
    ChatListComponent,
    ChatWindowComponent,
    ChatMessageComponent
  ],
  imports: [
    SharedModule,
    ChatRoutingModule
  ]
})
export class ChatModule {

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) {
    this.startMonitoringChatRoute();
  }

  private startMonitoringChatRoute() {

    this.router.events
    .pipe(
      filter(e => e instanceof RouterEvent)
    ).subscribe((event: RouterEvent) => {

      if (event instanceof RoutesRecognized && event.url.includes('chat')) {
        this.chatService.startChatsMonitoring();
        this.userService.startUsersMonitoring(this.authService.authUser.id);
      }

      if (event instanceof NavigationEnd && !event.url.includes('chat')) {
        this.chatService.stopChatsMonitoring();
        this.userService.stopUsersMonitoring();
      }
    });

  }

 }


