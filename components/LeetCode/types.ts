export interface TopicTag {
    name: string;
    id: string;
    slug: string;
}

export interface LeetCodeProblem {
    acRate: number;
    difficulty: string;
    frontendQuestionId: string;
    title: string;
    titleSlug: string;
    topicTags: TopicTag[];
    status: string | null;
    content?: string;
}

export interface ProblemListResponse {
    data: {
        problemsetQuestionList: {
            total: number;
            questions: LeetCodeProblem[];
        };
    };
}

export interface FilterOptions {
    difficulty: {
        Easy: boolean;
        Medium: boolean;
        Hard: boolean;
    };
    topics: Record<string, boolean>;
}
