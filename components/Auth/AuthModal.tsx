import React, { useState } from "react";
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <ThemedView style={styles.modalContainer}>
                <ThemedView style={styles.modalContent}>
                    <ThemedView style={styles.modalHeader}>
                        <ThemedText type="title">
                            {isLogin ? "Login" : "Sign Up"}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>
                    </ThemedView>

                    {error && (
                        <ThemedView style={styles.errorContainer}>
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </ThemedView>

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <ThemedText style={styles.authButtonText}>
                                {isLogin ? "Login" : "Sign Up"}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <ThemedText style={styles.switchButtonText}>
                            {isLogin
                                ? "Need an account? Sign Up"
                                : "Already have an account? Login"}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 50,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    errorContainer: {
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    errorText: {
        color: "red",
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    authButton: {
        backgroundColor: "#3e4a8a",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    authButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    switchButton: {
        marginTop: 15,
        alignItems: "center",
    },
    switchButtonText: {
        color: "#3e4a8a",
    },
});
