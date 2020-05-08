export interface RatingItemModel {
  id?: string;
  name: string;
  displayName?: string;
  chartValue?: number;
}

export interface RatingListModel {
  name?: string;
  children?: RatingItemModel;
}
