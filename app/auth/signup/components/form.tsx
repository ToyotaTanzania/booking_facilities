"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";

// Form validation schema
const loginFormSchema = z.object({
  name: z.string(),
  phone: z.string(),
  unit: z.string(),
  segment: z.string(),
  division: z.string(),
  legal_entity: z.string(),
  isActive: z.string(),
  role: z.string(),
  email: z.string().email("Please enter a valid email address"),
  token: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenSent, setIsTokenSent] = useState(false);

  const { status } = useSession();
  const router = useRouter();

  const { mutate: searchUser, isPending: isSearching } =
    api.auth.users.create.useMutation({
      onSuccess: async (
        data:
          | { user: null; session: null; messageId?: string | null }
          | { success: boolean },
      ) => {
        const { success, email } = data as { success: boolean; email: string };
        router.push(`/auth/verify?email=${email}`);
        // if (success) {
        //   toast.success("Login credentials sent to your email");
        //   router.push(`/auth/verify?email=${email}`);
        // }
      },
      onError: (error) => {
        toast.error("Unknown user, Please contact administrator");
      },
    });

  useMount(() => {
    if (status === "authenticated") {
      router.push("/");
    } else {
    }
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      unit: "",
      segment: "",
      division: "",
      legal_entity: "",
      isActive: "",
      role: "",
      email: ""
    },
  });

  const onSubmit = async (data: LoginFormValues) => {

    // console.log("Form Data: ", data);
    // if (isSearching) {
    //   toast.error("Please wait for the previous request to complete");
    //   return;
    // }

    searchUser(data);

  };


  const handleUseDifferentEmail = () => {
    setIsTokenSent(false);
    form.reset();
  };

  return (
    <div className="grid gap-6">
      {/* Small-screen brand header (hidden on lg and up) */}
      <div className="flex items-center justify-center lg:hidden">
        <Image
          src="https://ik.imagekit.io/ttltz/brands/one/one-colored_H32SW3x_4.png?updatedAt=1757667292237"
          alt="Brand"
          width={140}
          height={40}
          className="h-10 w-auto"
          priority
        />
      </div>

      <Card className="border-border/80 rounded-sm shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Sign up with your work email</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        type="text"
                        autoCapitalize="words"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="phone">Phone</FormLabel>
                    <FormControl>
                      <Input
                        id="phone"
                        placeholder="+255 712 345 678"
                        type="text"
                        autoComplete="tel"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="unit">Unit</FormLabel>
                    <FormControl>
                      <Input
                        id="unit"
                        placeholder="Business Unit"
                        type="text"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="segment">Segment</FormLabel>
                    <FormControl>
                      <Input
                        id="segment"
                        placeholder="Segment"
                        type="text"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="division">Division</FormLabel>
                    <FormControl>
                      <Input
                        id="division"
                        placeholder="Division"
                        type="text"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="legal_entity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="legal_entity">Legal Entity</FormLabel>
                    <FormControl>
                      <Input
                        id="legal_entity"
                        placeholder="Company Ltd"
                        type="text"
                        autoCorrect="off"
                        disabled={isLoading || isTokenSent}
                        className="focus-visible:ring-primary rounderd-sm focus-visible:ring-offset-background border border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSearching}
              >
                {isSearching && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isTokenSent ? "Verify Code" : "Sign Up"}
              </Button>
              {/* <Button type="submit" className="cursor-pointer w-full" disabled={isSearching}>
                {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isTokenSent ? "Verify Code" : "Sign In with Email"}
              </Button> */}
            </form>
          </Form>
        </CardContent>
        {isTokenSent && (
          <CardFooter className="flex-col items-stretch gap-2">
            <div className="text-muted-foreground w-full text-center text-sm">
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
