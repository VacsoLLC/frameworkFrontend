import Html from './html/app.jsx';
import {useEffect, useState, useRef} from 'react';

import {api} from '../../lib/usebackend.js';

// we do a lot of work here to make sure that the images are loaded correctly. the SRC of each image is just its id. we pull it down via the api with a token in the header then swap it in.

export function edit({
  columnId,
  settings,
  dropdownOptions,

  value,
  handleChange,
  recordId,
}) {
  return (
    <Edit
      columnId={columnId}
      settings={settings}
      value={value}
      handleChange={handleChange}
      recordId={recordId}
    />
  );
}

export function Edit({
  columnId,
  settings,
  dropdownOptions,

  value,
  handleChange,
  recordId,
}) {
  const cleanupRef = useRef(null);

  // Add cleanup effect
  useEffect(() => {
    // Cleanup function when component unmounts
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []); // Empty dependency array since we only want to clean up on unmount

  return (
    <>
      <Html
        id={columnId}
        name={columnId}
        placeholder={settings.helpText}
        onChange={(value) => {
          handleChange(columnId, value);
          //loadAuthenticatedImages();
        }}
        onReady={(editor) => {
          loadAuthenticatedImages();
          cleanupRef.current = setupImageObserver();
        }}
        value={value || ''}
        key={columnId}
        recordId={recordId}
      />
    </>
  );
}

export function read({value}) {
  return <Read value={value} />;
}

export function Read({value}) {
  useEffect(() => {
    loadAuthenticatedImages();
  }, [value]);
  return <div class="ck-content" dangerouslySetInnerHTML={{__html: value}} />;
}

export async function loadAuthenticatedImages() {
  // Find all images in your div
  const images = document.querySelector('.ck-content').querySelectorAll('img');

  console.log('Looking for updated images!');

  for (const img of images) {
    const recordId = img.getAttribute('src');

    if (
      recordId.startsWith('blob') ||
      recordId.startsWith('data') ||
      recordId.startsWith('http')
    )
      continue;

    try {
      const url = await api.getWindowUrl(
        `/api/core/attachment/download/${recordId}`,
      );
      img.src = url;
    } catch (error) {
      console.error('Error loading image:', error);
    }
  }
}

export function setupImageObserver() {
  const observer = new MutationObserver((mutations) => {
    const hasChanges = mutations.some((mutation) => {
      // Check for added nodes
      if (mutation.addedNodes.length) {
        return Array.from(mutation.addedNodes).some((node) => {
          return (
            node instanceof HTMLImageElement ||
            (node instanceof HTMLElement && node.querySelector('img'))
          );
        });
      }
      // Check for attribute changes on images
      return (
        mutation.type === 'attributes' &&
        mutation.target instanceof HTMLImageElement &&
        mutation.attributeName === 'src'
      );
    });

    if (hasChanges) {
      loadAuthenticatedImages();
    }
  });

  // Start observing
  const editorContent = document.querySelector('.ck-content');
  if (editorContent) {
    observer.observe(editorContent, {
      childList: true, // Watch for added/removed nodes
      subtree: true, // Watch all descendants
      attributes: true, // Watch attributes
      attributeFilter: ['src'], // Only watch src attribute changes
    });
  }

  return () => observer.disconnect();
}
