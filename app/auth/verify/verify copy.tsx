"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useQueryState } from 'nuqs'
import { useMount } from "react-use";
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
  const sessionObject  = useSession();
  
  const { data: session, status } = sessionObject

  const form = useForm<OTPVerificationValues>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: "",
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
  useEffect(
    () => {
      if (status === "authenticated") {
        router.push("/");
      }
    },
    [status]
  )

  const onSubmit = async (data: OTPVerificationValues) => {
      const result = await signIn("credentials", {
        email: email,
        otp: data.otp,
        redirect: false,
      });


      if(result?.error) {
        toast.error("Failed to verify code");
      } else {
        toast.success("Code verified successfully!");
        router.push("/dashboard");
      }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email not found. Please try logging in again.");
      return;
    }

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
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  // Show loading while email is being set
  if (!email) {
    return (
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <CheckAuth /> */}
      {/* Email Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Code sent to:</span>
        </div>
        <p className="font-medium text-sm">{email}</p>
      </div>

      {/* OTP Form */}
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
                    className="text-center text-lg tracking-widest font-mono"
                    {...field}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isLoading || !form.watch("otp") || form.watch("otp")?.length !== 6}
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

      {/* Resend and Back Options */}
      <div className="space-y-4">
        {/* Resend OTP Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendOTP}
            disabled={isResending || countdown > 0}
            className="w-full"
          >
            {isResending ? (
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

        {/* Back to Login */}
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

      {/* Help Text */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Didn&apos;t receive the code?</p>
        <p>Check your spam folder or try resending</p>
      </div>
    </div>
  );
}
