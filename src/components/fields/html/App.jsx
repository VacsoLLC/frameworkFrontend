import {useState, useEffect, useRef, useMemo} from 'react';
import {uploadHandler} from '../../buttons/attachbutton.jsx';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {
  BalloonEditor,
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  Bookmark,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Heading,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  ShowBlocks,
  SimpleUploadAdapter,
  SourceEditing,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

import './App.css';

const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

let currentRecordId = null; // dumb

export default function App({value, placeholder, onChange, onReady, recordId}) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const editorRef2 = useRef(null);
  const editorWordCountRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  currentRecordId = recordId;

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const {editorConfig} = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            'heading',
            'blockQuote',
            'codeBlock',
            'horizontalLine',
            'bulletedList',
            'numberedList',
            'todoList',
            'alignment',
            'outdent',
            'indent',
            '|',
            'sourceEditing',
            'showBlocks',
            '-',
            'bold',
            'underline',
            'strikethrough',
            'link',
            '|',

            'insertImage',
            'insertImageViaUrl',
            'mediaEmbed',
            'insertTable',
          ],
          shouldNotGroupWhenFull: true,
        },
        extraPlugins: [MyCustomUploadAdapterPlugin],
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          BlockToolbar,
          Bold,
          Bookmark,
          CodeBlock,
          Essentials,
          FindAndReplace,
          Heading,
          HorizontalLine,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          ShowBlocks,
          SimpleUploadAdapter,
          SourceEditing,
          Strikethrough,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
          WordCount,
        ],
        balloonToolbar: ['bold', 'italic', 'strikethrough', 'link'],
        blockToolbar: [
          'heading',
          'blockQuote',
          'codeBlock',
          'horizontalLine',
          'bulletedList',
          'numberedList',
          'todoList',
          'alignment',
          'outdent',
          'indent',
        ],
        heading: {
          options: [
            {
              model: 'paragraph',
              title: 'Paragraph',
              class: 'ck-heading_paragraph',
            },
            {
              model: 'heading1',
              view: 'h1',
              title: 'Heading 1',
              class: 'ck-heading_heading1',
            },
            {
              model: 'heading2',
              view: 'h2',
              title: 'Heading 2',
              class: 'ck-heading_heading2',
            },
            {
              model: 'heading3',
              view: 'h3',
              title: 'Heading 3',
              class: 'ck-heading_heading3',
            },
            {
              model: 'heading4',
              view: 'h4',
              title: 'Heading 4',
              class: 'ck-heading_heading4',
            },
            {
              model: 'heading5',
              view: 'h5',
              title: 'Heading 5',
              class: 'ck-heading_heading5',
            },
            {
              model: 'heading6',
              view: 'h6',
              title: 'Heading 6',
              class: 'ck-heading_heading6',
            },
          ],
        },
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
          ],
        },
        initialData: '',
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file',
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        menuBar: {
          isVisible: true,
        },
        placeholder: 'Type or paste your content here!',
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties',
          ],
        },
      },
    };
  }, [isLayoutReady]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-block-toolbar editor-container_include-word-count"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                onReady={(editor) => {
                  editorRef2.current = editor;
                  if (onReady) onReady(editor);
                  const wordCount = editor.plugins.get('WordCount');
                  editorWordCountRef.current.appendChild(
                    wordCount.wordCountContainer,
                  );

                  editorMenuBarRef.current.appendChild(
                    editor.ui.view.menuBarView.element,
                  );
                }}
                onChange={(e) => {
                  onChange(editorRef2.current?.getData());
                }}
                onAfterDestroy={() => {
                  Array.from(editorWordCountRef.current.children).forEach(
                    (child) => child.remove(),
                  );

                  Array.from(editorMenuBarRef.current.children).forEach(
                    (child) => child.remove(),
                  );
                }}
                data={value}
              />
            )}
          </div>
        </div>
        <div
          className="editor_container__word-count"
          ref={editorWordCountRef}
        ></div>
      </div>
    </div>
  );
}

class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(async (file) => {
      return new Promise(async (resolve, reject) => {
        // Create FormData
        const response = await uploadHandler(
          [file],
          'core',
          'page',
          currentRecordId,
        );

        resolve({
          default: response.data.id,
        });

        if (!response.ok) {
          reject(response);
        }
      });
    });
  }

  abort() {
    // Abort upload if needed
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new UploadAdapter(loader);
  };
}
