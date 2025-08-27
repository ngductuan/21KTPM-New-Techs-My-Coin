"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SendPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to wallet page where sending functionality is integrated
    router.push("/wallet")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center">
      <div className="text-white text-lg">Redirecting to wallet...</div>
    </div>
  )
}
