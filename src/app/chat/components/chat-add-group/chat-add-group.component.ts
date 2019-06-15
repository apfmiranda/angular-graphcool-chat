import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { Chat } from '../../models/chat.model';
import { ChatService } from '../../services/chat.service';
import { FileModel } from './../../../core/models/file.model';
import { User } from './../../../core/models/user.model';
import { ErrorService } from './../../../core/services/error.service';
import { FileService } from './../../../core/services/file.service';

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
    private fileService: FileService,
    private errorService: ErrorService,
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
    let operation: Observable<FileModel> = of(null);

    if (this.selectedImage) {
      operation = this.fileService.upload(this.selectedImage);
    }

    let message: string;
    operation
      .pipe(mergeMap((uploadedImage: FileModel) => {
        const loggedUserId = this.authService.authUser.id;
        const formValue = Object.assign({
          title: this.title.value,
          userIds: this.members.value.map(member => member.id),
          loggedUserId,
          photoId: (uploadedImage) ? uploadedImage.id : null
        });
        return this.chatService.createGroup(formValue);
      }),
      take(1)
    ).subscribe((chat: Chat) => message = `Chat "${chat.title}" criado`,
      (error) => message = this.errorService.getErrorMessage(error),
      () => {
        this.dialogRef.close();
        this.snackBar.open(message, 'OK', { duration: 4000, verticalPosition: 'top' });
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
