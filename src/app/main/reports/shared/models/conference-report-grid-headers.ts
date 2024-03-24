import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ReportsActionIconsComponent} from '../../conference-reports/reports-action-icons/reports-action-icons.component';
import {ReportsListHeaderComponent} from '../../conference-reports/reports-list-header/reports-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('eventName');
  col.header = 'Event Name';
  col.skipOnAutoSize = true;
  col.popoverField = 'eventName';
  columnDefinition.push(col);

  col = new VmslGridColumn('eventType');
  col.header = 'Event Type';
  columnDefinition.push(col);

  col = new VmslGridColumn('startDateTime');
  col.header = 'Start Date Time';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('duration');
  col.header = 'Duration';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('status');
  col.header = 'Status';
  columnDefinition.push(col);

  col = new VmslGridColumn('createdByName');
  col.header = 'Created By';
  columnDefinition.push(col);

  col = new VmslGridColumn('organizer');
  col.header = 'Organizer';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = ReportsActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
