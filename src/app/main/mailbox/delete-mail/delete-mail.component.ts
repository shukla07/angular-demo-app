import {Component} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';

@Component({
  selector: 'vmsl-delete-mail',
  templateUrl: './delete-mail.component.html',
  styleUrls: ['./delete-mail.component.scss'],
})
export class DeleteMailComponent {
  constructor(protected dialogRef: NbDialogRef<DeleteMailComponent>) {}
  callback;
  mailId;

  close() {
    this.dialogRef.close();
  }

  deleteMail() {
    this.dialogRef.close();
    if (typeof this.callback === 'function') {
      this.callback(this.mailId);
    }
  }
}
