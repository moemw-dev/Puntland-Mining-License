"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TUsers } from "@/app/(dashboard)/users/page";
import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { Button } from "./ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { DeleteUser } from "@/lib/actions/auth.action";
import { toast } from "sonner";

const UsersList = ({
  data,
  userCount,
}: {
  data: TUsers[];
  userCount: number;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TUsers | null>(null);
  const router = useRouter();

  // Handle delete action
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      // Close the dialog first for better UX
      setIsDeleteDialogOpen(false);

      // Show loading toast
      toast.promise(DeleteUser({ id: selectedUser.id }), {
        loading: "Deleting user...",
        success: () => {
          router.refresh();
          return "User deleted successfully";
        },
        error: (error) => {
          return "Failed to delete user" + error;
        },
      });
    } catch (error) {
      toast.error("An unexpected error occurred" + error);
    } finally {
      setSelectedUser(null);
    }
  };

  const openDeleteDialog = (user: TUsers) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of users in the system</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user: TUsers) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="text-right space-x-2 flex items-center justify-center gap-3">
                {userCount > 1 ? (
                 <Link href={`/users/${user.id}`} >
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(user)}
                    disabled={userCount === 1}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
                {}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(user)}
                  disabled={userCount === 1}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user {selectedUser?.name} (
              {selectedUser?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersList;
