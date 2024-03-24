import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {AuditActionIconsComponent} from '../../auditlogs-action-icons/audit-action-icons.component';

export const columnDefinitions = () => {
  const columnDefinition = [];

  let col = new VmslGridColumn('logType');
  col.header = 'Log Type';
  columnDefinition.push(col);

  col = new VmslGridColumn('operationName');
  col.header = 'Operation Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('operationTime');
  col.header = 'Time of Activity';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = AuditActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
