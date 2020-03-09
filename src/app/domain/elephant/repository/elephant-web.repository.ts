import { Injectable } from '@angular/core';
import { ElephantModel } from '../model/elephant.model';
import { Observable } from 'rxjs';
import { ElephantWebRepositoryMapper } from './mapper/elephant-web-repository.mapper';
import { HttpClient } from '@angular/common/http';
import {ElephantRepository, ElephantEntity} from '../model/elephant.entity';
import { flatMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ElephantWebRepository extends ElephantRepository {

  mapper = new ElephantWebRepositoryMapper();

  constructor(
    private http: HttpClient
  ) {
    super();
  }

  getElephantById(id: number): Observable<ElephantModel> {
    return this.http
      .get<ElephantEntity>('http://5b8d40db7366ab0014a29bfa.mockapi.io/api/v1/elephants/${id}')
      .pipe(map(this.mapper.mapFrom));
  }

  getAllElephants(): Observable<ElephantModel> {
    return this.http
      .get<ElephantEntity[]>('http://5b8d40db7366ab0014a29bfa.mockapi.io/api/v1/elephants')
      .pipe(flatMap((item) => item))
      .pipe(map(this.mapper.mapFrom));
  }
}
