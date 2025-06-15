"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteSample } from "@/lib/actions/sample.action"

export type TSample = {
  id: string
  ref_id: string
  name: string
  passport_no: string
  kilo_gram: string
  created_at?: string
  updated_at?: string
}

interface SampleActionsCellProps {
  sample: TSample
}

export function SampleActionsCell({ sample }: SampleActionsCellProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Close the dialog first for better UX
      setIsDeleteDialogOpen(false)

      // Show loading toast
      toast.promise(DeleteSample({ id: sample.id }), {
        loading: "Deleting sample...",
        success: (result) => {
          router.refresh()
          return "Sample deleted successfully"+result
        },
        error: (error) => {
          console.error("Delete error:", error)
          return "Failed to delete sample"
        },
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  // Handle opening delete dialog
  const handleOpenDeleteDialog = () => {
    // Close dropdown first, then open dialog after a brief delay
    setIsDropdownOpen(false)
    setTimeout(() => {
      setIsDeleteDialogOpen(true)
    }, 100)
  }

  // Handle copy to clipboard
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(sample.ref_id)
      toast.success("ID copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy ID"+error)
    }
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/sample-analysis/${sample.id}`} className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenDeleteDialog}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sample for {sample.name} ({sample.ref_id}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
