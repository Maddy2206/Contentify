"use client"

import { Calendar, Check, Copy, FileText, Layers } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface ContentCardProps {
  id: number
  aiResponse: string
  templateName: string
  templateIcon?: string
  templateCategory?: string
  date: string
  words: number
}

export default function ContentCard({
  id,
  aiResponse,
  templateName,
  templateIcon,
  templateCategory,
  date,
  words,
}: ContentCardProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCardClick = () => router.push(`/dashboard/history/${id}`)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/history/${id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Content deleted.')
      router.refresh()
    } catch {
      toast.error('Failed to delete.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(aiResponse)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy.')
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className='bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group'
    >
      {/* Header */}
      <div className='px-5 py-4 flex items-center gap-3 border-b border-gray-50'>
        <div className='flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors'>
          {templateIcon ? (
            <Image src={templateIcon} width={22} height={22} alt={templateName} />
          ) : (
            <Layers className='w-5 h-5 text-purple-400' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-gray-900 truncate text-sm'>{templateName}</p>
          {templateCategory && (
            <span className='inline-block mt-0.5 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium'>
              {templateCategory}
            </span>
          )}
        </div>

        {/* Edit + Delete — fade in on hover */}
        <div className='flex items-center gap-1'>
          <button
            onClick={handleEdit}
            className='px-2.5 py-1 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors'
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              confirmDelete
                ? 'text-white bg-red-500 hover:bg-red-600'
                : 'text-red-500 bg-red-50 hover:bg-red-100'
            }`}
          >
            {confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Content preview */}
      <div className='px-5 py-4 flex-1'>
        <p className='text-gray-600 text-sm leading-relaxed line-clamp-6'>{aiResponse || '—'}</p>
      </div>

      {/* Footer */}
      <div className='px-5 py-3 border-t border-gray-50 flex items-center justify-between'>
        <div className='flex items-center gap-4 text-xs text-gray-400'>
          <span className='flex items-center gap-1.5'>
            <Calendar className='w-3.5 h-3.5' />
            {date}
          </span>
          <span className='flex items-center gap-1.5'>
            <FileText className='w-3.5 h-3.5' />
            {words.toLocaleString()} words
          </span>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
            copied
              ? 'text-green-600 bg-green-50'
              : 'text-purple-600 hover:bg-purple-50'
          }`}
        >
          {copied ? (
            <><Check className='w-3.5 h-3.5' />Copied</>
          ) : (
            <><Copy className='w-3.5 h-3.5' />Copy</>
          )}
        </button>
      </div>
    </div>
  )
}
