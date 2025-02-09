import {callBackend} from '../../../lib/usebackend';
import {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';

const UploadImageModalComp = ({editor, onClose}) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    // Fetch images from backend
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await callBackend({
        args: {
          pageId: 3,
        },
        packageName: 'core',
        className: 'page',
        methodName: 'getImagesForPage',
        auth: false,
        supressDialog: true,
      });
      console.log(response);
      setImages(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const handleInsert = () => {
    if (selectedImage) {
      editor.model.change((writer) => {
        const imageElement = writer.createElement('image', {
          src: selectedImage.url,
          alt: selectedImage.alt,
        });
        editor.model.insertContent(imageElement);
      });
    } else if (uploadedImage) {
      // Upload the image to your backend and then insert it
      uploadImageToBackend(uploadedImage).then((uploadedImageUrl) => {
        editor.model.change((writer) => {
          const imageElement = writer.createElement('image', {
            src: uploadedImageUrl,
            alt: uploadedImage.name,
          });
          editor.model.insertContent(imageElement);
        });
      });
    }
    onClose();
  };

  const uploadImageToBackend = async (file) => {
    // Implement your image upload logic here
    // Return the URL of the uploaded image
    return 'https://example.com/uploaded-image.jpg';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000">
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">Select or Upload an Image</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[].map((image) => (
            <div
              key={image.id}
              className={`cursor-pointer border-2 p-2 ${
                selectedImage?.id === image.id
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
              onClick={() => handleImageSelect(image)}
            >
              <img
                src={image.url || '/placeholder.svg'}
                alt={image.alt}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleInsert}
          >
            Insert
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export class UploadImageModal {
  constructor(editor) {
    this.editor = editor;
  }

  render() {
    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(wrapper);
      wrapper.remove();
    };

    ReactDOM.render(
      <UploadImageModalComp editor={this.editor} onClose={handleClose} />,
      wrapper,
    );
  }
}
