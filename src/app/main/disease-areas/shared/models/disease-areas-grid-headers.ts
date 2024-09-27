import {ColumnSortingHeaderComponent} from '@vmsl/shared/components/column-sorting-header/column-sorting-header.component';
import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {DiseaseAreasActionIconComponent} from '../../disease-areas-action-icon/disease-areas-action-icon.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('name');
  col.header = 'Product/Disease Area Name';
  col.popoverField = 'name';
  col.headerComponent = ColumnSortingHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('description');
  col.header = 'Product/Disease Area Description';
  col.cellStyle = {
    'white-space': 'normal',
    'line-height': '1.2em',
    'text-align': 'center',
  };
  col.autoHeight = true;
  columnDefinition.push(col);

  col = new VmslGridColumn('createdOn');
  col.header = 'Date Created';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = DiseaseAreasActionIconComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
