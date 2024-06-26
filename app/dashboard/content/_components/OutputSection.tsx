import React, { useEffect, useRef } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  output: string;
}

function OutputSection({ output }: Props) {
  const editorRef: any = useRef();

  useEffect(() => {
    const editorInstance = editorRef.current.getInstance();
    editorInstance.setMarkdown(output);
  }, [output]);

  const copyToClipboard = () => {
    const editorInstance = editorRef.current.getInstance();
    const markdown = editorInstance.getMarkdown();
    navigator.clipboard.writeText(markdown)
      .then(() => {
        toast.success('Text copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy text.');
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className='bg-white shadow-lg border rounded-lg'>
      <div className='flex justify-end items-center p-2'>
        <Button className='flex gap-2' onClick={copyToClipboard}>
          <Copy className='w-4 h-4' /> 
          Copy
        </Button>
      </div>
      <Editor
        ref={editorRef}
        initialValue="Your result appears here"
        previewStyle="vertical"
        height="600px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        onChange={() => console.log(editorRef.current.getInstance().getMarkdown())}
      />
      <ToastContainer />
    </div>
  );
}

export default OutputSection;
