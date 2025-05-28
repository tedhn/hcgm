"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { useUserStore } from "~/lib/store/useUserStore";
import { api } from "~/trpc/react";

const DashboardPage = () => {
  const { mutate, isPending } = api.user.sendEmail.useMutation();

  const { user } = useUserStore();

  const handleSendEmail = async () => {
    mutate({ email: "heinhtetnaing186@gmail.com" });
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{user?.NAME}</p>

      <Button onClick={handleSendEmail}>SEND EMAIL</Button>
    </div>
  );
};

export default DashboardPage;
