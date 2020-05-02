export const GITHUB_TOKEN = 'github token';

export interface JobDataModel {
  jobTitle: string; // 岗位名称
  companyName: string;
  companyDescription: string;
  jobDescription: string;
  yearRequire: string;
  workAddress: string;
  salary: string;
  contact: string;
  date: string; // 发布日期
  htmlUrl: string; // issues comments 的url地址
}

export function issueToForm(info) {
  const obj: JobDataModel = {
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
  /* tslint:disable : no-string-literal */
  obj.jobTitle = info['岗位名称'] || '';
  obj.companyName = info['公司名称'];
  obj.companyDescription = info['公司一行简介'];
  obj.workAddress = info['工作地址'];
  obj.jobDescription = info['工作简介'];
  obj.yearRequire = info['年限要求'];
  obj.salary = info['待遇水平'];
  obj.contact = info['联系方式'];

  return obj;
}

export function formToIssue(data: JobDataModel) {
  const str =
    '岗位名称：' +
    data.jobTitle +
    '\r\n公司名称：' +
    data.companyName +
    '\r\n公司一行简介：' +
    data.companyDescription +
    '\r\n工作地址：' +
    data.workAddress +
    '\r\n工作简介：' +
    data.jobDescription +
    '\r\n年限要求：' +
    data.yearRequire +
    '\r\n待遇水平：' +
    data.salary +
    '\r\n联系方式：' +
    data.contact;
  return str;
}
