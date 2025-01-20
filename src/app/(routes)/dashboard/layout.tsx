import type { ReactNode } from "react";

const layout: React.FC<Readonly<{ children: ReactNode }>> = ({ children }) => {
  return <div>{children}</div>;
};

export default layout;
