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
    <div className="h-full p-5 shadow-sm border">
      <div className="mt-5">
        {MenuList.map((menu, index) => (
          <div
            key={index}
            className={`flex gap-2 mb-2 p-3 hover:bg-purple-600 hover:text-white rounded-lg cursor-pointer ${path === menu.path ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => handleNavigation(menu.path)}
          >
            <menu.icon className="h-6 w-6" />
            <h2>{menu.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
