import UsersList from "@/components/users-list";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SignUpForm from "@/app/(auth)/_components/sign-up";
import config from "@/lib/config/config";

export type TUsers = {
  id: string
  name: string
  email: string
  role: string
}

async function getUsers(): Promise<TUsers[]> {
  try {
    const res = await fetch(`${config.env.apiEndpoint}/api/users`, {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'include', // ⬅️ muhiim
    });

    // If not OK, return empty array
    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Verify it's an array
    if (!Array.isArray(data)) {
      console.error("Unexpected response format:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}


const Page = async () => {
   const data = await getUsers();

  if (data.length === 0) {
    return <div>No users found or unauthorized access.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1>Users</h1>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Create User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription>
                  {/* add new user to system */}
                  Add a new user to your system.
                </DialogDescription>
              </DialogHeader>
                <DialogContent>
                  <SignUpForm/>
                </DialogContent>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <UsersList data={data} userCount={data.length} />
    </div>
  );
};

export default Page;
