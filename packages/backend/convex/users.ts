import { query, mutation } from "./_generated/server"  //It does not modify data

export const getMany = query({
    args: {},                                 //No input expected
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        
        return users;
    }
})

export const add = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("Not authenticated");
        }
        const userId = await ctx.db.insert("users", {
            name: "Vallen",
        });
        return userId;
    },
})