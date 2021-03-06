import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { Chat } from '../../models/chat.model';
import { AuthService } from './../../../core/services/auth.service';
import { BaseComponent } from './../../../shared/components/base.component';
import { Message } from './../../models/message.model';
import { ChatService } from './../../services/chat.service';
import { MessageService } from './../../services/message.service';
import { ChatMessageComponent } from './../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent extends BaseComponent<Message> implements OnInit, OnDestroy, AfterViewInit {

  chat: Chat;
  messages$: Observable<Message[]>;
  newMessage = '';
  titleBefore: string;
  recipienteId: string = null;
  alreadyLoadedMessages = false;
  @ViewChild('content', { static:false }) private content: ElementRef;
  @ViewChildren(ChatMessageComponent) private messagesQueryList: QueryList<ChatMessageComponent>;
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

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.messagesQueryList.changes.subscribe(() => {
        this.scrollToBotton('smooth');
      })
    );
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
              this.alreadyLoadedMessages = true;
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
        this.createMessage().pipe(take(1)).subscribe();
        this.newMessage = '';

      } else {
        this.createPrivateChat();
      }
    }
  }

  private createMessage(): Observable<Message> {
    return this.messageService.createMessage({
      text: this.newMessage,
      chatId: this.chat.id,
      senderId: this.authService.authUser.id
    }).pipe(
      tap(message => {
        if (!this.alreadyLoadedMessages) {
          this.messages$ = this.messageService.getChatMessages(this.chat.id);
          this.alreadyLoadedMessages = true;
        }
      })
    );
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

  private scrollToBotton(behavior: string = 'auto', block: string = 'end'): void {
    setTimeout(() => {
      if (this.content) {
        this.content.nativeElement.scrollIntoView({behavior, block});
      }
    }, 0);

  }

  ngOnDestroy(): void {
    this.title.setTitle(this.titleBefore);
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
