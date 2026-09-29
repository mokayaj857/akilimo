import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/satellite")({
  beforeLoad: () => {
    throw redirect({ to: "/crop-health" });
  },
  component: () => null,
});
