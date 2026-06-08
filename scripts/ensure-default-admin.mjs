import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const ADMIN_EMAIL = "admin@tds.com"
const ADMIN_PASSWORD = "khan123office"

const envText = await readFile(".env.local", "utf8")
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && line.includes("="))
    .map(line => {
      const index = line.indexOf("=")
      return [line.slice(0, index), line.slice(index + 1)]
    })
)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data: users, error: listError } = await supabase.auth.admin.listUsers()
if (listError) throw listError

const existingUser = users.users.find(user => user.email?.toLowerCase() === ADMIN_EMAIL)
const { data: adminData, error: adminError } = existingUser
  ? await supabase.auth.admin.updateUserById(existingUser.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "admin", status: "approved" },
    })
  : await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "admin", status: "approved" },
    })

if (adminError) throw adminError
if (!adminData.user) throw new Error("Unable to create or update admin user.")

const { error: roleError } = await supabase.from("user_roles").upsert({
  user_id: adminData.user.id,
  email: ADMIN_EMAIL,
  role: "admin",
  status: "approved",
  approved_by: adminData.user.id,
  approved_at: new Date().toISOString(),
}, { onConflict: "user_id" })

if (roleError) {
  if (roleError.code === "PGRST204") {
    throw new Error(
      "The live Supabase schema is missing auth approval columns. Run supabase/auth-approval-migration.sql, then run npm run seed:admin again."
    )
  }

  throw roleError
}

console.log(`Default admin ready: ${ADMIN_EMAIL}`)
