import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {HcpActionIconComponent} from '../../hcp-action-icon/hcp-action-icon.component';

export const hcpColumnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('fullName');
  col.header = 'HCP Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('referralName');
  col.header = 'Referrer Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('referralRole');
  col.header = 'Referrer Platform Role';
  columnDefinition.push(col);

  col = new VmslGridColumn('referralStatus');
  col.header = 'Account Status';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = HcpActionIconComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
