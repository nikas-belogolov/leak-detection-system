import { authClient } from "~/lib/auth-client"
import { Dashboard } from "./dashboard"
import { auth } from "~/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { dbConnect, Device } from "db"

export default async function Page() {

  await dbConnect()

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return redirect("/auth/login");
  }

  const { user } = session;

  const devices = await Device.find({ _id: { $in: user.devices } }).lean().exec()



  return (
    <Dashboard devices={JSON.parse(JSON.stringify(devices))} />
  )
}