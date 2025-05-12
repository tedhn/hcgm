"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const DashboardPage = () => {
  const { mutate, isPending } = api.user.sendEmail.useMutation();

  const handleSendEmail = async () => {
    mutate({ email: "heinhtetnaing186@gmail.com" });
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <Button onClick={handleSendEmail}>SEND EMAIL</Button>
    </div>
  );
};

export default DashboardPage;
