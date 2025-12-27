"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, AlertTriangle } from "lucide-react"

export default function AutoCancelPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    cancelledCount?: number
    cancelledOrderIds?: string[]
  } | null>(null)

  const handleAutoCancel = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/auto-cancel-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          cancelledCount: data.cancelledCount,
          cancelledOrderIds: data.cancelledOrderIds
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to auto-cancel orders'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Auto-Cancel Orders
          </CardTitle>
          <CardDescription>
            Manually trigger the auto-cancel process for pending orders older than 10 minutes.
            This process will automatically cancel orders that have been pending for too long.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action will cancel all pending orders that are older than 10 minutes.
              Make sure you want to proceed before clicking the button below.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={handleAutoCancel} 
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Auto-Cancel Pending Orders'
              )}
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.success && result.cancelledCount !== undefined && (
                    <div className="text-sm text-gray-600">
                      <p>Orders cancelled: {result.cancelledCount}</p>
                      {result.cancelledOrderIds && result.cancelledOrderIds.length > 0 && (
                        <div>
                          <p className="font-medium mt-2">Cancelled Order IDs:</p>
                          <ul className="list-disc list-inside ml-2">
                            {result.cancelledOrderIds.map((orderId) => (
                              <li key={orderId} className="font-mono text-xs">{orderId}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <h4 className="font-medium">How it works:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Finds all orders with status "pending"</li>
              <li>Checks if they were created more than 10 minutes ago</li>
              <li>Updates their status to "cancelled"</li>
              <li>Sends email notifications to customers</li>
              <li>Sends Discord notifications to admin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
