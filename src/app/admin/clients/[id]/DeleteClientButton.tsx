'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteUser } from '@/app/actions/clients'

export function DeleteClientButton({ userId }: { userId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this client? This will delete all their orders and is irreversible.')) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                router.push('/admin/clients')
                router.refresh()
            } else {
                alert(`Failed to delete client: ${JSON.stringify(result.error)}`)
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
        >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Client'}
        </button>
    )
}
