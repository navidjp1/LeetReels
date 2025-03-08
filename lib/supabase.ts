import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import Constants from "expo-constants";

// Get environment variables
const getSupabaseUrl = (): string => {
    // First try to get from Constants.expoConfig.extra
    if (Constants.expoConfig?.extra?.supabaseUrl) {
        return Constants.expoConfig.extra.supabaseUrl;
    }

    // Fallback to hardcoded value (for development)
    return "";
};

const getSupabaseAnonKey = (): string => {
    // First try to get from Constants.expoConfig.extra
    if (Constants.expoConfig?.extra?.supabaseAnonKey) {
        return Constants.expoConfig.extra.supabaseAnonKey;
    }

    // Fallback to hardcoded value (for development)
    return "";
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
