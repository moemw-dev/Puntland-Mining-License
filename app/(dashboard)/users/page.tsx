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

//fetch license data from api
async function getUsers(): Promise<TUsers[]> {
  const res = await fetch(`${config.env.apiEndpoint}/api/users`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-cache'
  })
  const data = await res.json()
  return data;
}

const Page = async () => {
  const data =  await getUsers()

  if(!data) return <div>Loading...</div>
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
      <UsersList data={data} />
    </div>
  );
};

export default Page;
