import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { upsertSecret } from "../lib/secrets";

export const upsert = internalAction({
    args: {
        organizationId: v.string(),
        service: v.union(v.literal("vapi")),
        value: v.any(),
    },
    handler: async (ctx, args) => {
        const secretName = `tenant/${args.organizationId}/${args.service}`;
        //tenant/1234/vapi
        await upsertSecret(secretName, args.value);

        //Now, let's go ahead and also create the plugin record in our db becasue right now, when user calls this action, well user will never call this action becoz it is internal but even when we call it, sure AWS will recieve this new secret under this specific tenant name but we are never actually going to store secretName inside of our table so we will never know how to retrive it back!
        //Now, we go inside of convex/system and create new file called plugins.ts

        await ctx.runMutation(internal.system.plugins.upsert, {
            service: args.service,
            secretName,
            organizationId: args.organizationId,
        });

        return { status: "success" };
    },
});

