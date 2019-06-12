import { catchError } from 'rxjs/operators';
import { ErrorService } from './../../../core/services/error.service';
import { AuthService } from './../../../core/services/auth.service';
import { ChatService } from './../../services/chat.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { Chat } from '../../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatWindowResolver implements Resolve<Chat> {

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private errorService: ErrorService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Chat> {
    const chatOrUserId: string = route.paramMap.get('id');
    return this.chatService.getChatByIdOrByUsers(chatOrUserId, this.authService.authUser.id)
      .pipe(
        catchError((error: Error) => {
          const errorMessage: string = this.errorService.getErrorMessage(error);
          let redirect = '/dashboard';
          if (errorMessage.includes('Insufficient Permissions')) {
            redirect = '/dashboard/permission-denied';
          }
          this.router.navigate([redirect], { queryParams: { previous: state.url } });
          return of(null);
        })
      );
  }

}
