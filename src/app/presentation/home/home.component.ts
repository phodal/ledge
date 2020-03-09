import { Component, OnInit } from '@angular/core';
import { GetAllElephantsUsecase } from '../../domain/elephant/usecases/get-all-elephants.usecase';
import { ElephantModel } from '../../domain/elephant/model/elephant.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  elephants: any[];

  constructor(private getAllElephants: GetAllElephantsUsecase) {
  }

  ngOnInit() {
    this.elephants = [];
    this.getAllElephants.execute(null).subscribe((value: ElephantModel) => {
      this.elephants.push(value);
    });
  }

}
