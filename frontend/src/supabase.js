import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ogvmzpzwljnaetsvbivk.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndm16cHp3bGpuYWV0c3ZiaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjQ1ODcsImV4cCI6MjA3ODk0MDU4N30.vHuI8wD2u64geamwHkHSQTUsNYOkzgeX9hr4sgwMYwo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
