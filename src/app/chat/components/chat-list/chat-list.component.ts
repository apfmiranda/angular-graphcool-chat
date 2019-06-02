import { ChatAddGroupComponent } from './../../components/chat-add-group/chat-add-group.component';
import { BaseComponent } from './../../../shared/components/base.component';
import { AuthService } from './../../../core/services/auth.service';
import { ChatService } from './../../services/chat.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Chat } from '../../models/chat.model';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent extends BaseComponent<Chat> implements OnInit {

  chats$: Observable<Chat[]>;
  authUserId: string;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit() {
    this.authUserId = this.authService.authUser.id;
    this.chats$ = this.chatService.chats$;
  }

  getChatTitle(chat: Chat): string {
    return chat.title || chat.users[0].name;
  }

  getLastMessage(chat: Chat): string {
    const message = chat.messages[0];
    if (message) {
      const sender = (message.sender.id === this.authUserId) ? 'You:' : '';
      return `${sender} ${message.text}`;
    }
    return 'No messages.';
  }

  onAddGroup(): void {
    const dialogRef = this.dialog.open(ChatAddGroupComponent, {
      height: '80vh',
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed: ', result);
    });
  }


}
