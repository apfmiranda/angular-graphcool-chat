import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-chat-add-group',
  templateUrl: './chat-add-group.component.html',
  styleUrls: ['./chat-add-group.component.scss']
})
export class ChatAddGroupComponent {

  constructor(
    public dialogRef: MatDialogRef<ChatAddGroupComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
