"use server";

import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AuthState } from "@/types/auth";

export async function registerAction(
  prevState: any,
  formData: FormData,
): Promise<AuthState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in all fields." };
  }

  let createdUser = null;

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      })
      .returning();

    if (!newUser) {
      return { error: "Failed to create user. Please try again." };
    }

    createdUser = newUser;
    await createSession(newUser.id, newUser.email, newUser.name, newUser.role);
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "Something went wrong." };
  }

  if (createdUser) {
    return {
      success: true,
      user: {
        name: createdUser.name,
        email: createdUser.email,
        password,
      },
    };
  }
  return {};
}

export async function loginAction(
  prevState: any,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter email and password." };
  }

  let authenticated = false;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { error: "Invalid email or password." };
    }

    await createSession(user.id, user.email, user.name, user.role);
    authenticated = true;
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: error.message || "Something went wrong." };
  }

  if (authenticated) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });
    return {
      success: true,
      user: {
        name: user?.name || email,
        email: email.toLowerCase().trim(),
        password,
      },
    };
  }
  return {};
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
