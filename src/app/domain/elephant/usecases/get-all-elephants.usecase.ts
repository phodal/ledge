import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from '../../../core/base/use-case';
import { ElephantModel } from '../model/elephant.model';
import { ElephantWebRepository } from '../repository/elephant-web.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllElephantsUsecase implements UseCase<void, ElephantModel> {

  constructor(private elephantRepository: ElephantWebRepository) {
  }

  execute(params: void): Observable<ElephantModel> {
    return this.elephantRepository.getAllElephants();
  }
}
