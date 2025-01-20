import React from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const InputWithLabel = () => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  );
};

export default InputWithLabel;
