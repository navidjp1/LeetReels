import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

// Replace with your Supabase URL and anon key
const supabaseUrl = "https://fwubqpvzotwpnlwtrdek.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dWJxcHZ6b3R3cG5sd3RyZGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NjU0ODQsImV4cCI6MjA1NjQ0MTQ4NH0.Jsn-dgxMQFe_E8nLjKbtCo84FgTDMgKDmxLjPzv4D5c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
