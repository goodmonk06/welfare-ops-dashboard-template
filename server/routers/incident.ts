import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

export const incidentRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.incident.findMany({
      orderBy: { occurredAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.incident.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        occurredAt: z.date(),
        severity: z.enum(["low", "medium", "high"]),
        category: z.string(),
        reportedBy: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.incident.create({
        data: input,
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["reported", "investigating", "resolved"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.incident.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.incident.delete({
        where: { id: input.id },
      });
    }),
});
