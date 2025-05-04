import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { api, HydrateClient } from "~/trpc/server";

export default async function Home({ children } : {children : ReactNode}) {
  redirect("/auth/login");

  // const users = await api.user.getAll();

  return (
    <HydrateClient>
      {/* <h1>Home</h1> */}
      {children}
    </HydrateClient>
  );
}
