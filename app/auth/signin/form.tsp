"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { cn } from "~/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"
import { useToast } from "@/components/ui/use-toast"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkUserMutation = api.auth.checkUserExists.useMutation({
    onSuccess: (data) => {
      if (data.exists) {
        toast({
          title: "OTP sent",
          description: "Please check your email for the OTP",
        });
        router.push(`/auth/otp?email=${encodeURIComponent(email)}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found. Please contact the administrator to request an account.",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await checkUserMutation.mutateAsync({ email });
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-24 w-24 items-center justify-center rounded-md">
                <Image
                  src="https://ik.imagekit.io/ttltz/logo-vertical_b8MVqm33G.png?updatedAt=1748507305943"
                  alt="Toyota Tanzania"
                  width={200}
                  height={200}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="sr-only">Toyota Tanzania</span>
            </span>
            <h1 className="text-xl font-bold">Toyota Tanzania</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="mailto:bakarim@toyota.co.tz" className="underline underline-offset-4">
                Request an account
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="h-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? "Sending..." : "Login"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
