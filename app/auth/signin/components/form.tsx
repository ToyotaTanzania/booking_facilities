"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMount } from "react-use";
import { toast } from "sonner";
import { api } from "@/trpc/react";

// Form validation schema
const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  token: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenSent, setIsTokenSent] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  const { mutate: searchUser, isPending: isSearching } =
    api.auth.users.signin.useMutation({
        onSuccess: async (data: { user: null; session: null; messageId?: string | null } | { success: boolean }) => {
          const { success, email } = data as { success: boolean; email: string }
          if (success) {
            toast.success("Login credentials sent to your email");
            router.push(`/auth/verify?email=${email}`); 
          }
        }, 
        onError: (error) => { 
          toast.error("Unknown user, Please contact administrator")
        }
    })

  useMount(() => {
    if (status === "authenticated") {
      router.push("/");
    } else {
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      token: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const { email, token } = data;
    if (isSearching) {
      toast.error("Please wait for the previous request to complete");
      return;
    }

    searchUser({
      email: data?.email
    })
  };

  const handleResendCode = async () => {
    if (!form.getValues("email")) {
      form.setError("email", { message: "Please enter your email first" });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically call your API to resend the verification code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success message or handle as needed
    } catch (error) {
      console.error("Error resending code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setIsTokenSent(false);
    form.reset();
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || isTokenSent}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isTokenSent && (
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="token">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      id="token"
                      placeholder="123456"
                      type="text"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="cursor-pointer" disabled={isSearching}>
            {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTokenSent ? "Verify Code" : "Sign In with Email"}
          </Button>
        </form>
      </Form>

      {isTokenSent && (
        <div className="space-y-4">
          <div className="text-muted-foreground text-center text-sm">
            Check your email for the verification code.
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Resend Code"
              )}
            </Button>

            <Button
              variant="link"
              size="sm"
              className="cursor-pointer"
              onClick={handleUseDifferentEmail}
              disabled={isLoading}
            >
              Use a different email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
