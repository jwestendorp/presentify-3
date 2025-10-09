import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Unauthenticated, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Authenticated } from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const createCanvas = useMutation(api.canvases.createCanvas);
  const navigate = useNavigate({ from: "/" });
  const [canvasId, setCanvasId] = useState("");

  const handleCreateCanvas = async () => {
    const { canvasId } = await createCanvas();
    navigate({ to: "/canvas/$canvasId", params: { canvasId } });
  };
  return (
    <div className="p-2">
      <main className="h-full w-full">
        {/* <EnsureUser /> */}
        <div className="flex flex-col gap-12 w-96 mx-auto">
          <Authenticated>
            <MyCanvases />
          </Authenticated>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="border-2 border-slate-200 dark:border-slate-800 rounded-md p-2"
              value={canvasId}
              onChange={(e) => setCanvasId(e.target.value)}
            />
            <button
              className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
              onClick={() =>
                navigate({ to: "/canvas/$canvasId", params: { canvasId } })
              }
            >
              Join a Canvas
            </button>
          </div>
          {/* <Authenticated> */}
          <div className="flex flex-col gap-4">
            <button
              disabled={!isSignedIn}
              className={`${isSignedIn ? "" : "opacity-10"} bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2`}
              onClick={handleCreateCanvas}
            >
              Create a Canvas
            </button>
            <Unauthenticated>log in to create a canvas</Unauthenticated>
          </div>

          {/* </Authenticated> */}
        </div>
        {/* <Content /> */}
        {/* <Workspace /> */}
      </main>
    </div>
  );
}

function MyCanvases() {
  const myCanvases = useQuery(api.canvases.getUserCanvases);
  return (
    <div className="flex flex-col gap-4">
      <h3>My Canvases</h3>
      <ul>
        {myCanvases?.map((canvas) => (
          <li key={canvas._id}>
            <Link to="/canvas/$canvasId" params={{ canvasId: canvas._id }}>
              {canvas._id}
            </Link>
          </li>
        ))}
      </ul>
      <hr />
    </div>
  );
}

// function SignInForm() {
//   return (
//     <div className="flex flex-col gap-8 w-96 mx-auto">
//       <p>Log in to see the numbers</p>
//       <SignInButton mode="modal">
//         <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
//           Sign in
//         </button>
//       </SignInButton>
//       <SignUpButton mode="modal">
//         <button className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2">
//           Sign up
//         </button>
//       </SignUpButton>
//     </div>
//   );
// }

// function EnsureUser() {
//   const ensureUser = useMutation(api.myFunctions.ensureUser);
//   // Call once on mount; convex session will be authenticated here
//   React.useEffect(() => {
//     void ensureUser({});
//   }, [ensureUser]);
//   return null;
// }
