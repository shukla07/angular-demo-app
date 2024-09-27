export interface IVmslGrid {
  datasource: Object[]; //binds the grid, in the case to local data.

  columnDefinition: IVmslGridColumn[];
}

export interface IVmslGridColumn {
  /* Property name for which all subsequent behavior applies
   */
  key: string;
  //Simple Grid properties
  header: string;
  width: number;
  maxWidth: number;
  height: number;

  //Column Data Type
  columnDataType: ColumnDataType;

  //Sorting
  allowSorting: boolean;
  sortOrder: string;

  //Resizable columns
  resizable: boolean; //We can also restrict resizing

  //Auto Height
  autoHeight: boolean; //Automatically adjust the height of the column based on the data.

  //particular header will not be considered when calculating the width of the column
  skipOnAutoSize: boolean;

  //Pin left/right
  /*
   */
  pinned: string; //this pins the column left side by default.
  pinAlign: ColumnPin; //determines if the column should be pinned left or right.(enum)

  //Column grouping
  enableGrouping: boolean;
  groupable: boolean; //apply for all column, either by the means of ngFor or by column.groupable = true;
  //groupName;

  //Hide Column
  hidden: boolean;

  //Column Moving
  movable: boolean; //in case of pinned columns, it makes it unpinned.

  //Inline Editing
  editable: boolean;

  //filtering
  filterable: boolean; //Filtering is enabled for each cell in grid. If this is set to false, filtering will be disabled.
  filterType: TypeFilter;

  //Cell Styling
  cellColor: (params: IParams) => {};
  cellRenderer: Object;
  cellStyle: Object;

  //Custom Header Component
  headerComponent: Object;

  //In order to hide the HeaderMenuTab
  suppressMenu: [];

  //To apply a checkbox selection in specific columns
  checkbox: boolean;
  checkboxHeader: boolean;

  //Tooltip for a column - accepts the column name as a string
  popoverField: string;
}

//This object has the properties that will have the default value for a functionlity in the grid.
export interface IVmslGridOptions {
  resizable: boolean;
}

export interface IParams {
  [key: string]: number | string | boolean | Date | null;
}

/**
 *Enums
 */
//Determines the type of Filter
export enum TypeFilter {
  byText = 'agTextColumnFilter',
  byNumber = 'agNumberColumnFilter',
  byDate = 'agDateColumnFilter',
}

//Data Type of the specific column
export enum ColumnDataType {
  number = 'number',
  string = 'string',
  date = 'date',
}

//To pin column left or right
export enum ColumnPin {
  left = 'left',
  right = 'right',
}
