import React, { useState } from "react";
import { StyleSheet, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { LeetCodeProblem } from "./types";
import WebView from "react-native-webview";
import { useUser } from "@/contexts/UserContext";
import { AuthModal } from "@/components/Auth/AuthModal";

interface ProblemDescriptionProps {
    visible: boolean;
    onClose: () => void;
    problem: LeetCodeProblem | null;
    onOpenNotes: (problem: LeetCodeProblem) => void;
}

export function ProblemDescription({
    visible,
    onClose,
    problem,
    onOpenNotes,
}: ProblemDescriptionProps) {
    const [description, setDescription] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const { user } = useUser();

    React.useEffect(() => {
        if (problem && visible) {
            fetchProblemDescription(problem.titleSlug);
        }
    }, [problem, visible]);

    const fetchProblemDescription = async (titleSlug: string) => {
        try {
            setLoading(true);
            const response = await fetch("https://leetcode.com/graphql/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
            query questionContent($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                content
                difficulty
                questionId
                title
              }
            }
          `,
                    variables: {
                        titleSlug,
                    },
                }),
            });

            const result = await response.json();
            setDescription(result.data.question.content);
        } catch (err) {
            console.error("Error fetching problem description:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenNotes = () => {
        if (!user) {
            setAuthModalVisible(true);
            return;
        }

        // Close description modal and open notes modal
        onClose();
        if (problem) {
            onOpenNotes(problem);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalVisible(false);
        onClose();
        if (problem) {
            onOpenNotes(problem);
        }
    };

    if (!problem) return null;

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <ThemedView style={styles.modalContainer}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedView style={styles.modalHeader}>
                            <ThemedText
                                type="title"
                                numberOfLines={1}
                                style={styles.modalTitle}
                            >
                                {problem.title}
                            </ThemedText>

                            <View style={styles.headerButtons}>
                                <TouchableOpacity
                                    style={styles.notesButton}
                                    onPress={handleOpenNotes}
                                >
                                    <Ionicons
                                        name="create-outline"
                                        size={20}
                                        color="#3e4a8a"
                                    />
                                    <ThemedText style={styles.notesButtonText}>
                                        Notes
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </ThemedView>

                        {loading ? (
                            <ThemedView style={styles.loadingContainer}>
                                <ThemedText>Loading description...</ThemedText>
                            </ThemedView>
                        ) : (
                            <WebView
                                originWhitelist={["*"]}
                                source={{
                                    html: `
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                          padding: 10px;
                          line-height: 1.5;
                        }
                        pre {
                          background-color: #f5f5f5;
                          padding: 10px;
                          border-radius: 5px;
                          overflow-x: auto;
                        }
                        code {
                          font-family: monospace;
                        }
                        img {
                          max-width: 100%;
                          height: auto;
                        }
                      </style>
                    </head>
                    <body>
                      ${description}
                    </body>
                  </html>
                `,
                                }}
                                style={styles.webView}
                            />
                        )}
                    </ThemedView>
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
        width: "95%",
        height: "90%",
        borderRadius: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    notesButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    notesButtonText: {
        marginLeft: 5,
        color: "#3e4a8a",
        fontWeight: "500",
        fontSize: 14,
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
