"use client";

import React from "react";
import SideNav from "./_components/SideNav";

import HeaderDashboard from "./_components/Header_dashboard";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed w-full h-full">
      <HeaderDashboard />
      <div className="flex h-full">
        <div className="w-64 fixed h-full">
          <SideNav />
        </div>
        <div className="ml-64 flex-1 overflow-auto relative">
          {children}
        </div>
      </div>
    </div>
  );
  
}

export default Layout;
