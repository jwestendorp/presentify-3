import {
  createFileRoute,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import Workspace from "../components/workspace";

export const Route = createFileRoute("/canvas/$canvasId")({
  component: Index,
});

function Index() {
  // const { canvasId } = useLoaderData();
  const { canvasId } = Route.useParams();
  return (
    <div className="p-2 h-full w-full flex flex-col gap-4">
      <h1>{canvasId}</h1>
      <Workspace canvasId={canvasId} />
    </div>
  );
}
