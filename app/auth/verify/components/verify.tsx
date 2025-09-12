"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Loader2, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { api } from "@/trpc/react";

// OTP verification schema
const otpVerificationSchema = z.object({
  otp: z
    .string()
    .min(6, "Verification code must be 6 characters")
    .max(6, "Verification code must be 6 characters")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

type OTPVerificationValues = z.infer<typeof otpVerificationSchema>;

export function OTPVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email] = useQueryState("email");

  const router = useRouter();
  const sessionObject = useSession();

  const { data: session, status } = sessionObject;

  const form = useForm<OTPVerificationValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: resendOTP, isPending: isResendingOTP } =
    api.auth.users.signin.useMutation({
      onSuccess: (data) => {
        toast.success(
          "Verification code sent successfully! Please check your email",
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled() {
        setIsResending(false);
      },
    });

  const { mutate: verify, isPending: isVerifying } =
    api.auth.users.verify.useMutation({
      async onSuccess(data, variables, context) {
        toast.success("Code verified successfully!");

        if (data.access_token && data.refresh_token) {
          const res = await signIn("supabase", {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            redirect: false,
          });

          console.log(res);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled() {
        setIsLoading(false);
      },
    });

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check authentication status and redirect accordingly
  useEffect(() => {
    console.log(status);
    console.log(session);
    if (status === "authenticated") {
      router.push("/");
    }
  }, [session]);

  const onSubmit = async (data: OTPVerificationValues) => {
    if (!email) {
      toast.error("Email not found. Please try logging in again.");
      return;
    }
    verify({
      email: email,
      otp: data.otp,
    });
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email not found. Please try logging in again.");
      return;
    }
    resendOTP({
      email: email,
    });
    setIsResending(true);
    //   resendOTP(email, {
    //     onSettled: () => {
    //       setIsResending(false);
    //     },
    //     onSuccess: () => {
    //       toast.success("Verification code resent successfully!");
    //       setCountdown(60);
    //       form.clearErrors("otp");
    //       form.setValue("otp", "");
    //     },
    //     onError: () => {
    //       toast.error("Failed to resend verification code");
    //     },
    //   });
  };

  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  // Show loading while checking session status
  if (status === "loading") {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Show loading while email is being set
  if (!email) {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      <Card className="border-border/80 shadow-md rounded-md">
        {/* <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-6" >
          <div className="space-y-2 text-center">
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>Code sent to:</span>
            </div>
            <p className="text-sm font-medium">{email}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="otp">Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        id="otp"
                        placeholder="123456"
                        type="text"
                        maxLength={6}
                        autoComplete="one-time-code"
                        disabled={isLoading}
                        className="text-center font-mono text-lg tracking-widest focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-muted-foreground text-center text-xs">
                      Enter the 6-digit code sent to your email
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={
                  isLoading || !form.watch("otp") || form.watch("otp")?.length !== 6
                }
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          <div className="space-y-4">
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                {isResendingOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="px-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </div>

          <div className="text-muted-foreground space-y-1 text-center text-xs">
            <p>Didn&apos;t receive the code?</p>
            <p>Check your spam folder or try resending</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
