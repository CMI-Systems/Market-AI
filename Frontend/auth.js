const SUPABASE_URL = "https://utuqqknntupgclbhlrhl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mWT8XgzhTlhfIX7Y5YQo1g_hv7WnIUw";

let supabaseAuth = null;

if (!window.supabase) {
  console.error("Supabase CDN did not load.");
} else {
  supabaseAuth = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

async function signUpUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  const status = document.getElementById("authStatus");

  if (!email || !password) {
    status.textContent = "Enter email and password.";
    return;
  }

  status.textContent = "Creating account...";

  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error("Signup error:", error);
    status.textContent = `Signup error: ${error.message}`;
    return;
  }

  console.log("Signup success:", data);
  status.textContent = `Account created for ${email}. Check Supabase Auth users.`;
}

async function loginUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  const status = document.getElementById("authStatus");

  if (!email || !password) {
    status.textContent = "Enter email and password.";
    return;
  }

  status.textContent = "Logging in...";

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Login error:", error);
    status.textContent = `Login error: ${error.message}`;
    return;
  }

  console.log("Login success:", data);
  status.textContent = `Logged in: ${data.user.email}`;
}

async function logoutUser() {
  const status = document.getElementById("authStatus");

  const { error } = await supabaseAuth.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    status.textContent = `Logout error: ${error.message}`;
    return;
  }

  status.textContent = "Logged out.";
}

async function checkCurrentSession() {
  const status = document.getElementById("authStatus");

  const { data: { session } = {}, error } = await supabaseAuth.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    return;
  }

  if (session?.user?.email) {
    status.textContent = `Session active: ${session.user.email}`;
  }
}

checkCurrentSession();