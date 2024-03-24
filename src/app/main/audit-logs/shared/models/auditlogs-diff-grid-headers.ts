import { VmslGridColumn } from '@vmsl/shared/vmsl-grid/wrapper-classes';

export const diffColumnDefinitions = () => {
    const columnDefinition = [];

    let col = new VmslGridColumn('property');
    col.header = 'Property Name';
    columnDefinition.push(col);

    col = new VmslGridColumn('before');
    col.header = 'Previous Value';
    columnDefinition.push(col);

    col = new VmslGridColumn('after');
    col.header = 'New Value';
    columnDefinition.push(col);

    return columnDefinition;
};
