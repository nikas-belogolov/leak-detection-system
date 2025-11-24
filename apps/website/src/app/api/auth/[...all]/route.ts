import { auth } from "~/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { dbConnect } from "db";

await dbConnect()

export const { POST, GET } = toNextJsHandler(auth);