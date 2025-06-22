import {v} from "convex/values";
import {mutation, query} from "./_generated/server";
import {Doc, Id} from "./_generated/dataModel";

export const archive = mutation({
    args: {id: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unathorized");
        }

        const goal = await ctx.db.patch(args.id, {
            isArchived: true,
        })

        return goal;
    }
})

export const getSidebar = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const goals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) =>
                q
                    .eq("userId", userId)
            )
            .filter((q) =>
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect();

        return goals;
    }
})

export const create = mutation({
    args: {
        title: v.string(),
        content: v.optional(v.string()),
        color: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        // Validate date overlap only if dates are provided
        if (args.startDate || args.endDate) {
            // Get all existing goals for this user
            const existingGoals = await ctx.db
                .query("goals")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) =>
                    q.and(
                        q.eq(q.field("isArchived"), false),
                        q.or(
                            q.neq(q.field("startDate"), undefined),
                            q.neq(q.field("endDate"), undefined)
                        )
                    )
                )
                .collect();

            // Check for overlaps
            const hasOverlap = checkDateOverlap(args.startDate, args.endDate, existingGoals);

            if (hasOverlap) {
                throw new Error("A goal already exists for the selected date(s)");
            }
        }

        const goal = await ctx.db.insert("goals", {
            title: args.title,
            content: args.content || "",
            userId,
            isArchived: false,
            color: args.color,
            startDate: args.startDate,
            endDate: args.endDate,
        });

        return goal;
    }
});

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const goals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.eq(q.field("isArchived"), true),
            )
            .order("desc")
            .collect();

        return goals;
    }
})

export const restore = mutation({
    args: {id: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const options: Partial<Doc<"goals">> = {
            isArchived: false
        };

        const goals = await ctx.db.patch(args.id, options);


        return goals;
    }
})

export const remove = mutation({
    args: {id: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const goal = await ctx.db.delete(args.id);

        return goal;
    }
});

export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const goals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.eq(q.field("isArchived"), false),
            )
            .order("desc")
            .collect();

        return goals;
    }
})

export const getById = query({
    args: {goalId: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const goal = await ctx.db.get(args.goalId);

        if(!goal) {
            throw new Error("Not found");
        }

        if (!goal.isArchived) {
            return goal;
        }

        if(!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        if (goal.userId !== userId) {
            throw new Error("Unauthorized")
        }

        return goal;
    }
});

export const update = mutation({
    args: {
        id: v.id("goals"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        color: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;
        const { id, ...rest } = args;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Only validate dates if they're being updated
        if (args.startDate !== undefined || args.endDate !== undefined) {
            // Get the updated start/end dates (use existing if not provided)
            const newStartDate = args.startDate !== undefined ? args.startDate : existingGoal.startDate;
            const newEndDate = args.endDate !== undefined ? args.endDate : existingGoal.endDate;

            // Get all other goals for this user (excluding current goal)
            const otherGoals = await ctx.db
                .query("goals")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .filter((q) =>
                    q.and(
                        q.eq(q.field("isArchived"), false),
                        q.neq(q.field("_id"), args.id), // Exclude current goal
                        q.or(
                            q.neq(q.field("startDate"), undefined),
                            q.neq(q.field("endDate"), undefined)
                        )
                    )
                )
                .collect();

            // Check for overlaps with other goals
            const hasOverlap = checkDateOverlap(newStartDate, newEndDate, otherGoals);

            if (hasOverlap) {
                throw new Error("A goal already exists for the selected date(s)");
            }
        }

        const goal = await ctx.db.patch(args.id, {
            ...rest,
        });

        return goal;
    },
});

export const getByYear = query({
    args: { year: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        // Get start and end of the year in milliseconds
        const yearStart = new Date(args.year, 0, 1).getTime();
        const yearEnd = new Date(args.year + 1, 0, 1).getTime() - 1;

        const goals = await ctx.db
            .query("goals")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("isArchived"), false),
                    q.or(
                        // Goal has start date in this year
                        q.and(
                            q.neq(q.field("startDate"), undefined),
                            q.gte(q.field("startDate"), yearStart),
                            q.lt(q.field("startDate"), yearEnd)
                        ),
                        // Goal has end date in this year
                        q.and(
                            q.neq(q.field("endDate"), undefined),
                            q.gte(q.field("endDate"), yearStart),
                            q.lt(q.field("endDate"), yearEnd)
                        ),
                        // Goal spans across this year (starts before, ends after)
                        q.and(
                            q.neq(q.field("startDate"), undefined),
                            q.neq(q.field("endDate"), undefined),
                            q.lt(q.field("startDate"), yearStart),
                            q.gt(q.field("endDate"), yearEnd)
                        )
                    )
                )
            )
            .collect();

        return goals;
    }
});

export const removeStartDate = mutation({
    args: {id: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const goal = await ctx.db.patch(args.id, {
            startDate: undefined
        });

        return goal;
    }
});

export const removeEndDate = mutation({
    args: {id: v.id("goals")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const existingGoal = await ctx.db.get(args.id);

        if (!existingGoal) {
            throw new Error("Not found");
        }

        if (existingGoal.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const goal = await ctx.db.patch(args.id, {
            endDate: undefined
        });

        return goal;
    }
});

const checkDateOverlap = (
    newStartDate: number | undefined,
    newEndDate: number | undefined,
    existingGoals: any[]
): boolean => {
    if (!newStartDate && !newEndDate) return false;

    return existingGoals.some(goal => {
        const goalStart = goal.startDate;
        const goalEnd = goal.endDate;

        if (!goalStart && !goalEnd) return false;

        // Case 1: New goal has both start and end dates
        if (newStartDate && newEndDate) {
            // Check if new range overlaps with existing goal
            if (goalStart && goalEnd) {
                // Both goals have ranges - check for overlap
                return !(newEndDate < goalStart || newStartDate > goalEnd);
            } else if (goalStart) {
                // Existing goal has only start date
                return newStartDate <= goalStart && newEndDate >= goalStart;
            } else if (goalEnd) {
                // Existing goal has only end date
                return newStartDate <= goalEnd && newEndDate >= goalEnd;
            }
        }

        // Case 2: New goal has only start date
        if (newStartDate && !newEndDate) {
            if (goalStart && goalEnd) {
                // Check if new start date is within existing range
                return newStartDate >= goalStart && newStartDate <= goalEnd;
            } else if (goalStart) {
                // Both have only start dates - check if same
                return newStartDate === goalStart;
            } else if (goalEnd) {
                // Check if new start equals existing end
                return newStartDate === goalEnd;
            }
        }

        // Case 3: New goal has only end date
        if (newEndDate && !newStartDate) {
            if (goalStart && goalEnd) {
                // Check if new end date is within existing range
                return newEndDate >= goalStart && newEndDate <= goalEnd;
            } else if (goalStart) {
                // Check if new end equals existing start
                return newEndDate === goalStart;
            } else if (goalEnd) {
                // Both have only end dates - check if same
                return newEndDate === goalEnd;
            }
        }

        return false;
    });
};

