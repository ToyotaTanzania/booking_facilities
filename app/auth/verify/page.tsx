"use client";

import Image from "next/image";
import { Suspense } from "react";
import { OTPVerificationForm } from "./components/verify";
import { AspectRatio } from "@/components/ui/aspect-ratio";

function VerifyPageContent() {
  return (
    <div className="relative container grid h-screen lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="text-primary-foreground bg-primary relative hidden h-full flex-col p-10 lg:flex">
        <div className="absolute inset-0">
        <div className="relative h-full flex justify-center items-center w-full">
            <AspectRatio ratio={16 / 6}>
              <Image
                src="https://ik.imagekit.io/ttltz/tr:f-auto,dpr-auto,c-maintain_ratio/brands/one/one-white_vHLSTee57.png?updatedAt=1757667320721"
                alt="Brand"
                fill
                className="object-contain p-10"
                priority
              />
            </AspectRatio>
          </div>
        </div>
        <div className="relative z-10 mt-auto">
          <h1 className="text-3xl font-semibold">Verify</h1>
          <p className="mt-2 text-primary-foreground/80">Enter the code sent to your email</p>
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 px-6 sm:w-[460px]">
        <div className="lg:hidden flex items-center justify-center">
          <Image
            src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
            alt="Brand"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground">Enter the verification code sent to your email address</p>
        </div>
        <OTPVerificationForm />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="relative container grid h-screen lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 px-6 sm:w-[460px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Verify Your Email</h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
