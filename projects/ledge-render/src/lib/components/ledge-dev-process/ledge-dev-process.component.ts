import { Component, Input, OnInit } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-dev-process',
  templateUrl: './ledge-dev-process.component.html',
  styleUrls: ['./ledge-dev-process.component.scss']
})
export class LedgeDevProcessComponent implements OnInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  imagesShow: any = {};

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  getImageUrl(name: string) {
    return `https://phodal.github.io/logo/png/${this.getItemName(name)}.png`;
  }

  updateUrl(name: string, $event: any) {
    this.imagesShow[name] = {
      showImage: false
    };
  }

  showImage(name: string) {
    if (this.imagesShow[name] === undefined) {
      return true;
    }

    if (this.imagesShow[name] && this.imagesShow[name].showImage) {
      return true;
    }

    return false;
  }

  getItemName(name: string) {
    return name.toLowerCase().replace(/\s/g, '-');
  }
}
