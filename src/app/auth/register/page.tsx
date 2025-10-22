'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import React from "react";
import z from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { express } from "@/lib/axios";
import {useMutation} from '@tanstack/react-query'
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter()
    const registerSchema = z
    .object({
      email: z.email("Invalid email address"),
      username: z
        .string()
        .min(1, "Username is required")
        .max(24, "Username is too long"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .refine(
          (val) => /[A-Z]/.test(val),
          "Password must contain at least one uppercase letter"
        )
        .refine(
          (val) => /[a-z]/.test(val),
          "Password must contain at least one lowercase letter"
        )
        .refine(
          (val) => /[0-9]/.test(val),
          "Password must contain at least one number"
        )
        .refine(
          (val) => /[^A-Za-z0-9]/.test(val),
          "Password must contain at least one special character"
        ),
      confirmPassword: z
        .string()
        .min(6, "Confirm Password must be at least 6 characters"),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
        });
      }
    });

     type RegisterFormSchema = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { errors },
  } = form;
  
  async function registerUser(data: RegisterFormSchema) {
    const response = await express.post("/auth/register", data);
    return response.data.data;
  }

  const mutation = useMutation({
    mutationKey: ["register"],
    mutationFn: registerUser,
    onSuccess: (user) => {
      console.log("Register successful", user);
      router.push("/auth/login");
      router.refresh();
    },
    onError: (error) => {
      // Handle login error, e.g., show an error message
      console.error("Login failed:", error);
    },
  });

  return (
    <>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <MessageSquare className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Start chatting with your team
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Jhon_Doe"
                {...form.register("username")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                {...form.register("confirmPassword")}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href={"/auth/login"}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
