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
import { useUser } from "@/contexts/UserContext";
import { AuthModal } from "@/components/Auth/AuthModal";
import { NotesService } from "@/services/NotesService";

interface NotesModalProps {
    visible: boolean;
    onClose: () => void;
    problem: LeetCodeProblem | null;
    onOpenDescription?: (problem: LeetCodeProblem) => void;
}

export function NotesModal({
    visible,
    onClose,
    problem,
    onOpenDescription,
}: NotesModalProps) {
    const [notes, setNotes] = useState<string>("");
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (problem && visible && user) {
            loadNotes();
        }
    }, [problem, visible, user]);

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

    const loadNotes = async () => {
        if (!problem || !user) return;

        try {
            setLoading(true);
            const savedNotes = await NotesService.getNotes(user.id, problem.titleSlug);
            setNotes(savedNotes);
            setHasChanges(false);
        } catch (error) {
            console.error("Error loading notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveNotes = async (showAlert = true) => {
        if (!problem) return;

        if (!user) {
            setAuthModalVisible(true);
            return;
        }

        try {
            setLoading(true);
            await NotesService.saveNotes(user.id, problem.titleSlug, notes);
            setHasChanges(false);
            if (showAlert) {
                Alert.alert("Success", "Your notes have been saved.");
            }
        } catch (error) {
            console.error("Error saving notes:", error);
            Alert.alert("Error", "Failed to save your notes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (hasChanges && notes.trim().length > 0 && user) {
            saveNotes(false); // Save without alert when closing
        }
        onClose();
    };

    const handleOpenDescription = () => {
        if (!problem) return;

        // Save notes if there are changes
        if (hasChanges && notes.trim().length > 0 && user) {
            saveNotes(false); // Save without alert when switching to description
        }

        // Close notes modal and open description modal
        onClose();
        if (onOpenDescription) {
            onOpenDescription(problem);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalVisible(false);
        saveNotes();
    };

    const handleTextChange = (text: string) => {
        setNotes(text);
        setHasChanges(true);
    };

    if (!problem) return null;

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={handleClose}
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
                                <View style={styles.headerButtons}>
                                    {onOpenDescription && (
                                        <TouchableOpacity
                                            style={styles.descriptionButton}
                                            onPress={handleOpenDescription}
                                        >
                                            <Ionicons
                                                name="document-text-outline"
                                                size={20}
                                                color="#3e4a8a"
                                            />
                                            <ThemedText
                                                style={styles.descriptionButtonText}
                                            >
                                                Description
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={handleClose}>
                                        <Ionicons name="close" size={24} color="#888" />
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>

                            <View style={styles.notesContainer}>
                                <TextInput
                                    style={styles.notesInput}
                                    multiline
                                    value={notes}
                                    onChangeText={handleTextChange}
                                    placeholder="Write your notes here..."
                                    placeholderTextColor="#888"
                                    autoFocus
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    keyboardVisible && styles.saveButtonWithKeyboard,
                                    loading && styles.saveButtonDisabled,
                                ]}
                                onPress={() => saveNotes(true)} // Explicit save with alert
                                disabled={loading}
                            >
                                <ThemedText style={styles.saveButtonText}>
                                    {loading ? "Saving..." : "Save Notes"}
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
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    descriptionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    descriptionButtonText: {
        marginLeft: 5,
        color: "#3e4a8a",
        fontWeight: "500",
        fontSize: 14,
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
    saveButtonDisabled: {
        backgroundColor: "#a0a0a0",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
