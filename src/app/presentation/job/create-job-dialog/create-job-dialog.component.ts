import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JobData } from './JobData';

@Component({
  selector: 'create-job-dialog',
  templateUrl: './create-job-dialog.component.html',
  styleUrls: ['./create-job-dialog.component.scss'],
})
export class CreateJobDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CreateJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JobData
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
