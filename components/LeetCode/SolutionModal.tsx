import React, { useState, useEffect } from "react";
import { StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { LeetCodeProblem } from "./types";
import WebView from "react-native-webview";

interface SolutionModalProps {
    visible: boolean;
    onClose: () => void;
    problem: LeetCodeProblem | null;
}

interface Solution {
    id: string;
    title: string;
    content: string;
    voteCount: number;
}

export function SolutionModal({ visible, onClose, problem }: SolutionModalProps) {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

    useEffect(() => {
        //console.log("SolutionModal - visible prop changed to:", visible);
        //console.log("SolutionModal - problem:", problem?.title);
        if (problem && visible) {
            fetchSolutions(problem.titleSlug);
        }
    }, [problem, visible]);

    const fetchSolutions = async (titleSlug: string) => {
        try {
            setLoading(true);
            const response = await fetch("https://leetcode.com/graphql/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
            query questionTopicsList($questionId: String!, $orderBy: TopicSortingOption, $skip: Int, $query: String, $first: Int) {
              questionTopicsList(questionId: $questionId, orderBy: $orderBy, skip: $skip, query: $query, first: $first) {
                edges {
                  node {
                    id
                    title
                    post {
                      content
                      voteCount
                    }
                  }
                }
              }
            }
          `,
                    variables: {
                        questionId: titleSlug,
                        orderBy: "most_votes",
                        skip: 0,
                        first: 10,
                    },
                }),
            });

            const result = await response.json();

            if (
                result.data &&
                result.data.questionTopicsList &&
                result.data.questionTopicsList.edges
            ) {
                const fetchedSolutions = result.data.questionTopicsList.edges.map(
                    (edge: any) => ({
                        id: edge.node.id,
                        title: edge.node.title,
                        content: edge.node.post.content,
                        voteCount: edge.node.post.voteCount,
                    })
                );

                setSolutions(fetchedSolutions);

                if (fetchedSolutions.length > 0) {
                    setSelectedSolution(fetchedSolutions[0]);
                }
            } else {
                setSolutions([]);
                setSelectedSolution(null);
            }
        } catch (err) {
            console.error("Error fetching solutions:", err);
            setSolutions([]);
            setSelectedSolution(null);
        } finally {
            setLoading(false);
        }
    };

    if (!problem) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                console.log("SolutionModal - system back button pressed");
                onClose();
            }}
        >
            <ThemedView style={styles.modalContainer}>
                <ThemedView style={styles.modalContent}>
                    <ThemedView style={styles.modalHeader}>
                        <ThemedText
                            type="title"
                            numberOfLines={1}
                            style={styles.modalTitle}
                        >
                            Solutions: {problem.title}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>
                    </ThemedView>

                    {loading ? (
                        <ThemedView style={styles.loadingContainer}>
                            <ThemedText>Loading solutions...</ThemedText>
                        </ThemedView>
                    ) : solutions.length === 0 ? (
                        <ThemedView style={styles.noSolutionsContainer}>
                            <ThemedText>No solutions available.</ThemedText>
                        </ThemedView>
                    ) : (
                        <ThemedView style={styles.solutionsContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.solutionTabs}
                            >
                                {solutions.map((solution) => (
                                    <TouchableOpacity
                                        key={solution.id}
                                        style={[
                                            styles.solutionTab,
                                            selectedSolution?.id === solution.id &&
                                                styles.selectedSolutionTab,
                                        ]}
                                        onPress={() => setSelectedSolution(solution)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.solutionTabText,
                                                selectedSolution?.id === solution.id &&
                                                    styles.selectedSolutionTabText,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {solution.title}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {selectedSolution && (
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
                          <h3>${selectedSolution.title}</h3>
                          <p>Votes: ${selectedSolution.voteCount}</p>
                          ${selectedSolution.content}
                        </body>
                      </html>
                    `,
                                    }}
                                    style={styles.webView}
                                />
                            )}
                        </ThemedView>
                    )}
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
        width: "95%",
        height: "90%",
        borderRadius: 10,
        overflow: "hidden",
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noSolutionsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    solutionsContainer: {
        flex: 1,
    },
    solutionTabs: {
        maxHeight: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    solutionTab: {
        padding: 15,
        marginRight: 5,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    selectedSolutionTab: {
        borderBottomColor: "#3e4a8a",
    },
    solutionTabText: {
        color: "#888",
        maxWidth: 150,
    },
    selectedSolutionTabText: {
        color: "#3e4a8a",
        fontWeight: "bold",
    },
    webView: {
        flex: 1,
    },
});
