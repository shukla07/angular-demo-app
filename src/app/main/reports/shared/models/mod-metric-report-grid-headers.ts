import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('metric');
  col.header = 'Metric';
  columnDefinition.push(col);

  col = new VmslGridColumn('value');
  col.header = 'Value';
  columnDefinition.push(col);

  return columnDefinition;
};
