import {defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    goals: defineTable({
        title: v.string(),
        userId: v.string(),
        isArchived: v.boolean(),
        content: v.optional(v.string()),
        color: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
})