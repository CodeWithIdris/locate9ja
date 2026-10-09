import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/verify/$publicId")({
  validateSearch: (search) => z.object({ t: z.string().optional() }).parse(search),
  beforeLoad: ({ params, search }) => { throw redirect({ to: "/v/$publicId", params: { publicId: params.publicId }, search: { t: search.t } }); },
});