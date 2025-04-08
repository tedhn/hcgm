import { redirect } from "next/navigation";

import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  redirect("/auth/login");

  const users = await api.user.getAll();

  return (
    <HydrateClient>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
      asdf
    </HydrateClient>
  );
}
