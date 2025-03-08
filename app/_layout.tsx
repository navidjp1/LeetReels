import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "@/contexts/UserContext";
import { ProblemProvider } from "@/contexts/ProblemContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });
    const [initialRoute, setInitialRoute] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkFirstTime() {
            try {
                const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");
                setInitialRoute(hasSeenWelcome === "true" ? "/(tabs)" : "/welcome");
            } catch (error) {
                console.error("Error checking first time status:", error);
                setInitialRoute("/(tabs)");
            }
        }

        checkFirstTime();
    }, []);

    useEffect(() => {
        if (loaded && initialRoute) {
            SplashScreen.hideAsync();
            if (initialRoute !== "/(tabs)") {
                router.replace(initialRoute);
            }
        }
    }, [loaded, initialRoute]);

    if (!loaded || !initialRoute) {
        return null;
    }

    return (
        <UserProvider>
            <ProblemProvider>
                <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="welcome" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </ProblemProvider>
        </UserProvider>
    );
}
