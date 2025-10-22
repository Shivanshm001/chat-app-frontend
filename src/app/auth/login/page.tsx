'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { express } from "@/lib/axios";
import { useApiErrorHandler } from "@/lib/hooks/useApiErrorHandler";
import { useAppDispatch } from "@/redux/hooks";
import { setUserInfo, UserI } from "@/redux/slices/userSlice";
import { APIResponseI } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function LoginPage() {
    const dispatch = useAppDispatch();
  const handleAPIError = useApiErrorHandler()
  const router = useRouter();
  const loginSchema = z.object({
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
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const {
    formState: { errors },
  } = form;
  async function loginUser(data: LoginFormData) {
    const response = await express.post<APIResponseI<{user: UserI}>>("/auth/login", data);
    return response.data;
  }

  const mutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      const user = data.data?.user!;
      dispatch(setUserInfo(user))
      console.log("Login successful", user);
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      console.error("Login failed:", error);
      handleAPIError(error, "Login failed")
    },
  });


  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <MessageSquare className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Start chatting with your team
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-6"
        >
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Don't have an account?{" "}
          </span>
          <Link
            href={"/auth/register"}
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
