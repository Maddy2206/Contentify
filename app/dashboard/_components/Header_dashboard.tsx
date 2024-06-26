"use client"

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
function HeaderDashboard() {
  const isSignedIn = useAuth();

  return (
    <div className='flex items-center justify-between py-3 px-5 border-b shadow-sm'>
      <div className='flex items-center gap-2'>
      <Image src='https://cdn-icons-png.flaticon.com/128/8164/8164154.png' alt='logo' height={20} width={20} />
        <h1 className='font-bold text-xl'>Contentify</h1>
      </div>
      
      <UserButton></UserButton>
    </div>
  );
}

export default HeaderDashboard;
