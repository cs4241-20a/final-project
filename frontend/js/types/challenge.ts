export interface ChallengeShort {
    author: string;
    title: string;
}

export interface Challenge extends ChallengeShort {
    id: string;
    author: string;
    title: string;
    description: string;
    starterCode: string;
    solution: string;
    tests: string;
}