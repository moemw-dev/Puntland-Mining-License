
'use server';
import { signIn, signOut } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import bcrypt, { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { AuthCredentials } from "@/types";
import { deleteUserSchema } from "@/types/user-schema";
import { actionClient } from "../safe-action";
// const bcrypt = require("bcryptjs")


// Define the role type to match your database schema
type UserRole = "SUPER_ADMIN" | "MINISTER" | "GENERAL_DIRECTOR" | "DIRECTOR" | "OFFICER"

// Define the update data type based on your users schema
type UserUpdateData = {
  name?: string
  email?: string
  updatedAt?: Date
  password?: string
  role?: UserRole
}


export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
}

// Signup function
export const signUp = async (params: AuthCredentials) => {

  const { name, email, password } = params;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { success: true };

  } catch (error) {
    return { success: false, error: "Signup error" + error };
  }
}

//signout function
export async function handleSignOut() {
  await signOut();
}

// Update user function with proper typing - FIXED VERSION
export const updateUser = async (
  userId: string,
  params: { name: string; email: string; password?: string; role?: string },
): Promise<{ success: true } | { success: false; error: string }> => {
  const { name, email, password, role } = params

  try {
    // Validate input
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" }
    }

    if (!email) {
      return { success: false, error: "Email is required" }
    }

    // Check if email is already taken by another user
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      return { success: false, error: "Email already exists" }
    }

    // Prepare update data with proper typing
    const updateData: UserUpdateData = {
      name: name.trim(),
      email,
      updatedAt: new Date(),
    }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await hash(password, 10)
    }

    // Only update role if provided - FIXED VALIDATION AND TYPING
    if (role) {
      const validRoles: UserRole[] = ["SUPER_ADMIN", "MINISTER", "GENERAL_DIRECTOR", "DIRECTOR", "OFFICER"]
      const upperRole = role.toUpperCase() as UserRole

      if (!validRoles.includes(upperRole)) {
        return { success: false, error: "Invalid role specified" }
      }
      updateData.role = upperRole
    }

    await db.update(users).set(updateData).where(eq(users.id, userId))

    revalidatePath("/users")

    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: "Update error: " + error }
  }
}
// Update user profile function
export const updateUserProfile = async (userId: string, data: { name: string }) => {
  try {
    // Validate input
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" }
    }

    // Update user in database
    await db
      .update(users)
      .set({
        name: data.name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Revalidate the profile page to reflect changes
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// Update user password function
export const updateUserPassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
  try {
    // Validate input
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (!data.currentPassword || !data.newPassword) {
      return { success: false, error: "Current and new passwords are required" }
    }

    if (data.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" }
    }

    // Get the user to verify current password
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (userResult.length === 0) {
      return { success: false, error: "User not found" }
    }

    const user = userResult[0]

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password as string)

    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Hash the new password
    const hashedPassword = await hash(data.newPassword, 10)

    // Update the password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return { success: true }
  } catch (error) {
    console.error("Update password error:", error)
    return { success: false, error: "Failed to update password" }
  }
}


// Create the delete license action
export const DeleteUser = actionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      // Delete the license where the id matches
      await db.delete(users).where(eq(users.id, id));

      return { success: "License deleted successfully" };
    } catch (error) {
      console.error("Error deleting license:", error);
      return { error: "Failed to delete license" };
    }
  });