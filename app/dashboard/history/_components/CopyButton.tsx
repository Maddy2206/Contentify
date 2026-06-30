"use client"

import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function CopyButton({ aiResponse }: { aiResponse: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard
      .writeText(aiResponse)
      .then(() => {
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => toast.error('Failed to copy.'))
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleCopy}
      className={`gap-1.5 text-xs font-medium transition-colors ${
        copied
          ? 'text-green-600 hover:text-green-600'
          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
      }`}
    >
      {copied ? (
        <><Check className='w-3.5 h-3.5' /> Copied</>
      ) : (
        <><Copy className='w-3.5 h-3.5' /> Copy</>
      )}
    </Button>
  )
}

export default CopyButton
