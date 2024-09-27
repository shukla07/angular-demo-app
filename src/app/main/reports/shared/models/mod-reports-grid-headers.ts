import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ReportsActionIconsComponent} from '../../conference-reports/reports-action-icons/reports-action-icons.component';
import {ReportsListHeaderComponent} from '../../conference-reports/reports-list-header/reports-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('requestorName');
  col.header = 'Requestor Name';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('hcpOrPayorName');
  col.header = 'HCP/Payor Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('requestSentDate');
  col.header = 'Request Sent Date';
  col.headerComponent = ReportsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('requestAcceptedDate');
  col.header = 'Request Accept Date';
  columnDefinition.push(col);

  col = new VmslGridColumn('duration');
  col.header = 'Call Duration';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = ReportsActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
