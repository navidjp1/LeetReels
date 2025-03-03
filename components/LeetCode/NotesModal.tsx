import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { LeetCodeProblem } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/contexts/UserContext";
import { AuthModal } from "@/components/Auth/AuthModal";

interface NotesModalProps {
    visible: boolean;
    onClose: () => void;
    problem: LeetCodeProblem | null;
}

export function NotesModal({ visible, onClose, problem }: NotesModalProps) {
    const [notes, setNotes] = useState<string>("");
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (problem && visible) {
            loadNotes(problem.titleSlug);
        }
    }, [problem, visible]);

    useEffect(() => {
        //console.log("NotesModal - visible prop changed to:", visible);
        //console.log("NotesModal - problem:", problem?.title);
    }, [visible, problem]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const loadNotes = async (titleSlug: string) => {
        try {
            const savedNotes = await AsyncStorage.getItem(`notes_${titleSlug}`);
            if (savedNotes) {
                setNotes(savedNotes);
            } else {
                setNotes("");
            }
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    };

    const saveNotes = async () => {
        if (!problem) return;

        if (!user) {
            setAuthModalVisible(true);
            return;
        }

        try {
            await AsyncStorage.setItem(`notes_${problem.titleSlug}`, notes);
            Alert.alert("Success", "Your notes have been saved.");
        } catch (error) {
            console.error("Error saving notes:", error);
            Alert.alert("Error", "Failed to save your notes. Please try again.");
        }
    };

    const handleClose = () => {
        if (notes.trim().length > 0 && user) {
            saveNotes();
        }
        onClose();
    };

    const handleAuthSuccess = () => {
        setAuthModalVisible(false);
        saveNotes();
    };

    if (!problem) return null;

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => {
                    // console.log("NotesModal - system back button pressed");
                    handleClose();
                }}
            >
                <ThemedView style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: "95%", height: "90%", marginTop: 50 }}
                    >
                        <ThemedView style={styles.modalContent}>
                            <ThemedView style={styles.modalHeader}>
                                <ThemedText
                                    type="title"
                                    numberOfLines={1}
                                    style={styles.modalTitle}
                                >
                                    Notes: {problem.title}
                                </ThemedText>
                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </ThemedView>

                            <View style={styles.notesContainer}>
                                <TextInput
                                    style={styles.notesInput}
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Write your notes here..."
                                    placeholderTextColor="#888"
                                    autoFocus
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    keyboardVisible && styles.saveButtonWithKeyboard,
                                ]}
                                onPress={saveNotes}
                            >
                                <ThemedText style={styles.saveButtonText}>
                                    Save Notes
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </KeyboardAvoidingView>
                </ThemedView>
            </Modal>

            <AuthModal
                visible={authModalVisible}
                onClose={() => setAuthModalVisible(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
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
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: "white",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        paddingTop: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: {
        flex: 1,
        marginRight: 10,
        fontSize: 18,
    },
    notesContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    notesInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: "#333",
        backgroundColor: "white",
    },
    saveButton: {
        backgroundColor: "#3e4a8a",
        padding: 15,
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    saveButtonWithKeyboard: {
        bottom: 20,
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
