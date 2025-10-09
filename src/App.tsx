"use client";

import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import React from "react";

import Workspace from "./components/workspace";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <main className="h-full w-full">
        <Authenticated>
          <EnsureUser />
          {/* <Content /> */}
          <Workspace />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </div>
  );
}

// Removed the unused Content demo component
