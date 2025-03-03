import React from "react";
import { StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { FilterOptions } from "./types";

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: () => void;
    filterOptions: FilterOptions;
    availableTopics: string[];
    toggleDifficultyFilter: (difficulty: keyof FilterOptions["difficulty"]) => void;
    toggleTopicFilter: (topic: string) => void;
    toggleAllDifficulties: (value: boolean) => void;
    toggleAllTopics: (value: boolean) => void;
}

export function FilterModal({
    visible,
    onClose,
    onApply,
    filterOptions,
    availableTopics,
    toggleDifficultyFilter,
    toggleTopicFilter,
    toggleAllDifficulties,
    toggleAllTopics,
}: FilterModalProps) {
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
                        <ThemedText type="title">Filter Problems</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView style={styles.sectionHeader}>
                        <ThemedText type="subtitle" style={styles.filterSectionTitle}>
                            Difficulty
                        </ThemedText>
                        <ThemedView style={styles.toggleButtons}>
                            <TouchableOpacity
                                style={styles.toggleAllButton}
                                onPress={() => toggleAllDifficulties(true)}
                            >
                                <ThemedText style={styles.toggleAllButtonText}>
                                    All
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.toggleAllButton}
                                onPress={() => toggleAllDifficulties(false)}
                            >
                                <ThemedText style={styles.toggleAllButtonText}>
                                    None
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.difficultyFilters}>
                        {Object.keys(filterOptions.difficulty).map((difficulty) => (
                            <TouchableOpacity
                                key={difficulty}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: filterOptions.difficulty[
                                            difficulty as keyof FilterOptions["difficulty"]
                                        ]
                                            ? difficulty === "Easy"
                                                ? "#00b8a3"
                                                : difficulty === "Medium"
                                                ? "#ffc01e"
                                                : "#ff375f"
                                            : "#e0e0e0",
                                    },
                                ]}
                                onPress={() =>
                                    toggleDifficultyFilter(
                                        difficulty as keyof FilterOptions["difficulty"]
                                    )
                                }
                            >
                                <ThemedText
                                    style={[
                                        styles.filterChipText,
                                        {
                                            color: filterOptions.difficulty[
                                                difficulty as keyof FilterOptions["difficulty"]
                                            ]
                                                ? "white"
                                                : "#888",
                                        },
                                    ]}
                                >
                                    {difficulty}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ThemedView>

                    <ThemedView style={styles.sectionHeader}>
                        <ThemedText type="subtitle" style={styles.filterSectionTitle}>
                            Topics
                        </ThemedText>
                        <ThemedView style={styles.toggleButtons}>
                            <TouchableOpacity
                                style={styles.toggleAllButton}
                                onPress={() => toggleAllTopics(true)}
                            >
                                <ThemedText style={styles.toggleAllButtonText}>
                                    All
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.toggleAllButton}
                                onPress={() => toggleAllTopics(false)}
                            >
                                <ThemedText style={styles.toggleAllButtonText}>
                                    None
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ScrollView style={styles.topicsScrollView}>
                        <ThemedView style={styles.topicsContainer}>
                            {availableTopics.map((topic) => (
                                <TouchableOpacity
                                    key={topic}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: filterOptions.topics[topic]
                                                ? "#3e4a8a"
                                                : "#e0e0e0",
                                        },
                                    ]}
                                    onPress={() => toggleTopicFilter(topic)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.filterChipText,
                                            {
                                                color: filterOptions.topics[topic]
                                                    ? "white"
                                                    : "#888",
                                            },
                                        ]}
                                    >
                                        {topic}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ThemedView>
                    </ScrollView>

                    <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                        <ThemedText style={styles.applyButtonText}>
                            Apply Filters
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
        maxHeight: "80%",
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
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    filterSectionTitle: {
        flex: 1,
    },
    toggleButtons: {
        flexDirection: "row",
    },
    toggleAllButton: {
        backgroundColor: "#3e4a8a",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    toggleAllButtonText: {
        color: "white",
        fontSize: 12,
    },
    difficultyFilters: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    topicsScrollView: {
        maxHeight: 200,
    },
    topicsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipText: {
        fontSize: 14,
    },
    applyButton: {
        backgroundColor: "#3e4a8a",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    applyButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
