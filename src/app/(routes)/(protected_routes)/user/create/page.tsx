"use client";
import React from "react";
import BackButton from "~/app/_components/back-button";
import { Button } from "~/components/ui/button";
import InputWithLabel from "~/components/ui/input-with-label";
import { useIsMobile } from "~/hooks/useMobile";

const CreateUserPage = () => {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isMobile = useIsMobile();

  return (
    <div className="w-full px-0 pt-4 lg:px-14">
      {!isMobile && <BackButton />}

      <h1 className="my-0 mb-10 text-3xl lg:my-10">Create User</h1>

      <div className="flex w-full flex-col gap-6 lg:w-fit">
        <InputWithLabel label="Name" value={name} setValue={setName} />
        <InputWithLabel label="Phone" value={phone} setValue={setPhone} />
        <InputWithLabel label="Email" value={email} setValue={setEmail} />
        <InputWithLabel
          label="Password"
          value={password}
          setValue={setPassword}
        />

        <Button className="w-fit">Create</Button>
      </div>
    </div>
  );
};

export default CreateUserPage;
