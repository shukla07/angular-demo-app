import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ContentHeaderComponent} from '../../content-header/content-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('title');
  col.header = 'Content Name';
  col.popoverField = 'title';
  col.headerComponent = ContentHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('contentText');
  col.header = 'Content Description';
  col.cellStyle = {
    'white-space': 'normal',
    'line-height': '1.2em',
    'text-align': 'center',
  };
  col.autoHeight = true;
  columnDefinition.push(col);

  col = new VmslGridColumn('fileType');
  col.header = 'File Type';
  columnDefinition.push(col);

  return columnDefinition;
};
