"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentCountdownTimerProps {
  orderCreatedAt: string
  timeoutMinutes?: number
  onTimeout?: () => void
  className?: string
}

export function PaymentCountdownTimer({ 
  orderCreatedAt, 
  timeoutMinutes = 10, 
  onTimeout,
  className 
}: PaymentCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const orderTime = new Date(orderCreatedAt).getTime()
      const timeoutMs = timeoutMinutes * 60 * 1000
      const timeLeftMs = timeoutMs - (now - orderTime)
      
      return Math.max(0, Math.floor(timeLeftMs / 1000))
    }

    const updateTimer = () => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true)
        onTimeout?.()
      }
    }

    // Initial calculation
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [orderCreatedAt, timeoutMinutes, onTimeout, isExpired])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (isExpired) return "text-red-600"
    if (timeLeft <= 60) return "text-red-500" // Last minute
    if (timeLeft <= 180) return "text-orange-500" // Last 3 minutes
    return "text-blue-600"
  }

  const getBackgroundColor = () => {
    if (isExpired) return "bg-red-50 border-red-200"
    if (timeLeft <= 60) return "bg-red-50 border-red-200"
    if (timeLeft <= 180) return "bg-orange-50 border-orange-200"
    return "bg-blue-50 border-blue-200"
  }

  if (isExpired) {
    return (
      <Card className={cn("border-2 border-red-200 bg-red-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Payment Time Expired</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Your order will be automatically cancelled. Please refresh the page to start over.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-2", getBackgroundColor(), className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Complete payment within:</span>
              <span className={cn("text-2xl font-bold font-mono", getTimeColor())}>
                {formatTime(timeLeft)}
              </span>
            </div>
            {timeLeft <= 180 && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Please complete your payment soon to avoid automatic cancellation
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
