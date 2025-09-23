import React, { ReactNode } from "react";
import AuthProvider from "@/context/auth_context";
import ThemeProvider from "@/context/theme_context";
import MenuProvider from "./menu_context";

type GlobalProviderProps = {
  children: ReactNode;
};

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MenuProvider>
          {children}
        </MenuProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default GlobalProvider;
