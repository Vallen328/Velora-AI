import { v } from "convex/values";
import { internalQuery } from "../_generated/server";


//internal Query is practically same thing as normal query API wise but it can only be called within other convex functions.
//In here, I add something that u either want to use in actions because remember actions are not the same as mutations. Actions are separate runtime., so in order to access this convex database through an action, you are going to need to have internal query. Or if u want to protect something so it's not publicly available.
export const getOne = internalQuery({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.contactSessionId);
    }
});