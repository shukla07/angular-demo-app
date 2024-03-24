import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {ActionIconLinkComponent} from '@vmsl/shared/vmsl-grid/components/action-icon-link/action-icon-link.component';
import {UserListHeaderComponent} from '../../user-list-header/user-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('fullName');
  col.header = 'User Name';
  col.headerComponent = UserListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('createdBy');
  col.header = 'Created By';
  col.headerComponent = UserListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('role');
  col.header = 'Platform Role';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = ActionIconLinkComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
