"use client"
import React from 'react';
import TypewriterComponent from 'typewriter-effect';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
function Hero() {
  const isSignedIn = useAuth();

  return (
    <section className="bg-gray-900 text-white">
    <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
      <div className="mx-auto max-w-4xl text-center flex flex-col gap-3 mb-5">
        <div className='flex flex-col gap-3'>
        <h1
          className="bg-white bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl"
        >
         Unlock AI powered capabilities for
        </h1>
        <div className='text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 '>
        <TypewriterComponent
        options={{
            strings: [
                "Blog Generation",
                "Email Writing",
                "Article Creation",
                "Instagram Posts",
                "Code Automation",
                "Product Descriptions",
                "Removing Plagiarism",
              ],
              autoStart: true,
              loop: true,
              cursor: '',
        }}/>
        </div>
      
        </div>
        <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
         Accelerate content creation upto 10x faster with AI
        </p>
  
        <div className="mb-6 flex flex-wrap justify-center gap-4">
            <Link href={isSignedIn?'/dashboard':'/'}>
            <Button
            className=" flex gap-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg hover:scale-105 transition-transform duration-150"
          >
          Start Generating 
          <Image src='https://cdn-icons-png.flaticon.com/128/7334/7334113.png' alt='stars' width={20} height={20} ></Image>
          </Button>
          </Link>
          
        </div>
      </div>
    </div>
  </section>
  );
}

export default Hero;
