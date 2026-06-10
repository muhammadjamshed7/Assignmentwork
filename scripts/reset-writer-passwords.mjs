import { readFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

const DEFAULT_WRITER_PASSWORD = process.env.WRITER_DEFAULT_PASSWORD ?? "12345678"
const PAGE_SIZE = 1000

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
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.")
}

if (DEFAULT_WRITER_PASSWORD.length < 6) {
  throw new Error("Writer default password must be at least 6 characters.")
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function listWriterRoles() {
  const writers = []
  let from = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, email, status")
      .eq("role", "student")
      .range(from, to)

    if (error) throw error
    if (!data?.length) break

    writers.push(...data.filter(writer => writer.user_id))

    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return writers
}

const writers = await listWriterRoles()

if (writers.length === 0) {
  console.log("No writer expert accounts found.")
  process.exit(0)
}

let updatedCount = 0
const failures = []

for (const writer of writers) {
  const { error } = await supabase.auth.admin.updateUserById(writer.user_id, {
    password: DEFAULT_WRITER_PASSWORD,
  })

  if (error) {
    failures.push({
      email: writer.email ?? writer.user_id,
      message: error.message,
    })
    continue
  }

  updatedCount += 1
  console.log(`Password reset for writer: ${writer.email ?? writer.user_id}`)
}

console.log(`Writer password reset complete. Updated ${updatedCount}/${writers.length} accounts.`)

if (failures.length > 0) {
  console.error("Some writer passwords could not be reset:")
  failures.forEach(failure => {
    console.error(`- ${failure.email}: ${failure.message}`)
  })
  process.exit(1)
}
