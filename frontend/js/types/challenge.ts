export interface ChallengeShort {
    id: string;
    author: string;
    title: string;
}

export interface Challenge extends ChallengeShort {
    description: string;
    starterCode: string;
    solution: string;
    tests: string;
}