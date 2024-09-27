import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {JobTitlesManagementActionIconComponent} from '../../job-titles-management-action-icon/job-titles-management-action-icon.component';
import {JobTitleHeaderComponent} from '../../job-title-header/job-title-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('jobTitle');
  col.header = 'Role';
  col.popoverField = 'jobTitle';
  col.headerComponent = JobTitleHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('description');
  col.header = 'Role Description';
  col.popoverField = 'description';
  col.headerComponent = JobTitleHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('createdOn');
  col.header = 'Date Created';
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = JobTitlesManagementActionIconComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
