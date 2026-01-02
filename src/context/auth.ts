import { createContext } from "react";

interface IAuthContext {
  authenticated: true;
  setAuthStatus: (status: boolean) => void;
}

export const AuthContext = createContext<IAuthContext>({
  authenticated: true,
  setAuthStatus: () => {},
});

export const AuthProvider = AuthContext.Provider;

export default AuthContext;
