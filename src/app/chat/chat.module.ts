import {
  Router,
  RouterEvent,
  NavigationEnd,
  ResolveStart
} from '@angular/router';

import { NgModule } from '@angular/core';
import { filter, take } from 'rxjs/operators';

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
import { ChatAddGroupComponent } from './components/chat-add-group/chat-add-group.component';

@NgModule({
  declarations: [
    ChatTabComponent,
    ChatUsersComponent,
    ChatListComponent,
    ChatWindowComponent,
    ChatMessageComponent,
    ChatAddGroupComponent
  ],
  imports: [
    SharedModule,
    ChatRoutingModule
  ],
  entryComponents : [
    ChatAddGroupComponent
  ]
})
export class ChatModule {

  private isMonitoring = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private userService: UserService,
  ) {

    this.authService.isAuthenticated
      .pipe(take(1))
          .subscribe((is: boolean) => {
            if (is) {
              this.init();
            }
      });

  }

  init(): void {
    this.router.events
      .pipe(filter(e => e instanceof RouterEvent))
      .subscribe(e => {
        if (e instanceof ResolveStart && e.url.includes('chat')) {
          this.startMonitoring();
        }
        if (e instanceof NavigationEnd && !e.url.includes('chat')) {
          this.stopMonitoring();
        }
      });
  }

  private startMonitoring(): void {
    if (!this.isMonitoring) {
      this.chatService.startChatsMonitoring(this.authService.authUser.id);
      this.userService.startUsersMonitoring();
      this.isMonitoring = true;
    }
  }

  private stopMonitoring(): void {
    this.chatService.stopChatsMonitoring();
    this.userService.stopUsersMonitoring();
    this.isMonitoring = false;
  }

}
