import { ConvexError, v } from "convex/values";
import {
    contentHashFromArrayBuffer,
    Entry,
    EntryId,
    guessMimeTypeFromContents,
    guessMimeTypeFromExtension,
    vEntryId,
} from "@convex-dev/rag"
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

function guessMimeType(filename: string, bytes: ArrayBuffer) : string {
    return (
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) ||
        "application/octet-stream"
    );
};

//Delete file will be a mutation
export const deleteFile = mutation({
    args: {
        entryId: vEntryId,
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(identity == null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            });
        }
        
        const orgId = identity.orgId as string;
        
        if(!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        //After the user has confirmed their identification and organizationId, let's go ahead and attempt to see if we have permission to delete these embeddings.
        //Answer -> While searching for the namespace as our embeddings are stored in our organization namespace.

        const namespace = await rag.getNamespace(ctx, {
            namespace: orgId,
        });

        if(!namespace){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid namespace",
            });
        }
        
        const entry = await rag.getEntry(ctx, {
            entryId: args.entryId,
        });

        if(!entry){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Entry not found",
            });
        }

        if(entry.metadata?.uploadedBy !== orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID",
            });
        }

        if(entry.metadata?.storageId){
            await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">)
        }

        await rag.deleteAsync(ctx, {
            entryId: args.entryId
        });
    },
});

export const addFile = action({
    args: {
        filename: v.string(),
        mimeType: v.string(),
        bytes: v.bytes(),
        category: v.optional(v.string()),  //It will help usin enbedding and making it more specific
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(identity == null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            });
        }
        
        const orgId = identity.orgId as string;
        
        if(!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const { bytes, filename, category } = args;

        const mimeType = args.mimeType || guessMimeType(filename, bytes);
        const blob = new Blob([bytes], { type: mimeType });

        const storageId = await ctx.storage.store(blob);

        // We need to extract text content from whatever file we just uploaded. The way we are going to do that:

        const text = await extractTextContent(ctx, {
            storageId,
            filename,
            bytes,
            mimeType,
        });

        const { entryId, created } = await rag.add(ctx, {
            //NAMESPACE: it basically tells you, I should teach our AI something but for whose organization should I teach that. Only the user who is currently logged in and has a specific organization attached to them should be having these embeddings. It shoudln't be global. You only want this to be visible for that organization namespace. Because we dont want any randome user comes and upload files and making customers confuse! 
            namespace: orgId, 
            text,
            key: filename,
            title: filename,
            metadata: {
                storageId,           // Also important for file deletion
                uploadedBy: orgId,   // Important for Deletion
                filename,
                category: category ?? null,
            } as EntryMetaData,
            contentHash: await contentHashFromArrayBuffer(bytes)  // We need this to avoid reinserting if the file content hasn't changed
        });

        if(!created){
            console.debug("entry already exists, skipping upload metadata");
            await ctx.storage.delete(storageId);
        }

        return {
            url: await ctx.storage.getUrl(storageId),
            entryId,
        };
    },
});


export const list = query({
    args: {
        category: v.optional(v.string()),
        paginationOpts: paginationOptsValidator, 
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(identity == null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            });
        }
        
        const orgId = identity.orgId as string;
        
        if(!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const namespace = await rag.getNamespace(ctx, {
            namespace: orgId,
        });

        if(!namespace){
            return { page: [], isDone: true, continueCursor: "" };
        }

        const results = await rag.list(ctx, {
            namespaceId: namespace.namespaceId,
            paginationOpts: args.paginationOpts,
        });

        const files = await Promise.all(
            results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
        );

        const filteredFiles = args.category
            ? files.filter((file) => file.category === args.category)
            : files;

        return {
            page: filteredFiles,
            isDone: results.isDone,
            continueCursor: results.continueCursor,
        };
    },
});

export type PublicFile = {
    id: EntryId,
    name: string;
    type: string;
    size: string;
    status: "ready" | "processing" | "error";
    url: string | null;
    category?: string;
};

type EntryMetaData = {
    storageId: Id<"_storage">;
    uploadedBy: string;
    filename: string;
    category: string | null;
};

async function convertEntryToPublicFile(
    ctx: QueryCtx,
    entry: Entry,
) : Promise<PublicFile> {
    const metadata = entry.metadata as EntryMetaData | undefined;
    const storageId = metadata?.storageId;

    let filesize = "unknown";

    if(storageId){
        try{
            const storageMetadata = await ctx.db.system.get(storageId);
            if(storageMetadata){
                filesize = formatFileSize(storageMetadata.size);
            }
        }catch(error){
            console.error("Failed to get storage metadata: ", error)
        }
    }

    const filename = entry.key || "Unknown";
    const extension = filename.split(".").pop()?.toLowerCase() || "txt";

    let status: "ready" | "processing" | "error" = "error";
    if(entry.status === "ready"){
        status = "ready"
    }else if(entry.status === "pending"){
        status = "processing"
    }

    const url = storageId ? await ctx.storage.getUrl(storageId) : null;

    return {
        id: entry.entryId,
        name: filename,
        type: extension,
        size: filesize,
        status,
        url,
        category: metadata?.category || undefined,
    };
};

function formatFileSize(bytes: number): string {
    if(bytes == 0){
        return "0 B";
    }

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
};