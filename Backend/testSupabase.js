require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL configured:", supabaseUrl ? "YES" : "NO");
console.log("Service role configured:", serviceRoleKey ? "YES" : "NO");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing required Supabase backend environment variables.");
  process.exit(1);
}

async function testConnection() {
  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/operator_profiles?select=id&limit=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
    });

    const body = await response.text();

    console.log("REST status:", response.status);
    console.log("REST status text:", response.statusText);
    console.log("REST body:", body || "<empty>");

    if (!response.ok) {
      process.exit(1);
    }

    console.log("Supabase REST connection check: PASS");
  } catch (error) {
    console.error("Supabase REST connection check threw exception.", {
      name: error?.name || null,
      code: error?.code || "UNKNOWN",
      message: error?.message || "UNKNOWN",
      cause: error?.cause || null,
      stack: error?.stack || null,
    });
    process.exit(1);
  }
}

void testConnection();