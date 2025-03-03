import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    StyleSheet,
    FlatList,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";

// Import our new components
import { ProblemCard } from "@/components/LeetCode/ProblemCard";
import { FilterModal } from "@/components/LeetCode/FilterModal";
import { ProblemDescription } from "@/components/LeetCode/ProblemDescription";
import { NotesModal } from "@/components/LeetCode/NotesModal";
import { SolutionModal } from "@/components/LeetCode/SolutionModal";
import { LeetCodeProblem, FilterOptions, TopicTag } from "@/components/LeetCode/types";
import { useUser } from "@/contexts/UserContext";
import { AuthModal } from "@/components/Auth/AuthModal";
import { supabase } from "@/lib/supabase";
import { useProblem } from "@/contexts/ProblemContext";
import { ProblemList } from "@/components/LeetCode/ProblemList";
import { BookmarkService } from "@/services/BookmarkService";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
    const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        difficulty: {
            Easy: true,
            Medium: true,
            Hard: true,
        },
        topics: {},
    });
    const [availableTopics, setAvailableTopics] = useState<string[]>([]);

    // Modal states

    const { selectedProblem, setSelectedProblem } = useProblem();
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [notesModalVisible, setNotesModalVisible] = useState(false);
    const [solutionModalVisible, setSolutionModalVisible] = useState(false);

    // Add these to the HomeScreen component
    const [tempFilterOptions, setTempFilterOptions] = useState<FilterOptions>({
        difficulty: {
            Easy: true,
            Medium: true,
            Hard: true,
        },
        topics: {},
    });

    const { user } = useUser();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [bookmarkedProblems, setBookmarkedProblems] = useState<Record<string, boolean>>(
        {}
    );
    const [pendingBookmarkProblem, setPendingBookmarkProblem] =
        useState<LeetCodeProblem | null>(null);

    const flatListRef = useRef<FlatList<LeetCodeProblem>>(null);

    // Add a new state for modal problem
    const [modalProblem, setModalProblem] = useState<LeetCodeProblem | null>(null);

    // Fetch LeetCode problems
    const fetchProblems = async (skip: number = 0) => {
        try {
            const response = await fetch("https://leetcode.com/graphql/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
              problemsetQuestionList: questionList(
                categorySlug: $categorySlug
                limit: $limit
                skip: $skip
                filters: $filters
              ) {
                total: totalNum
                questions: data {
                  acRate
                  difficulty
                  frontendQuestionId: questionFrontendId
                  title
                  titleSlug
                  status
                  topicTags {
                    name
                    id
                    slug
                  }
                }
              }
            }
          `,
                    variables: {
                        categorySlug: "",
                        skip: skip,
                        limit: 50, // Fetch more to allow for filtering and randomization
                        filters: {},
                    },
                }),
            });

            const result = await response.json();

            // Extract all available topics for filter options
            if (availableTopics.length === 0) {
                const topics = new Set<string>();
                result.data.problemsetQuestionList.questions.forEach(
                    (problem: LeetCodeProblem) => {
                        problem.topicTags.forEach((tag: TopicTag) => {
                            topics.add(tag.name);
                        });
                    }
                );

                const topicsList = Array.from(topics);
                setAvailableTopics(topicsList);

                // Initialize topics filter with all topics set to true
                const initialTopics: Record<string, boolean> = {};
                topicsList.forEach((topic) => {
                    initialTopics[topic] = true;
                });

                setFilterOptions((prev) => ({
                    ...prev,
                    topics: initialTopics,
                }));
            }

            // Filter problems based on selected options
            let filteredProblems = result.data.problemsetQuestionList.questions.filter(
                (problem: LeetCodeProblem) => {
                    // Filter by difficulty
                    if (
                        !filterOptions.difficulty[
                            problem.difficulty as keyof typeof filterOptions.difficulty
                        ]
                    ) {
                        return false;
                    }

                    // Filter by topics - at least one topic should match
                    if (Object.keys(filterOptions.topics).length > 0) {
                        const hasMatchingTopic = problem.topicTags.some(
                            (tag: TopicTag) => filterOptions.topics[tag.name]
                        );

                        if (!hasMatchingTopic) {
                            return false;
                        }
                    }

                    return true;
                }
            );

            // Randomize the problems
            filteredProblems = shuffleArray(filteredProblems);

            return filteredProblems;
        } catch (err) {
            console.error("Error fetching problems:", err);
            setError("Failed to fetch problems. Please try again later.");
            return [];
        }
    };

    // Fisher-Yates shuffle algorithm to randomize problems
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    useEffect(() => {
        loadInitialProblems();
    }, [filterOptions]);

    const loadInitialProblems = async () => {
        setLoading(true);
        const initialProblems = await fetchProblems();
        setProblems(initialProblems);
        setCurrentPage(0);
        setLoading(false);
    };

    const loadMoreProblems = async () => {
        const nextPage = currentPage + 1;
        const newProblems = await fetchProblems(nextPage * 50);
        setProblems([...problems, ...newProblems]);
        setCurrentPage(nextPage);
    };

    // Update the filter modal visibility handler
    const openFilterModal = () => {
        // Clone the current filter options to temporary state
        setTempFilterOptions(JSON.parse(JSON.stringify(filterOptions)));
        setFilterModalVisible(true);
    };

    // Add a function to apply filters
    const applyFilters = () => {
        setFilterOptions(tempFilterOptions);
        setFilterModalVisible(false);
        // Refetch problems with new filters
        setProblems([]);
        setLoading(true);
        fetchProblems(0).then((newProblems) => {
            setProblems(newProblems);
            setLoading(false);
        });
    };

    // Update the toggle functions to use tempFilterOptions
    const toggleDifficultyFilter = (difficulty: keyof FilterOptions["difficulty"]) => {
        setTempFilterOptions((prev) => ({
            ...prev,
            difficulty: {
                ...prev.difficulty,
                [difficulty]: !prev.difficulty[difficulty],
            },
        }));
    };

    const toggleTopicFilter = (topic: string) => {
        setTempFilterOptions((prev) => {
            const updatedTopics = { ...prev.topics };
            updatedTopics[topic] = !updatedTopics[topic];
            return {
                ...prev,
                topics: updatedTopics,
            };
        });
    };

    const toggleAllDifficulties = (value: boolean) => {
        setTempFilterOptions((prev) => ({
            ...prev,
            difficulty: {
                Easy: value,
                Medium: value,
                Hard: value,
            },
        }));
    };

    const toggleAllTopics = (value: boolean) => {
        const updatedTopics: Record<string, boolean> = {};
        availableTopics.forEach((topic) => {
            updatedTopics[topic] = value;
        });

        setTempFilterOptions((prev) => ({
            ...prev,
            topics: updatedTopics,
        }));
    };

    // Update the modal handlers to use modalProblem instead of selectedProblem
    const handleOpenDescription = useCallback((problem: LeetCodeProblem) => {
        //console.log("Opening description modal for:", problem.title);
        setModalProblem(problem);
        setDescriptionModalVisible(true);
    }, []);

    const handleOpenNotes = useCallback((problem: LeetCodeProblem) => {
        //console.log("Opening notes modal for:", problem.title);
        setModalProblem(problem);
        setNotesModalVisible(true);
    }, []);

    const handleOpenSolution = useCallback((problem: LeetCodeProblem) => {
        //console.log("Opening solution modal for:", problem.title);
        setModalProblem(problem);
        setSolutionModalVisible(true);
    }, []);

    // Fetch bookmarked problems
    useEffect(() => {
        if (user) {
            fetchBookmarkedProblems();
        }
    }, [user]);

    const fetchBookmarkedProblems = async () => {
        if (!user) return;

        try {
            const bookmarked = await BookmarkService.fetchBookmarkedProblemIds(user.id);
            setBookmarkedProblems(bookmarked);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        }
    };

    const handleBookmark = async (problem: LeetCodeProblem) => {
        if (!user) {
            setPendingBookmarkProblem(problem);
            setAuthModalVisible(true);
            return;
        }

        try {
            const isCurrentlyBookmarked = bookmarkedProblems[problem.titleSlug];

            if (isCurrentlyBookmarked) {
                await BookmarkService.removeBookmark(user.id, problem.titleSlug);
                setBookmarkedProblems((prev) => {
                    const updated = { ...prev };
                    delete updated[problem.titleSlug];
                    return updated;
                });
            } else {
                await BookmarkService.addBookmark(user.id, problem);
                setBookmarkedProblems((prev) => ({
                    ...prev,
                    [problem.titleSlug]: true,
                }));
            }
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalVisible(false);
        if (pendingBookmarkProblem) {
            // Try to bookmark again after successful auth
            setTimeout(() => {
                handleBookmark(pendingBookmarkProblem);
                setPendingBookmarkProblem(null);
            }, 500);
        }
    };

    // Update the useEffect for handling selected problem
    useEffect(() => {
        console.log("selectedProblem changed:", selectedProblem?.title);

        if (selectedProblem) {
            console.log("Resetting problems list with selected problem first");

            // Reset the problems list to just show the selected problem first
            setProblems((prevProblems) => {
                // Create a new array with the selected problem first
                const filteredProblems = prevProblems.filter(
                    (p) => p.titleSlug !== selectedProblem.titleSlug
                );
                return [selectedProblem, ...filteredProblems];
            });

            // Scroll to top
            console.log("Scrolling to top");
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

            // Clear the selected problem to avoid infinite re-renders
            console.log("Setting timeout to clear selectedProblem");
            setTimeout(() => {
                console.log("Clearing selectedProblem");
                setSelectedProblem(null);
            }, 100);
        }
    }, [selectedProblem]);

    if (loading && problems.length === 0) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3e4a8a" />
                <ThemedText>Loading problems...</ThemedText>
            </ThemedView>
        );
    }

    if (error && problems.length === 0) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText type="subtitle" style={styles.errorText}>
                    {error}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
                <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Problem List */}
            <ProblemList
                problems={problems}
                bookmarkedProblems={bookmarkedProblems}
                onOpenDescription={handleOpenDescription}
                onOpenNotes={handleOpenNotes}
                onOpenSolution={handleOpenSolution}
                onBookmark={handleBookmark}
                onEndReached={loadMoreProblems}
                listRef={flatListRef}
            />

            {/* Modals */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={applyFilters}
                filterOptions={tempFilterOptions}
                availableTopics={availableTopics}
                toggleDifficultyFilter={toggleDifficultyFilter}
                toggleTopicFilter={toggleTopicFilter}
                toggleAllDifficulties={toggleAllDifficulties}
                toggleAllTopics={toggleAllTopics}
            />

            <ProblemDescription
                visible={descriptionModalVisible}
                onClose={() => {
                    //console.log("Closing description modal");
                    setDescriptionModalVisible(false);
                }}
                problem={modalProblem}
            />

            <NotesModal
                visible={notesModalVisible}
                onClose={() => {
                    //console.log("Closing notes modal");
                    setNotesModalVisible(false);
                    // Description modal remains open
                }}
                problem={modalProblem}
            />

            <SolutionModal
                visible={solutionModalVisible}
                onClose={() => {
                    //console.log("Closing solution modal");
                    setSolutionModalVisible(false);
                }}
                problem={modalProblem}
            />

            <AuthModal
                visible={authModalVisible}
                onClose={() => {
                    setAuthModalVisible(false);
                    setPendingBookmarkProblem(null);
                }}
                onSuccess={handleAuthSuccess}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        textAlign: "center",
        color: "#ff375f",
    },
    loadingMoreContainer: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        height: 100,
    },
    filterButton: {
        position: "absolute",
        top: 70,
        right: 20,
        backgroundColor: "#3e4a8a",
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
