require("dotenv").config();

console.log("URL:", process.env.SUPABASE_URL);
console.log("Service Role Loaded:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO");

const supabase = require("./services/supabaseClient");

async function testConnection() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  console.log("✅ Connected to Supabase");
  console.log(data);
}

testConnection();