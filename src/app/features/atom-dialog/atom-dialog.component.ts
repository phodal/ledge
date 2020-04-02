import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Atom } from '../shared';

@Component({
  selector: 'app-atom-dialog',
  templateUrl: './atom-dialog.component.html',
  styleUrls: ['./atom-dialog.component.scss'],
})
export class AtomDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Atom) {}

  ngOnInit(): void {}
}
