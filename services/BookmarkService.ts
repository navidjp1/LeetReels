import { supabase } from "@/lib/supabase";
import { LeetCodeProblem } from "@/components/LeetCode/types";

export class BookmarkService {
    static async fetchBookmarkedProblems(userId: string) {
        try {
            const { data, error } = await supabase
                .from("bookmarks")
                .select("problem_data")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            if (data && data.length > 0) {
                return data.map((item) => item.problem_data);
            }

            return [];
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            throw error;
        }
    }

    static async fetchBookmarkedProblemIds(userId: string) {
        try {
            const { data, error } = await supabase
                .from("bookmarks")
                .select("problem_id")
                .eq("user_id", userId);

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            const bookmarked: Record<string, boolean> = {};
            if (data) {
                data.forEach((item) => {
                    bookmarked[item.problem_id] = true;
                });
            }

            return bookmarked;
        } catch (error) {
            console.error("Error fetching bookmark IDs:", error);
            throw error;
        }
    }

    static async addBookmark(userId: string, problem: LeetCodeProblem) {
        try {
            const { error } = await supabase.from("bookmarks").insert({
                user_id: userId,
                problem_id: problem.titleSlug,
                problem_data: problem,
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error adding bookmark:", error);
            throw error;
        }
    }

    static async removeBookmark(userId: string, problemId: string) {
        try {
            const { error } = await supabase
                .from("bookmarks")
                .delete()
                .eq("user_id", userId)
                .eq("problem_id", problemId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error removing bookmark:", error);
            throw error;
        }
    }
}
