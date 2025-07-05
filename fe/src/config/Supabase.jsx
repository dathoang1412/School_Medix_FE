// supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("supabase url: ", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Login with email and password
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

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ Sign-out failed:", error.message);
    return { error };
  } else {
    console.log("✅ Signed out successfully");
    return { success: true };
  }
};

// Send OTP to email
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

// Verify OTP
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

// Upload file to Supabase Storage
export const uploadFileToSupabaseStorage = async (file, bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error(
      "❌ Error uploading file to Supabase Storage:",
      error.message
    );
    return { error };
  } else {
    const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(path).data;
    console.log("✅ File uploaded to Supabase Storage:", publicUrl);
    return { data: { publicUrl } };
  }
};

// Retrieve file from Supabase Storage
export const retrieveFileFromSupabaseStorage = async (bucket, path) => {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    console.error(
      "❌ Error retrieving file from Supabase Storage:",
      error.message
    );
    return { error };
  } else {
    console.log("✅ File retrieved from Supabase Storage:", path);
    return { data };
  }
};

// Get current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("❌ Error fetching session:", error.message);
    return { error };
  }
  return { data };
};
