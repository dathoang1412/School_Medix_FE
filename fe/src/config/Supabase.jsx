import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("supabase url: ", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const loginWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login error:", error.message);
    return { error };
  } else {
    console.log("✅ Logged in:", data);
    return { data };
  }
};

export const sendOtp = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    console.error("❌ Error sending OTP:", error.message);
    return { error };
  } else {
    console.log("✅ OTP sent to email:", email);
    return { data };
  }
};

export const verifyOtp = async (email, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  console.log("Email: " + email + " | " + "OTP: " + token);

  if (error) {
    console.error("❌ OTP verification failed:", error.message);
    return { error };
  } else {
    console.log("✅ OTP verified, user signed in:", data);
    return { data };
  }
};