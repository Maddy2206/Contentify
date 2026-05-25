"use client";

import { FileClock, Home } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

function SideNav() {
  const router = useRouter();

  const MenuList = [
    {
      name: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      name: 'History',
      icon: FileClock,
      path: '/dashboard/history'
    },
  ];

  const path = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  }

  return (
    <div className="h-full p-3 md:p-5 shadow-sm border bg-white">
      <div className="mt-3 md:mt-5">
        {MenuList.map((menu, index) => (
          <div
            key={index}
            className={`flex gap-2 mb-2 p-2 md:p-3 hover:bg-purple-600 hover:text-white rounded-lg cursor-pointer transition-colors duration-200 ${path === menu.path ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => handleNavigation(menu.path)}
          >
            <menu.icon className="h-5 w-5 md:h-6 md:w-6" />
            <h2 className="text-base md:text-lg">{menu.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
