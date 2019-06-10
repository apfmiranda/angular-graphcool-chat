import { map, take } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { User } from './../../../core/models/user.model';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ChatService } from '../../services/chat.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Chat } from '../../models/chat.model';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit, OnDestroy{

  newGroupForm: FormGroup;
  selectedImage: File;
  users$: Observable<User[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ChatAddGroupComponent>
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.createFrom();
    this.listenMembersList();
  }

  private listenMembersList(): void {

    this.subscriptions.push(this.members.valueChanges
      .subscribe(() => {
        this.users$ = this.users$
          .pipe(
            map(users => users.filter(user => this.members.controls.every(member => member.value.id !== user.id)))
          );
      }));

  }

  createFrom(): void {
    this.newGroupForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      members: this.fb.array([], Validators.required)
    });
  }

  get title(): FormControl { return this.newGroupForm.get('title') as FormControl; }
  get members(): FormArray { return this.newGroupForm.get('members') as FormArray; }

  addMember(user: User): void {
    this.members.push(this.fb.group({
      id: user.id,
      name: user.name
    }));
  }

  removeMember(index: number) {
    this.members.removeAt(index);
  }

  onSelectImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.selectedImage = file;
  }

  onSubmit(): void {
    const loggedUserId = this.authService.authUser.id;
    const formValue = Object.assign({
      title: this.title.value,
      userIds: this.members.value.map(member => member.id),
      loggedUserId,
      photoId: null
    });

    this.chatService.createGroup(formValue)
      .pipe(take(1))
      .subscribe((chat: Chat) => {
        this.dialogRef.close();
        this.snackBar.open(`Chat "${chat.title}" criado`, 'OK', { duration: 4000, verticalPosition: 'top' });
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
