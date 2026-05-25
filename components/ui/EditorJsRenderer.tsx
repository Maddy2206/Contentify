import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
const Header = require('@editorjs/header');
// @ts-ignore
const List = require('@editorjs/list');
// @ts-ignore
const Paragraph = require('@editorjs/paragraph');


interface EditorJsRendererProps {
  data: any;
}

const HOLDER_ID = 'editorjs-renderer-holder';

const EditorJsRenderer: React.FC<EditorJsRendererProps> = ({ data }) => {
  const instanceRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.isReady
        .then(() => {
          if (typeof instanceRef.current?.destroy === 'function') {
            instanceRef.current.destroy();
          }
        })
        .catch(() => {});
      instanceRef.current = null;
    }
    instanceRef.current = new EditorJS({
      holder: HOLDER_ID,
      data,
      readOnly: true,
      tools: {
        header: Header,
        list: List,
        paragraph: Paragraph,
      },
    });
    return () => {
      if (instanceRef.current) {
        instanceRef.current.isReady
          .then(() => {
            if (typeof instanceRef.current?.destroy === 'function') {
              instanceRef.current.destroy();
            }
          })
          .catch(() => {});
        instanceRef.current = null;
      }
    };
  }, [data]);

  return <div id={HOLDER_ID} />;
};

export default EditorJsRenderer;
