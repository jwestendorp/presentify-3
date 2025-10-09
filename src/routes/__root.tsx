import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

import { Authenticated, Unauthenticated, useMutation } from "convex/react";

const RootLayout = () => {
  const navigate = useNavigate({ from: "/" });
  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <header className=" bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
          <div
            onClick={() => navigate({ to: "/" })}
            className="text-sm cursor-pointer"
          >
            Presentify 3
          </div>
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton />
            <SignUpButton />
          </Unauthenticated>
        </header>
        <hr />
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
