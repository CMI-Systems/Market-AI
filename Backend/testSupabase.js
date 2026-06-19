require("dotenv").config();

console.log("Supabase URL configured:", process.env.SUPABASE_URL ? "YES" : "NO");
console.log("Service role configured:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO");

const supabase = require("./services/supabaseClient");

async function testConnection() {
  const { count, error } = await supabase
    .from("operator_profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Supabase connection check failed.", {
      code: error.code || "UNKNOWN",
    });
    return;
  }

  console.log("Connected to Supabase.");
  console.log(
    "Operator profile count available:",
    Number.isFinite(count) ? count : "UNKNOWN"
  );
}

testConnection();
