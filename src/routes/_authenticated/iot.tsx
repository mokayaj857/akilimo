import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/iot")({
  beforeLoad: () => {
    throw redirect({ to: "/digital-twin" });
  },
  component: () => null,
});
