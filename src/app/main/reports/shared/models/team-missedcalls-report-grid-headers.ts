import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ReportsActionIconsComponent} from '../../conference-reports/reports-action-icons/reports-action-icons.component';
import {ReportsListHeaderComponent} from '../../conference-reports/reports-list-header/reports-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('teamName');
  col.header = 'Team Name';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('eventName');
  col.header = 'Event Name';
  col.popoverField = 'eventName';
  columnDefinition.push(col);

  col = new VmslGridColumn('callType');
  col.header = 'Call Type';
  columnDefinition.push(col);

  col = new VmslGridColumn('startDateTime');
  col.header = 'Date & Time';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = ReportsActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
