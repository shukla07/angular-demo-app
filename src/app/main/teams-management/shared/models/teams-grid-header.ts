import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';
import {TeamsAvailabilityDaysComponent} from '../../teams-availability-days/teams-availability-days.component';
import {TeamsActionIconsComponent} from '../../teams-action-icons/teams-action-icons.component';
import {TeamsListHeaderComponent} from '../../teams-list-header/teams-list-header.component';

export const columnDefinitions = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn(null);
  col.checkbox = true;
  col.checkboxHeader = true;
  col.maxWidth = 40;
  columnDefinition.push(col);

  col = new VmslGridColumn('teamName');
  col.header = 'Team Name';
  col.headerComponent = TeamsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('createdByName');
  col.header = 'Created By';
  col.headerComponent = TeamsListHeaderComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn('availabilityDays');
  col.header = 'Availability Days';
  col.cellRenderer = TeamsAvailabilityDaysComponent;
  columnDefinition.push(col);

  col = new VmslGridColumn(null);
  col.header = 'Actions';
  col.cellRenderer = TeamsActionIconsComponent;
  columnDefinition.push(col);

  return columnDefinition;
};
