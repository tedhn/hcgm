"use client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/ui/loader";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import InputWithLabel from "~/components/ui/input-with-label";
import { useUserStore } from "~/lib/store/useUserStore";
import toast from "react-hot-toast";
import type { UserType } from "~/lib/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { setUser } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync, isPending, error, isError } = api.user.login.useMutation(
    {
      onSuccess: (data) => {
        console.log("data", data);

        setUser(data);
        localStorage.setItem("USER-HCGM", JSON.stringify(data));

        return router.push("/dashboard");
      },
      onError: (error) => {
        console.log("error", error.message);
      },
    },
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const promise = mutateAsync({ email, password });

    toast
      .promise(promise, {
        loading: "Logging in...",
        success: "Login successful",
        error: "Login failed",
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("USER-HCGM");
    if (storedUser) {
      const userData = JSON.parse(storedUser) as UserType;
      setUser(userData);
      redirect("/dashboard");
    }
  }, [setUser]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <InputWithLabel label="Email" value={email} setValue={setEmail} />

              <InputWithLabel
                label="Password"
                value={password}
                setValue={setPassword}
              />
              {/*             
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="forget-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  disabled={isPending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div> */}

              {error && isError && (
                <div className="text-xs text-red-500">{error.message}</div>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <LoadingSpinner /> : "Login"}
              </Button>
              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
            {/* <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
