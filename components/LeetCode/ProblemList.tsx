import React, { useRef } from "react";
import { FlatList, ActivityIndicator, Dimensions } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProblemCard } from "./ProblemCard";
import { LeetCodeProblem } from "./types";

interface ProblemListProps {
    problems: LeetCodeProblem[];
    bookmarkedProblems: Record<string, boolean>;
    onOpenDescription: (problem: LeetCodeProblem) => void;
    onOpenNotes: (problem: LeetCodeProblem) => void;
    onOpenSolution: (problem: LeetCodeProblem) => void;
    onBookmark: (problem: LeetCodeProblem) => void;
    onEndReached: () => void;
    listRef?: React.RefObject<FlatList<LeetCodeProblem>>;
}

const { height } = Dimensions.get("window");

export function ProblemList({
    problems,
    bookmarkedProblems,
    onOpenDescription,
    onOpenNotes,
    onOpenSolution,
    onBookmark,
    onEndReached,
    listRef,
}: ProblemListProps) {
    return (
        <FlatList
            ref={listRef}
            data={problems}
            renderItem={({ item }) => (
                <ProblemCard
                    item={item}
                    onOpenDescription={onOpenDescription}
                    onOpenNotes={onOpenNotes}
                    onOpenSolution={onOpenSolution}
                    onBookmark={onBookmark}
                    isBookmarked={!!bookmarkedProblems[item.titleSlug]}
                />
            )}
            keyExtractor={(item) => item.titleSlug}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height - 100}
            snapToAlignment="start"
            decelerationRate="fast"
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                problems.length > 0 ? (
                    <ThemedView style={styles.loadingMoreContainer}>
                        <ActivityIndicator size="small" />
                        <ThemedText>Loading more problems...</ThemedText>
                    </ThemedView>
                ) : null
            }
        />
    );
}

const styles = {
    loadingMoreContainer: {
        padding: 20,
        alignItems: "center" as "center", // or use 'flex-start', 'flex-end', etc.
        justifyContent: "center" as "center", // or use 'flex-start', 'flex-end', etc.
        height: 100,
    },
};
