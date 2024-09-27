import {VmslGridColumn} from '@vmsl/shared/vmsl-grid/wrapper-classes';

export const eventsColumnDefinition = () => {
  const columnDefinition = [];
  let col = new VmslGridColumn('summary');
  col.header = 'Event Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('eventType');
  col.header = 'Type of Event';
  columnDefinition.push(col);

  col = new VmslGridColumn('startDateTime');
  col.header = 'Time and Date';
  columnDefinition.push(col);

  col = new VmslGridColumn('teamName');
  col.header = 'Team Name';
  columnDefinition.push(col);

  col = new VmslGridColumn('createdByName');
  col.header = 'Created By';
  columnDefinition.push(col);

  col = new VmslGridColumn('organizerName');
  col.header = 'Organizer';
  columnDefinition.push(col);

  col = new VmslGridColumn('attendees');
  col.header = 'Attendees';
  columnDefinition.push(col);

  col = new VmslGridColumn('eventId');
  col.header = 'Event Id';
  columnDefinition.push(col);

  return columnDefinition;
};
