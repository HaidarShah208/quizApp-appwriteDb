import React from 'react'
import Dashboard from '@/app/components/Dashboard'

export default function ArbitrageQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Dashboard />
      {children}
    </div>
  )
} 