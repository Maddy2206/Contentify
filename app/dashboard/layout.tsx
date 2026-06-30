"use client"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import SideNav from "./_components/SideNav"
import DashboardHeader from "./_components/Header_dashboard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "248px 1fr", minHeight: "100vh", background: "hsl(var(--app-bg))" }}>
      {/* Sidebar */}
      <aside style={{ borderRight: "1px solid hsl(var(--border))", background: "hsl(var(--background))", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <SideNav />
      </aside>

      {/* Main column */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, background: "hsl(var(--app-bg))" }}>
        <DashboardHeader />
        <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {children}
        </main>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        toastStyle={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", fontSize: "0.85rem" }}
      />
    </div>
  )
}
