import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ReportsActionIconsComponent} from '../../conference-reports/reports-action-icons/reports-action-icons.component';
import {ReportsListHeaderComponent} from '../../conference-reports/reports-list-header/reports-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('userName');
  col.header = 'User Name';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('noShowCount');
  col.header = 'Count of No Show';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = ReportsActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
