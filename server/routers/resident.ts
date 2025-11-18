import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";

export const residentRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.resident.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.resident.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        age: z.number(),
        roomNumber: z.string(),
        careLevel: z.number().min(1).max(5),
        medicalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.resident.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        age: z.number().optional(),
        roomNumber: z.string().optional(),
        careLevel: z.number().min(1).max(5).optional(),
        medicalInfo: z.string().optional(),
        status: z.enum(["active", "discharged"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.prisma.resident.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.resident.delete({
        where: { id: input.id },
      });
    }),
});
