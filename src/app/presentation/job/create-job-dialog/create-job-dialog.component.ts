import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formToIssue, GITHUB_TOKEN, JobData } from './JobData';

@Component({
  selector: 'create-job-dialog',
  templateUrl: './create-job-dialog.component.html',
  styleUrls: ['./create-job-dialog.component.scss'],
})
export class CreateJobDialogComponent implements OnInit {
  jobForm: FormGroup;
  errorMessage: string;
  constructor(
    public dialogRef: MatDialogRef<CreateJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: JobData,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.jobForm = this.fb.group({
      jobTitle: ['', Validators.required],
      companyName: ['', Validators.required],
      companyDescription: ['', Validators.required],
      jobDescription: ['', Validators.required],
      yearRequire: ['', Validators.required],
      workAddress: ['', Validators.required],
      salary: ['', Validators.required],
      contact: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  close(flag = false): void {
    this.dialogRef.close(flag);
  }

  onSubmit() {
    this.errorMessage = '';
    for (const key of Object.keys(this.jobForm.controls)) {
      this.jobForm.controls[key].markAsDirty();
      this.jobForm.controls[key].updateValueAndValidity();
    }
    if (this.jobForm.status === 'INVALID') {
      return;
    }

    this.commentOnGithubIssue(this.jobForm.value);
  }

  onReset() {
    this.errorMessage = '';
    this.jobForm.reset();
  }

  commentOnGithubIssue(formValue) {
    const body = formToIssue(formValue);

    this.http
      .post(
        'https://api.github.com/repos/phodal/ledge/issues/140/comments',
        { body },
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      )
      .subscribe(
        (res: any) => {
          if (res.id) {
            this.close(true);
          } else {
            this.errorMessage = res.message;
          }
        },
        (err) => {
          this.errorMessage = err.message;
        }
      );
  }
}
