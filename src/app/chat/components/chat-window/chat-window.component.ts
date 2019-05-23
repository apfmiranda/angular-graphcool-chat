import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Chat } from '../../models/chat.model';
import { Subscription } from 'rxjs';
import { map, mergeMap, tap, take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {

  chat: Chat;
  titleBefore: string;
  recipienteId: string = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.titleBefore = this.title.getTitle();
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
            } else {
              this.title.setTitle(this.chat.title || this.chat.users[0].name);
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.title.setTitle(this.titleBefore);
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
