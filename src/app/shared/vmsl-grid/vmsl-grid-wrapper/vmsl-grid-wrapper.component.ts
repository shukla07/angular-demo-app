import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {
  IVmslGrid,
  IVmslGridOptions,
  IVmslGridColumn,
} from '../wrapper-interfaces';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'vmsl-grid',
  templateUrl: './vmsl-grid-wrapper.component.html',
  styleUrls: ['./vmsl-grid-wrapper.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VmslGridComponent implements IVmslGrid {
  constructor() {
    const defaultValue = 10;
    this.optionValue = defaultValue;
  }

  ngOnInit() {
    this.eventSubscription = this.dropdownCount.subscribe(resp => {
      this.optionValue = resp;
    });
  }

  public theme = 'ag-theme-alpine';
  public gridApi;
  public optionValue;
  eventSubscription: Subscription;

  @Output() onGridReady = new EventEmitter();

  @Output() rowChecked = new EventEmitter();

  @Output() itemsPerPage = new EventEmitter();

  @Input('vmsl-row-selection')
  rowSelection;

  @Input('vmsl-data')
  datasource;

  @Input('vmsl-floating-filter')
  public floatingFilter;

  @Input()
  dropdownCount: Observable<number>;

  @Input('vmsl-norows-template')
  noRowsTemplate;

  @Input()
  itemsPerPageList: number[];

  columnDef = [];

  //This logic is for default values in the grid.

  private _defaultGridDef: IVmslGridOptions = {
    resizable: true,
  };
  public get defaultGridDef(): IVmslGridOptions {
    return this._defaultGridDef;
  }
  @Input('vmsl-grid-defaults')
  public set defaultGridDef(value: IVmslGridOptions) {
    this._defaultGridDef = value;
  }

  //This logic maps the Column headers with its respective data.
  private _columnDefinition: IVmslGridColumn[];
  public get columnDefinition() {
    return this._columnDefinition;
  }
  @Input('vmsl-column-definition')
  public set columnDefinition(value: IVmslGridColumn[]) {
    this._columnDefinition = value;
    this.bindColumnHeader();
  }

  //This logic will map the column properties to the grid sent from the component.
  bindColumnHeader() {
    this.columnDef = [];
    this.columnDefinition.forEach(col => {
      this.columnDef.push({
        headerName: col.header,
        field: col.key,
        width: col.width,
        maxWidth: col.maxWidth,
        resizable: col.resizable || this.defaultGridDef.resizable,
        sortable: col.allowSorting,
        sort: col.sortOrder,
        filter: col.filterType || col.filterable,
        floatingFilterComponentParams: {suppressFilterButton: true},
        cellRendererFramework: col.cellRenderer,
        headerComponentFramework: col.headerComponent,
        suppressMenu: true,
        hide: col.hidden,
        checkboxSelection: col.checkbox,
        headerCheckboxSelection: col.checkboxHeader,
        tooltipField: col.popoverField,
        cellStyle: col.cellStyle,
        autoHeight: col.autoHeight,
      });
    });
  }

  onPageSizeChanged() {
    window.scrollTo({top: 0, behavior: 'smooth'});
    this.itemsPerPage.emit(this.optionValue);
    this.gridApi.paginationSetPageSize(Number(this.optionValue));
  }

  onRowSelected(event) {
    this.gridApi.paginationSetPageSize(Number(this.optionValue));
    this.rowChecked.emit(event);
  }

  gridReadyHandler(data) {
    this.onGridReady.emit(data);
    this.gridApi = data.api;
  }
}
