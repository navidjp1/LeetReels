import "dotenv/config";

export default {
    expo: {
        name: "LeetReels",
        slug: "leetreels",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/images/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.yourcompany.leetreels",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            package: "com.yourcompany.leetreels",
        },
        web: {
            bundler: "metro",
            favicon: "./assets/images/favicon.png",
        },
        extra: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
            eas: {
                projectId: "your-project-id",
            },
        },
    },
};
