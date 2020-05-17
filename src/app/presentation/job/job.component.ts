import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { format } from 'date-fns';
import { CreateJobDialogComponent } from './create-job-dialog/create-job-dialog.component';
import { issueToForm, JobDataModel } from './create-job-dialog/job-data.model';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit {
  loading = false;
  jobList: JobDataModel[] = [];

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle(
      `DevOps 工作 Ledge DevOps 招聘信息中心 - Ledge DevOps 知识平台`
    );
    this.queryJobComments();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateJobDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.queryJobComments();
      }
    });
  }

  queryJobComments() {
    this.loading = true;
    this.http
      .get('https://api.github.com/repos/phodal/ledge/issues/140/comments')
      .subscribe(
        (res: any[]) => {
          const result: any[] = res || [];
          this.buildJobList(result);
        },
        () => {},
        () => {
          this.loading = false;
        }
      );
  }

  private buildJobList(result: any[]) {
    const jobList = [];
    for (const job of result.reverse()) {
      const arr = job.body.replace(/:/g, '：').split('\r\n');
      const info = {};
      for (const str of arr) {
        const [key, value] = this.splitOnFirstColon(str);
        info[key] = value;
      }
      const jobInfo = issueToForm(info);
      jobInfo.htmlUrl = job.html_url;
      jobInfo.date = format(new Date(job.updated_at), 'yyyy/MM/dd');
      jobList.push(jobInfo);
    }
    this.jobList = jobList;
  }

  splitOnFirstColon(str) {
    const idx = str.indexOf('：');
    return [str.substr(0, idx), str.substr(idx + 1)];
  }
}
