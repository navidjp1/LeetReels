import React from "react";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { LeetCodeProblem } from "./types";

interface BookmarksListProps {
    bookmarkedProblems: LeetCodeProblem[];
    onSelectProblem: (problem: LeetCodeProblem) => void;
    onBookmark: (problem: LeetCodeProblem) => void;
    refreshing: boolean;
    onRefresh: () => void;
}

export function BookmarksList({
    bookmarkedProblems,
    onSelectProblem,
    onBookmark,
    refreshing,
    onRefresh,
}: BookmarksListProps) {
    return (
        <FlatList
            data={bookmarkedProblems}
            keyExtractor={(item) => item.titleSlug}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.problemItem}
                    onPress={() => onSelectProblem(item)}
                >
                    <ThemedView style={styles.problemHeader}>
                        <ThemedText style={styles.problemTitle}>{item.title}</ThemedText>
                        <TouchableOpacity onPress={() => onBookmark(item)}>
                            <Ionicons name="bookmark" size={24} color="#3e4a8a" />
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedView style={styles.problemMeta}>
                        <ThemedText
                            style={[
                                styles.difficultyTag,
                                {
                                    backgroundColor:
                                        item.difficulty === "Easy"
                                            ? "#00b8a3"
                                            : item.difficulty === "Medium"
                                            ? "#ffc01e"
                                            : "#ff375f",
                                },
                            ]}
                        >
                            {item.difficulty}
                        </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.problemId}>
                        #{item.frontendQuestionId}
                    </ThemedText>
                </TouchableOpacity>
            )}
            refreshing={refreshing}
            onRefresh={onRefresh}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={48} color="#ccc" />
                    <ThemedText style={styles.emptyText}>
                        You haven't bookmarked any problems yet.
                    </ThemedText>
                </ThemedView>
            }
        />
    );
}

const styles = StyleSheet.create({
    problemItem: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    problemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    problemTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        marginRight: 8,
    },
    problemMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    difficultyTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    problemId: {
        fontSize: 12,
        color: "#888",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
        marginTop: 16,
    },
});
