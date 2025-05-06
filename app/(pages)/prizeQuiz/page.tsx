import React from 'react'
import PrizeQuiz from '@/app/components/prizeQuiz/PrizeQuiz'

function Page() {
  return (
    <main className="flex-1 bg-gray-50 overflow-x-auto">
      <div className="min-h-screen p-8">
        <div className="w-full min-w-fit bg-white rounded-lg shadow">
          <PrizeQuiz />
        </div>
      </div>
    </main>
  )
}

export default Page 