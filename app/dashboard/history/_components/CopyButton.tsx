"use client"

import { Button } from '@/components/ui/button';
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CopyButton({ aiResponse }: any) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse)
      .then(() => {
        toast.success('Text copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy text.');
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div>
      <Button variant='ghost' className='text-primary' onClick={copyToClipboard}>
        Copy
      </Button>
    </div>
  );
}

export default CopyButton;
