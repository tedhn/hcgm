import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const users = await api.user.getAll();

  return (
    <HydrateClient>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </HydrateClient>
  );
}
