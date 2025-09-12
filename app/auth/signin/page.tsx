import { type Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./components/form";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
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
          <h1 className="text-3xl font-semibold">Welcome</h1>
          <p className="text-primary-foreground/80 mt-2">Sign in to continue</p>
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 px-6 sm:w-[460px]">
        <LoginForm />
      </div>
    </div>
  );
}
