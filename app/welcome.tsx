import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen() {
    const router = useRouter();
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleGetStarted = async () => {
        // Mark that the user has seen the welcome screen
        await AsyncStorage.setItem("hasSeenWelcome", "true");
        router.replace("/(tabs)");
    };

    return (
        <ThemedView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ThemedText type="title" style={styles.title}>
                    LeetReels
                </ThemedText>

                <ThemedText style={styles.description}>
                    Practice LeetCode problems on the go with a swipeable interface. Save
                    notes, bookmark problems, and view solutions.
                </ThemedText>

                <Image
                    source={require("../assets/images/leetreels-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                    <ThemedText style={styles.buttonText}>Get Started</ThemedText>
                </TouchableOpacity>
            </Animated.View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    content: {
        width: "100%",
        alignItems: "center",
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#3e4a8a",
    },
    description: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 40,
    },
    button: {
        backgroundColor: "#3e4a8a",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
