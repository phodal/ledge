export interface ChecklistModel {
  title: string;
  priority?: string;
  description: string;
  tools?: string[];
  checked?: boolean;
  documentation?: string[];
  tags?: [];
  subitems?: CheckItem[];
}

export interface CheckItem {
  title: string;
  checked?: boolean;
  description: string;
}
