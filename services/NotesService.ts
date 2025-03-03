import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class NotesService {
    // Save notes to Supabase
    static async saveNotes(userId: string, problemId: string, notes: string) {
        try {
            // Check if notes already exist for this problem
            const { data, error: fetchError } = await supabase
                .from("notes")
                .select("*")
                .eq("user_id", userId)
                .eq("problem_id", problemId)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                // PGRST116 means no rows returned, which is fine
                console.error("Error checking for existing notes:", fetchError);
                throw fetchError;
            }

            // If notes exist, update them; otherwise, insert new notes
            if (data) {
                const { error } = await supabase
                    .from("notes")
                    .update({ content: notes, updated_at: new Date() })
                    .eq("user_id", userId)
                    .eq("problem_id", problemId);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("notes").insert({
                    user_id: userId,
                    problem_id: problemId,
                    content: notes,
                });

                if (error) throw error;
            }

            // Also save to AsyncStorage as a backup
            await AsyncStorage.setItem(`notes_${problemId}`, notes);

            return true;
        } catch (error) {
            console.error("Error saving notes:", error);
            throw error;
        }
    }

    // Get notes from Supabase
    static async getNotes(userId: string, problemId: string) {
        try {
            // Try to get from Supabase first
            const { data, error } = await supabase
                .from("notes")
                .select("content")
                .eq("user_id", userId)
                .eq("problem_id", problemId)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error fetching notes:", error);
            }

            // If found in Supabase, return the content
            if (data) {
                // Also update AsyncStorage
                await AsyncStorage.setItem(`notes_${problemId}`, data.content);
                return data.content;
            }

            // If not found in Supabase, try AsyncStorage
            const localNotes = await AsyncStorage.getItem(`notes_${problemId}`);

            // If found in AsyncStorage and user is logged in, sync to Supabase
            if (localNotes && userId) {
                await this.saveNotes(userId, problemId, localNotes);
            }

            return localNotes || "";
        } catch (error) {
            console.error("Error getting notes:", error);
            // Fallback to AsyncStorage
            try {
                return (await AsyncStorage.getItem(`notes_${problemId}`)) || "";
            } catch {
                return "";
            }
        }
    }
}
