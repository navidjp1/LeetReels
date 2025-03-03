import React, { useState, useRef } from "react";
import { StyleSheet, Dimensions, TouchableOpacity, Animated } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { LeetCodeProblem } from "./types";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";

interface ProblemCardProps {
    item: LeetCodeProblem;
    onOpenDescription: (problem: LeetCodeProblem) => void;
    onOpenNotes: (problem: LeetCodeProblem) => void;
    onOpenSolution: (problem: LeetCodeProblem) => void;
    onBookmark: (problem: LeetCodeProblem) => void;
    isBookmarked: boolean;
}

const { height } = Dimensions.get("window");

export function ProblemCard({
    item,
    onOpenDescription,
    onOpenNotes,
    onOpenSolution,
    onBookmark,
    isBookmarked,
}: ProblemCardProps) {
    const [showTopics, setShowTopics] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const toggleTopics = () => {
        const newValue = !showTopics;
        setShowTopics(newValue);

        Animated.timing(fadeAnim, {
            toValue: newValue ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const difficultyColor =
        item.difficulty === "Easy"
            ? "#00b8a3"
            : item.difficulty === "Medium"
            ? "#ffc01e"
            : "#ff375f";

    return (
        <ThemedView style={[styles.problemCard, { height: height - 100 }]}>
            <ThemedView style={styles.problemHeader}>
                <ThemedText type="title">{item.title}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.problemSubheader}>
                <ThemedText type="subtitle">#{item.frontendQuestionId}</ThemedText>
                <TouchableOpacity onPress={() => onBookmark(item)}>
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color="#3e4a8a"
                    />
                </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.statsContainer}>
                <ThemedText>Acceptance Rate: {Math.round(item.acRate)}%</ThemedText>
                <ThemedText style={{ color: difficultyColor, fontWeight: "bold" }}>
                    {item.difficulty}
                </ThemedText>
            </ThemedView>

            <TouchableOpacity
                style={styles.topicsHeader}
                onPress={toggleTopics}
                activeOpacity={0.7}
            >
                <ThemedView style={styles.topicsTitleContainer}>
                    <ThemedText type="subtitle">Topics</ThemedText>
                    <Ionicons
                        name={showTopics ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#3e4a8a"
                        style={{ marginLeft: 8, opacity: 0.7 }}
                    />
                </ThemedView>
            </TouchableOpacity>

            <Animated.View style={[styles.tagsContainerWrapper, { opacity: fadeAnim }]}>
                <ThemedView style={styles.tagsContainer}>
                    {item.topicTags.map((tag) => (
                        <ThemedView key={tag.id} style={styles.tag}>
                            <ThemedText style={styles.tagText}>{tag.name}</ThemedText>
                        </ThemedView>
                    ))}
                </ThemedView>
            </Animated.View>

            <ThemedView style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={styles.descriptionButton}
                    onPress={() => onOpenDescription(item)}
                >
                    <Ionicons name="document-text-outline" size={28} color="#fff" />
                    <ThemedText style={styles.descriptionButtonText}>
                        View Description
                    </ThemedText>
                </TouchableOpacity>

                <ThemedView style={styles.secondaryButtonsContainer}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => onOpenNotes(item)}
                    >
                        <Ionicons name="create-outline" size={24} color="#3e4a8a" />
                        <ThemedText style={styles.secondaryButtonText}>Notes</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => onOpenSolution(item)}
                    >
                        <Ionicons name="code-slash-outline" size={24} color="#3e4a8a" />
                        <ThemedText style={styles.secondaryButtonText}>
                            Solution
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>

            <ThemedView style={styles.swipeHint}>
                <ThemedText style={styles.swipeText}>
                    Swipe up for next problem
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    problemCard: {
        padding: 20,
        justifyContent: "center",
    },
    problemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    problemSubheader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statsContainer: {
        marginTop: 16,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    topicsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 8,
        paddingVertical: 4,
    },
    topicsTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    tagsContainerWrapper: {
        height: "auto",
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        backgroundColor: "#3e4a8a",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: "white",
        fontSize: 12,
    },
    actionButtonsContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    descriptionButton: {
        flexDirection: "row",
        backgroundColor: "#3e4a8a",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        width: "80%",
        marginBottom: 20,
    },
    descriptionButtonText: {
        color: "white",
        fontWeight: "bold",
        marginLeft: 8,
        fontSize: 16,
    },
    secondaryButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    secondaryButton: {
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    secondaryButtonText: {
        marginTop: 5,
        fontSize: 14,
    },
    swipeHint: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
    },
    swipeText: {
        opacity: 0.7,
        fontSize: 14,
    },
});
