import {
  IVmslGridColumn,
  ColumnDataType,
  ColumnPin,
  TypeFilter,
  IParams,
} from './wrapper-interfaces';

export class VmslGridColumn implements IVmslGridColumn {
  cellColor: (params: IParams) => {};
  filterType: TypeFilter;
  enableGrouping: boolean;
  key: string;
  header: string;
  width: number;
  maxWidth: number;
  height: number;
  columnDataType: ColumnDataType;
  allowSorting: boolean;
  sortOrder: string;
  resizable: boolean;
  pinned: string;
  pinAlign: ColumnPin;
  groupable: boolean;
  hidden: boolean;
  movable: boolean;
  editable: boolean;
  filterable: boolean;
  cellRenderer: Object;
  cellStyle: Object;
  headerComponent: Object;
  suppressMenu: [];
  popoverField: string;
  checkbox: boolean;
  checkboxHeader: boolean;
  skipOnAutoSize: boolean;
  autoHeight: boolean;

  constructor(key: string) {
    this.key = key;
  }
}
