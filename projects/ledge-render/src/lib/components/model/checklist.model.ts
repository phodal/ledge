export interface ChecklistModel {
  name: string;
  priority?: string;
  description: string;
  tools?: string[];
  checked?: boolean;
  documentation?: string[];
  tags?: [];
  subitems?: CheckItem[];
}

export interface CheckItem {
  name: string;
  checked?: boolean;
  description: string;
}
