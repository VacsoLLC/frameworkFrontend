import {ButtonView, Plugin} from 'ckeditor5';
import {UploadImageModal} from './UploadImageModal';

export class CustomImageUploadPlugin extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('customImageUpload', (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: 'Insert image',

        tooltip: true,
      });

      button.on('execute', () => {
        // Open the modal
        const modal = new UploadImageModal(editor);
        modal.render();
      });

      return button;
    });
  }
}
