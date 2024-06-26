"use client"
import React, { useState } from 'react';
import FormSection from '../_components/FormSection';
import OutputSection from '../_components/OutputSection';
import { TEMPLATE } from '../../_components/TemplateListSection';
import Templates from '@/app/(data)/Templates';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatSession } from '@/utils/AIModel';
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment'




interface PROPS {
  params: {
    'template-slug': string;
  };
}

function CreateNewContent(props: PROPS) {
  const [loading, setLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const {user}=useUser();
  const selectedTemplate: TEMPLATE | undefined = Templates?.find((item) => item?.slug === props.params['template-slug']);

  const GenerateAIContent = async (formData: any) => {
    setLoading(true);
    try {
      const selectedPrompt = selectedTemplate?.aiPrompt;
      const FinalAIPrompt = JSON.stringify(formData) + ", " + selectedPrompt;
  
      const result = await chatSession.sendMessage(FinalAIPrompt);
      const responseText = await result.response.text();
      setOutput(responseText);
  
      await SaveInDb(formData, selectedTemplate?.slug, responseText);
    } catch (error) {
      console.error("Error generating AI content:", error);
      setOutput("An error occurred while generating content.");
    } finally {
      setLoading(false);
    }
  };
  


  const SaveInDb=async(formData:any,slug:any,aiResp:string)=>{
    const result=await db.insert(AIOutput).values({
      formData:formData,
      templateSlug:slug,
      aiResponse:aiResp,
      createdBy:user?.primaryEmailAddress?.emailAddress,
      createdAt:moment().format('DD/MM/YYYY')
    }).execute();

  }

  return (
    <div className='p-5'>
      <Link href={'/dashboard'}>
        <Button><ArrowLeft /> Back</Button>
      </Link>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 p-5'>
        <FormSection selectedTemplate={selectedTemplate} userFormInput={(v: any) => GenerateAIContent(v)} loading={loading} />
        <div className='col-span-2'>
          <OutputSection output={output} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewContent;
