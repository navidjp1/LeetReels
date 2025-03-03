import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    Image,
    Platform,
    TouchableOpacity,
    FlatList,
    Modal,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import { LeetCodeProblem } from "@/components/LeetCode/types";
import { ProblemCard } from "@/components/LeetCode/ProblemCard";
import { AuthModal } from "@/components/Auth/AuthModal";
import { ProblemDescription } from "@/components/LeetCode/ProblemDescription";
import { NotesModal } from "@/components/LeetCode/NotesModal";
import { SolutionModal } from "@/components/LeetCode/SolutionModal";
import { useProblem } from "@/contexts/ProblemContext";
import { BookmarksList } from "@/components/LeetCode/BookmarksList";
import { BookmarkService } from "@/services/BookmarkService";

export default function ProfileScreen() {
    const { user, signOut, loading } = useUser();
    const [bookmarkedProblems, setBookmarkedProblems] = useState<LeetCodeProblem[]>([]);
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { setSelectedProblem } = useProblem();

    useEffect(() => {
        let isMounted = true;

        if (user) {
            fetchBookmarkedProblems().then(() => {
                if (!isMounted) return;
            });
        }

        return () => {
            isMounted = false;
        };
    }, [user]);

    const fetchBookmarkedProblems = useCallback(async () => {
        if (!user) return;

        setRefreshing(true);
        try {
            const problems = await BookmarkService.fetchBookmarkedProblems(user.id);
            setBookmarkedProblems(problems);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        } finally {
            setRefreshing(false);
        }
    }, [user]);

    const handleSelectProblem = useCallback(
        (problem: LeetCodeProblem) => {
            setSelectedProblem(problem);
            router.push("/(tabs)");
        },
        [router, setSelectedProblem]
    );

    const handleBookmark = useCallback(
        async (problem: LeetCodeProblem) => {
            if (!user) return;

            try {
                await BookmarkService.removeBookmark(user.id, problem.titleSlug);
                setBookmarkedProblems((prev) =>
                    prev.filter((p) => p.titleSlug !== problem.titleSlug)
                );
            } catch (error) {
                console.error("Error removing bookmark:", error);
            }
        },
        [user]
    );

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3e4a8a" />
                <ThemedText>Loading your profile...</ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={styles.bookmarksTitle}>Profile</ThemedText>
                <ThemedView style={styles.authContainer}>
                    <ThemedText style={styles.authText}>
                        Please sign in to view your bookmarked problems
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => setAuthModalVisible(true)}
                    >
                        <ThemedText style={styles.authButtonText}>Sign In</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <AuthModal
                    visible={authModalVisible}
                    onClose={() => setAuthModalVisible(false)}
                    onSuccess={() => setAuthModalVisible(false)}
                />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Profile</ThemedText>
                <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={20} color="#3e4a8a" />
                    <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.divider} />

            <ThemedText type="subtitle" style={styles.bookmarksTitle}>
                Your Bookmarks
            </ThemedText>

            <BookmarksList
                bookmarkedProblems={bookmarkedProblems}
                onSelectProblem={handleSelectProblem}
                onBookmark={handleBookmark}
                refreshing={refreshing}
                onRefresh={fetchBookmarkedProblems}
            />

            <AuthModal
                visible={authModalVisible}
                onClose={() => setAuthModalVisible(false)}
                onSuccess={() => setAuthModalVisible(false)}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 80,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 15,
    },
    bookmarksTitle: {
        fontSize: 20,
        marginBottom: 16,
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    signOutText: {
        marginLeft: 5,
        color: "#3e4a8a",
    },
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
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },
    authContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    authText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    authButton: {
        backgroundColor: "#3e4a8a",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    authButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
