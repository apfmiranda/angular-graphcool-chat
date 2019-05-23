import { AuthService } from './../../../core/services/auth.service';
import { ChatService } from './../../services/chat.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Chat } from '../../models/chat.model';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {

  chats$: Observable<Chat[]>;
  authUserId: string;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.authUserId = this.authService.authUser.id;
    this.chats$ = this.chatService.getUserChats(this.authUserId);
  }

  getChatTitle(chat: Chat): string {
    return chat.title || chat.users[0].name;
  }

  getLastMessage(chat: Chat): string {
    const message = chat.messages[0];
    if (message) {
      const sender = (message.sender[0].id === this.authUserId) ? 'You:' : '';
      return `${sender} ${message.text}`;
    }
    return 'No messages.';
  }

}
