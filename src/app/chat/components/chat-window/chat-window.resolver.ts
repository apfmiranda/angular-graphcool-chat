import { AuthService } from './../../../core/services/auth.service';
import { ChatService } from './../../services/chat.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Chat } from '../../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatWindowResolver implements Resolve<Chat> {

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Chat> {
    const chatOrUserId: string = route.paramMap.get('id');
    return this.chatService.getChatByIdOrUsers(chatOrUserId, this.authService.authUser.id);
  }

}
