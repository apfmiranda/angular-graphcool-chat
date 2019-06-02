import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent implements OnInit{

  newGroupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChatAddGroupComponent>
  ) {}

  ngOnInit(): void {
    this.createFrom();
  }

  createFrom(): void {
    this.newGroupForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get title(): FormControl { return this.newGroupForm.get('title') as FormControl; }

  onSubmit(): void {
    console.log('Form Value: ', this.newGroupForm.value);
  }

}
