import {AngularEditorConfig} from '@kolkov/angular-editor';

export class InMailConfig {
  static editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    fonts: [
      {class: 'open sans', name: 'Open Sans'},
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'},
    ],
  };
}
