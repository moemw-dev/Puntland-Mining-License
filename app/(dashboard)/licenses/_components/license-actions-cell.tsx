"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Pencil, Trash, Check, X } from "lucide-react"
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
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { DeleteLicense, UpdateLicenseStatus } from "@/lib/actions/licenses.action"
import type { License } from "../column"

interface LicenseActionsCellProps {
  license: License
}

export function LicenseActionsCell({ license }: LicenseActionsCellProps) {
  const { data: session } = useSession()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  // Check if user has admin privileges
  const hasAdminPrivileges = ["GENERAL_DIRECTOR","DIRECTOR", "MINISTER"].includes(session?.user?.role || "")

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Close the dialog first for better UX
      setIsDeleteDialogOpen(false)

      // Show loading toast
      toast.promise(DeleteLicense({ license_ref_id: license.license_ref_id }), {
        loading: "Deleting license...",
        success: (result) => {
          router.refresh()
          return "License deleted successfully"+result
        },
        error: (error) => {
          console.error("Delete error:", error)
          return "Failed to delete license"
        },
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: "PENDING" | "APPROVED" | "REVOKED") => {
    try {
      // Close dropdown when performing action
      setIsDropdownOpen(false)

      toast.promise(UpdateLicenseStatus({ id: license.id, status: newStatus }), {
        loading: `${newStatus === "APPROVED" ? "Approving" : "Updating"} license...`,
        success: () => {
          router.refresh()
          return `License ${newStatus.toLowerCase()} successfully`
        },
        error: (error) => {
          console.error("Status update error:", error)
          return "Failed to update license status"
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
      await navigator.clipboard.writeText(license.license_ref_id)
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
            <Link href={`/licenses/${license.id}`} className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/licenses/edit/${license.id}`} className="flex items-center">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          {/* Status update actions - only for admin users */}
          {hasAdminPrivileges && (
            <>
              <DropdownMenuSeparator />
              {license.status === "PENDING" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("APPROVED")}
                  className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}
              {license.status !== "REVOKED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("REVOKED")}
                  className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950"
                >
                  <X className="mr-2 h-4 w-4" />
                  Revoke
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Delete action - only for admin users */}
          {hasAdminPrivileges && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleOpenDeleteDialog}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the license for {license.company_name} ({license.license_ref_id}). This
              action cannot be undone.
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
