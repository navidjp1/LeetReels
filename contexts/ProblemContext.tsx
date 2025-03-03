import React, { createContext, useState, useContext } from "react";
import { LeetCodeProblem } from "@/components/LeetCode/types";

interface ProblemContextType {
    selectedProblem: LeetCodeProblem | null;
    setSelectedProblem: (problem: LeetCodeProblem | null) => void;
}

const ProblemContext = createContext<ProblemContextType>({
    selectedProblem: null,
    setSelectedProblem: () => {},
});

export const ProblemProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [selectedProblem, setSelectedProblem] = useState<LeetCodeProblem | null>(null);

    return (
        <ProblemContext.Provider value={{ selectedProblem, setSelectedProblem }}>
            {children}
        </ProblemContext.Provider>
    );
};

export const useProblem = () => useContext(ProblemContext);
