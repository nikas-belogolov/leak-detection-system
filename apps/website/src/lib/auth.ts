import { betterAuth, BetterAuthPlugin } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { getMongoDbClient } from "@leaknet/db"; // your mongodb client
import { emailHarmony } from 'better-auth-harmony';
import { getMongoDbClient } from "db";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic'

const { client, db } = await getMongoDbClient()

export const auth = betterAuth({
    database: mongodbAdapter(db!, {
        usePlural: true,
        client,
        transaction: true
    }),
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        database: {
            generateId() {
                return new Types.ObjectId().toString();
            }
        }
    },
    plugins: [emailHarmony() as BetterAuthPlugin],
    user: {
        additionalFields: {
            devices: {
                type: "string[]",
                defaultValue: []
            }
        }
    },
    trustedOrigins: ["http://www.localhost:3000"]
});

