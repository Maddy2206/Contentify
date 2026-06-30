"use client"
import React, { useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Templates from '@/app/(data)/Templates'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PROPS {
  params: {
    'template-slug': string
  }
}

function CreateNewContent(props: PROPS) {
  const [loading, setLoading] = useState<boolean>(false)
  const [output, setOutput] = useState<string>('')
  const [contentPieceId, setContentPieceId] = useState<number | null>(null)

  const selectedTemplate: TEMPLATE | undefined = Templates?.find(
    (item) => item?.slug === props.params['template-slug'],
  )

  const GenerateAIContent = async (formData: any) => {
    setLoading(true)
    try {
      const FinalAIPrompt = JSON.stringify(formData) + ', ' + selectedTemplate?.aiPrompt

      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: FinalAIPrompt }),
      })

      if (!res.ok) throw new Error('Generation failed')

      const { content } = await res.json()
      setOutput(content)

      const saveRes = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          templateSlug: selectedTemplate?.slug,
          aiResponse: content,
        }),
      })

      if (saveRes.ok) {
        const { contentPieceId: id } = await saveRes.json()
        setContentPieceId(id)
      }
    } catch (error) {
      console.error('Error generating AI content:', error)
      setOutput('An error occurred while generating content.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-5'>
      <Link href={'/dashboard'}>
        <Button><ArrowLeft /> Back</Button>
      </Link>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 p-5'>
        <FormSection
          selectedTemplate={selectedTemplate}
          userFormInput={(v: any) => GenerateAIContent(v)}
          loading={loading}
        />
        <div className='col-span-2'>
          <OutputSection output={output} />
        </div>
      </div>
    </div>
  )
}

export default CreateNewContent
