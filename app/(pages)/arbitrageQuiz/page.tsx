import React from 'react'
import ArbitrageQuiz from '@/app/components/arbitrageQuiz/ArbitrageQuiz'

function Page() {
  return (
    <main className="flex-1 bg-gray-50 overflow-x-auto">
      <div className="min-h-screen p-8">
        <div className="w-full min-w-fit bg-white rounded-lg shadow">
          <ArbitrageQuiz />
        </div>
      </div>
    </main>
  )
}

export default Page
