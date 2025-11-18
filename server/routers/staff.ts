import { z } from "zod";
import { router, publicProcedure } from "@/lib/trpc/server";
import { logger } from "@/lib/core/logger";
import { metrics } from "@/lib/core/metrics";

export const staffRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          department: z.string().optional(),
          status: z.string().optional(),
          role: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};

      if (input?.department) filters.department = input.department;
      if (input?.status) filters.status = input.status;
      if (input?.role) filters.role = input.role;

      const staff = await ctx.prisma.staff.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { shifts: true },
          },
        },
      });

      metrics.trackBusinessMetric("staff.total", staff.length);
      return staff;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.staff.findUnique({
        where: { id: input.id },
        include: {
          shifts: {
            take: 10,
            orderBy: { date: "desc" },
          },
          reportedIncidents: {
            take: 5,
            orderBy: { occurredAt: "desc" },
          },
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        role: z.string().min(1, "Role is required"),
        department: z.string().optional(),
        email: z.string().email("Valid email is required"),
        phoneNumber: z.string().optional(),
        hireDate: z.date(),
        certifications: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Creating new staff member", { name: input.name, role: input.role });

      const staff = await ctx.prisma.staff.create({
        data: {
          ...input,
          certifications: input.certifications || [],
          tags: input.tags || [],
        },
      });

      logger.logAudit("create", "Staff", staff.id, { name: staff.name });
      metrics.recordCounter("staff.created", 1, { role: staff.role });

      return staff;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        department: z.string().optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave"]).optional(),
        certifications: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      logger.info("Updating staff member", { id });

      const staff = await ctx.prisma.staff.update({
        where: { id },
        data,
      });

      logger.logAudit("update", "Staff", staff.id, { changes: data });
      metrics.recordCounter("staff.updated", 1);

      return staff;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logger.warn("Deleting staff member", { id: input.id });

      const staff = await ctx.prisma.staff.delete({
        where: { id: input.id },
      });

      logger.logAudit("delete", "Staff", staff.id, { name: staff.name });
      metrics.recordCounter("staff.deleted", 1);

      return staff;
    }),
});
