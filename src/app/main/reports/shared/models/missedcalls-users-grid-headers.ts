import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import { ReportsColumnDataComponent } from '../../conference-reports/teams-missed-call-reports/reports-column-data/reports-column-data.component';

export const usersColumnDefinition = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('fullName');
  col.header = 'User Name';
  col.cellRenderer = ReportsColumnDataComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('roleName');
  col.header = 'Role Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('id');
  col.header = 'User Id';
  columnDefinition.push(col);

  col = new VmslGridColumn('email');
  col.header = 'User Email';
  columnDefinition.push(col);

  return columnDefinition;
};
