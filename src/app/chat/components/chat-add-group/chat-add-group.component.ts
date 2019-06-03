import { map } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { User } from './../../../core/models/user.model';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit, OnDestroy{

  newGroupForm: FormGroup;
  users$: Observable<User[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
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
    console.log(this.newGroupForm.value);
  }

  removeMember(index: number) {
    this.members.removeAt(index);
  }

  onSubmit(): void {
    console.log('Form Value: ', this.newGroupForm.value);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
