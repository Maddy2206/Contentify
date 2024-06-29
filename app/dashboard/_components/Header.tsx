"use client"

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

function Header() {
  const isSignedIn = useAuth();

  return (
    <div className='flex items-center justify-between py-3 px-5 shadow-sm'>
      <div className='flex items-center gap-2'>
      <Image src='https://cdn-icons-png.flaticon.com/128/8164/8164154.png' alt='logo' height={40} width={40} />
        <h1 className='font-bold text-2xl'>Contentify</h1>
      </div>
     
      <Link href={isSignedIn ? '/dashboard' : '/'}>
        <Button className='flex gap-2 bg-gradient-to-r from-purple-400 to-pink-600 rounded-lg hover:scale-105 transition-transform duration-150'>
          Get started
       
        </Button>
      </Link>
    </div>
  );
}

export default Header;
