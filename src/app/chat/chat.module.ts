import {
  Router,
  RouterEvent,
  NavigationEnd,
  RoutesRecognized,
  Event
} from '@angular/router';

import { NgModule, OnDestroy } from '@angular/core';
import { filter, tap } from 'rxjs/operators';

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
import { Subscription, Observable } from 'rxjs';
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
export class ChatModule implements OnDestroy {

  private subscriptionMonitoring: Subscription;
  event$: Observable<Event>;
  private isMonitoring = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) {

    this.event$ = this.router.events
    .pipe(
      filter(e => e instanceof RouterEvent),
      tap(e => {
        if (e instanceof RoutesRecognized && e.url.includes('chat')) {
          this.startMonitoring();
        }
        if (e instanceof NavigationEnd && !e.url.includes('chat')) {
          this.stopMonitoring();
        }
      })
    );

    this.subscriptionMonitoring = this.event$.subscribe();

  }

  private startMonitoring(): void {
    if (!this.isMonitoring) {
      this.chatService.startChatsMonitoring();
      this.userService.startUsersMonitoring(this.authService.authUser.id);
      this.isMonitoring = true;
    }
  }

  private stopMonitoring(): void {
    this.chatService.stopChatsMonitoring();
    this.userService.stopUsersMonitoring();
    this.isMonitoring = false;
  }

  ngOnDestroy(): void {
    this.subscriptionMonitoring.unsubscribe();
  }

}

