"use client"

import React, { useState } from 'react'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
interface PROPS{
    selectedTemplate?:TEMPLATE;
    userFormInput:any;
    loading:boolean;

}

function FormSection({selectedTemplate,userFormInput,loading}:PROPS) {

const [formData,setFormData]=useState<any>();

const handleInputChange=(event:any)=>{
  const {name,value}=event.target;
  setFormData({...formData,[name]:value})
}

const onSubmit=(e:any)=>{
    e.preventDefault();
    userFormInput(formData);
}




  return (
    <div className='p-5 shadow-md border rounded-lg'>
        {/* @ts-ignore*/}
        <Image src={selectedTemplate?.icon} alt ='icon' height={70} width={70}></Image>
         <h2 className='font-bold text-2xl mb-2 '>{selectedTemplate?.name}</h2>
         <p className='text-slate-500 text-sm'>{selectedTemplate?.desc}</p>

        <form className='mt-6' onSubmit={onSubmit}>
            {selectedTemplate?.form?.map((item,index)=>(
                <div className='my-2 flex flex-col gap-2 mb-7'>
                    <label className='font-bold'> {item.label}</label>
                    {item.field=='input'?
                    <Input name={item.name} required={item?.required} onChange={handleInputChange}  />:
                    item.field=='textarea'?
                        <Textarea name={item.name} required={item?.required} onChange={handleInputChange}/>:null
                    
                }
                </div>
            ))}
           <Button type ='submit' className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 rounded-md shadow-md hover:scale-105 transition-all w-full py-6' disabled={loading}> {loading&&<Loader2Icon className='animate-spin'/>} Generate content +</Button>
        </form>


    </div>
  )
}

export default FormSection