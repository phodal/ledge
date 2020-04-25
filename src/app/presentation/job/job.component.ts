import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { CreateJobDialogComponent } from './create-job-dialog/create-job-dialog.component';
import { JobData } from './create-job-dialog/JobData';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit {
  loading = false;
  jobList: JobData[] = [];

  constructor(public dialog: MatDialog, private http: HttpClient) {}

  ngOnInit(): void {
    this.qryJobComments();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateJobDialogComponent, {
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed');
    });
  }

  qryJobComments() {
    this.loading = true;
    this.http
      .get('https://api.github.com/repos/phodal/ledge/issues/140/comments')
      .subscribe(
        (res: any[]) => {
          const result: any[] = res || [];
          const jobList = [];
          for (const job of result) {
            const arr = job.body.replace(/:/g, '：').split('\r\n');
            const jobInfo: JobData = {
              jobTitle: '',
              companyName: '',
              companyDescription: '',
              jobDescription: '',
              yearRequire: '',
              workAddress: '',
              salary: '',
              contact: '',
              date: '',
              htmlUrl: '',
            };
            const info = {};
            for (const str of arr) {
              const [key, value] = this.splitOnFirstColon(str);
              info[key] = value;
            }
            jobInfo.date = format(new Date(job.updated_at), 'yyyy/MM/dd');
            jobInfo.htmlUrl = job.html_url;
            /* tslint:disable : no-string-literal */
            jobInfo.companyName = info['公司名称'];
            jobInfo.companyDescription = info['公司一行简介'];
            jobInfo.workAddress = info['工作地址'];
            jobInfo.jobDescription = info['工作简介'];
            jobInfo.yearRequire = info['年限要求'];
            jobInfo.salary = info['待遇水平'];
            jobInfo.contact = info['联系方式'];
            jobList.push(jobInfo);
          }
          this.loading = false;
          this.jobList = jobList;
        },
        () => {
          this.loading = false;
        }
      );
  }

  splitOnFirstColon(str) {
    const idx = str.indexOf('：');
    return [str.substr(0, idx), str.substr(idx + 1)];
  }
}
