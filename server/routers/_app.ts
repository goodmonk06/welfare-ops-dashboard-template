import { router } from "@/lib/trpc/server";
import { residentRouter } from "./resident";
import { staffRouter } from "./staff";
import { shiftRouter } from "./shift";
import { incidentRouter } from "./incident";

export const appRouter = router({
  resident: residentRouter,
  staff: staffRouter,
  shift: shiftRouter,
  incident: incidentRouter,
});

export type AppRouter = typeof appRouter;
