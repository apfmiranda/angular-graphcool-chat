import { BaseComponent } from './../../../shared/components/base.component';
import { ChatService } from './../../services/chat.service';
import { AuthService } from './../../../core/services/auth.service';
import { MessageService } from './../../services/message.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, Observable, of } from 'rxjs';
import { map, mergeMap, tap, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

import { Chat } from '../../models/chat.model';
import { Message } from './../../models/message.model';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent extends BaseComponent<Message> implements OnInit, OnDestroy {

  chat: Chat;
  messages$: Observable<Message[]>;
  newMessage = '';
  titleBefore: string;
  recipienteId: string = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private userService: UserService,
    public authService: AuthService,
    private messageService: MessageService,
    private chatService: ChatService
  ) {
    super();
  }

  ngOnInit() {
    this.titleBefore = this.title.getTitle();
    this.title.setTitle('Loading....');
    this.subscriptions.push(
      this.route.data
        .pipe(
          map(routeData => this.chat = routeData.chat),
          mergeMap(() => this.route.paramMap),
          tap((params: ParamMap) => {
            if (!this.chat) {
              this.recipienteId = params.get('id');

              this.userService.getUserById(this.recipienteId)
                .pipe(take(1))
                .subscribe((user: User) => this.title.setTitle(user.name));

              // evitar loading infinito quando não há chat com o usuario clicado
              this.messages$ = of([]);
            } else {
              this.title.setTitle(this.chat.title || this.chat.users[0].name);
              this.messages$ = this.messageService.getChatMessages(this.chat.id);
            }
          })
        )
        .subscribe()
    );
  }

  sendMessage(): void {
    this.newMessage = this.newMessage.trim();
    if (this.newMessage) {

      if (this.chat) {

        this.messageService.createMessage(
          {
            text: this.newMessage,
            chatId: this.chat.id,
            senderId: this.authService.authUser.id
          }).pipe(take(1)).subscribe(console.log);

        this.newMessage = '';

      } else {
        this.createPrivateChat();
      }
    }
  }

  private createPrivateChat(): void {
    this.chatService.createPriveChat(
      this.authService.authUser.id,
      this.recipienteId
    ).pipe(
      take(1),
      tap((chat: Chat) => {
        this.chat = chat;
        this.sendMessage();
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.title.setTitle(this.titleBefore);
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
