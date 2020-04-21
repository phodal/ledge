import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Atom } from '../support';

@Component({
  selector: 'app-atom-dialog',
  templateUrl: './atom-dialog.component.html',
  styleUrls: ['./atom-dialog.component.scss'],
})
export class AtomDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Atom) {}
}
