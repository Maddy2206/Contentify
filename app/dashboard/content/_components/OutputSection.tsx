"use client"
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Props {
  output: string;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, '').trim())
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function OutputSection({ output }: Props) {
  const [value, setValue] = useState<string>(output);

  useEffect(() => {
    setValue(output);
  }, [output]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(value));
      toast.success('Text copied to clipboard!');
    } catch {
      toast.error('Failed to copy text.');
    }
  };

  return (
    <div className='bg-white shadow-lg border rounded-lg p-4' data-color-mode="light">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-1" /> Copy
        </Button>
      </div>
      <MDEditor
        value={value}
        onChange={(v) => setValue(v ?? '')}
        height={600}
        preview="live"
      />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default OutputSection;
