import { Column } from './column';

export class Board {
  constructor(public name: string, public columns: Column[]) {}
}
