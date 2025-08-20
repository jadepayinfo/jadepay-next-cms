import { ReactNode } from 'react';

export const Container = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col bg-[--bg-container] justify-between h-[calc(100vh-68px)] overflow-y-auto scroll-ui">{children}</div>;
};
