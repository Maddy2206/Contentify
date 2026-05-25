"use client"

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';

function HeaderDashboard({ onMenuClick }: { onMenuClick?: () => void }) {
  const isSignedIn = useAuth();

  return (
    <div className='flex items-center justify-between py-2 sm:py-3 px-3 sm:px-5 border-b shadow-sm bg-white'>
      <div className='flex items-center gap-2'>
        {/* Mobile menu button */}
        <button className="md:hidden mr-2" onClick={onMenuClick} aria-label="Open sidebar">
          <Menu className="w-6 h-6" />
        </button>
        <Image src='https://cdn-icons-png.flaticon.com/128/8164/8164154.png' alt='logo' height={24} width={24} className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className='font-bold text-lg sm:text-xl'>Contentify</h1>
      </div>
      <div className="mt-2 sm:mt-0">
        <UserButton />
      </div>
    </div>
  );
}

export default HeaderDashboard;
