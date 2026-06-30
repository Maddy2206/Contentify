"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Layers, Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Props {
  id: number
  aiResponse: string
  templateName: string
  templateIcon?: string
  templateCategory?: string
  createdAt: string
}

export default function EditContentClient({
  id,
  aiResponse,
  templateName,
  templateIcon,
  templateCategory,
  createdAt,
}: Props) {
  const router = useRouter()
  const [value, setValue] = useState(aiResponse)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiResponse: value }),
      })
      if (!res.ok) throw new Error()
      toast.success('Changes saved!')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy.')
    }
  }

  return (
    <div className='p-5 max-w-5xl mx-auto'>
      {/* Back button */}
      <div className='mb-5'>
        <Button variant='ghost' size='sm' onClick={() => router.back()} className='text-gray-500 hover:text-gray-800'>
          <ArrowLeft className='w-4 h-4 mr-1.5' /> Back
        </Button>
      </div>

      {/* Meta header */}
      <div className='flex items-center gap-4 mb-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm'>
        <div className='w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0'>
          {templateIcon ? (
            <Image src={templateIcon} width={28} height={28} alt={templateName} />
          ) : (
            <Layers className='w-6 h-6 text-purple-400' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <h1 className='text-lg font-bold text-gray-900 truncate'>{templateName}</h1>
          <div className='flex items-center gap-2 mt-0.5'>
            {templateCategory && (
              <span className='text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium'>
                {templateCategory}
              </span>
            )}
            <span className='text-xs text-gray-400'>Created {createdAt}</span>
          </div>
        </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          <Button variant='outline' size='sm' onClick={handleCopy}>
            <Copy className='w-4 h-4 mr-1.5' /> Copy
          </Button>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={saving}
            className='bg-purple-600 hover:bg-purple-700 text-white'
          >
            <Save className='w-4 h-4 mr-1.5' />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4' data-color-mode='light'>
        <MDEditor
          value={value}
          onChange={(v) => setValue(v ?? '')}
          height={600}
          preview='live'
        />
      </div>

      <ToastContainer position='bottom-right' autoClose={2000} />
    </div>
  )
}
