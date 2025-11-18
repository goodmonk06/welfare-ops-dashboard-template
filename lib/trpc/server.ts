import { initTRPC } from "@trpc/server";
import { prisma } from "@/lib/prisma";

export const createTRPCContext = async () => {
  return {
    prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
