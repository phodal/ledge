import { ElephantModel } from './elephant.model';
import { Observable } from 'rxjs';

export abstract class ElephantRepository {
  abstract getElephantById(id: number): Observable<ElephantModel>;

  abstract getAllElephants(): Observable<ElephantModel>;
}

export interface ElephantEntity {
  id: number;
  name: string;
  family: string;
  birthday: number;
}
