"use client";

import { type Metadata } from "next";
import { OTPVerificationForm } from "./components/verify"

export default function VerifyPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to your email address
          </p>
        </div>
        
        <OTPVerificationForm />
      </div>
    </div>
  );
}
