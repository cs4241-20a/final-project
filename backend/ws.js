import ws from 'ws';
import { nanoid } from 'nanoid';

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createRandomLobbyId() {
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
}

/** @type {WebSocket[]} */
let clients = [];

/** @type {{[id: string]: {
    id: string;
    owner: WebSocket;
    members: WebSocket[];
    currentChallenge: string | null;
}}} */
const lobbies = {};

/** @type {{[code: string]: { challengeId: string, solution: string }}} */
const confirmationCodes = {};

export function confirmChallengeCompletion(code, challengeId, solution) {
    confirmationCodes[code] = { challengeId, solution };
}

export const wsServer = new ws.Server({ noServer: true });

wsServer.on("connection", (ws, request) => {
    /** @type {{
        id: string;
        owner: WebSocket;
        members: WebSocket[];
        currentChallenge: string | null;
        variant: 'race' | 'classroom';
        solutions: Map<WebSocket, string> | null;
    } | null} */
    let currentLobby = null;

    const clientId = nanoid(5);

    function leaveLobby() {
        if (currentLobby !== null) {
            currentLobby.members.splice(currentLobby.members.indexOf(ws), 1);
            if (currentLobby.members.length === 0) {
                delete lobbies[currentLobby.id];
            }
            else if (currentLobby.owner === ws) {
                currentLobby.owner = currentLobby.members[0];
                currentLobby.owner.send(JSON.stringify({
                    type: "joinLobby",
                    owner: true,
                    lobbyId: currentLobby.id
                }));
            }
            currentLobby = null;
        }
    }

    clients.push(ws);
    ws.addEventListener("message", ({data}) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case "createLobby":
                leaveLobby();
                let lobbyId = createRandomLobbyId();
                while (lobbyId in lobbies) lobbyId = createRandomLobbyId();
                lobbies[lobbyId] = {
                    id: lobbyId,
                    owner: ws,
                    members: [ws],
                    currentChallenge: null,
                    solutions: new Map()
                };
                currentLobby = lobbies[lobbyId];
                ws.send(JSON.stringify({
                    type: "joinLobby",
                    owner: true,
                    lobbyId
                }));
                break;
            case "joinLobby":
                leaveLobby();
                if (message.lobbyId in lobbies) {
                    currentLobby = lobbies[message.lobbyId];
                    currentLobby.members.push(ws);
                    ws.send(JSON.stringify({
                        type: "joinLobby",
                        owner: false,
                        lobbyId: currentLobby.id
                    }));
                }
                break;
            case "startChallenge":
                if (currentLobby !== null && currentLobby.owner === ws) {
                    currentLobby.currentChallenge = message.challenge;
                    currentLobby.variant = message.variant;
                    currentLobby.solutions = new Map();
                    for (const member of currentLobby.members) {
                        member.send(JSON.stringify({
                            type: "startChallenge",
                            challenge: message.challenge,
                            variant: message.variant
                        }));
                    }
                }
            case "completeChallenge":
                if (confirmationCodes[message.code]) {
                    const { challengeId, solution } = confirmationCodes[message.code];
                    delete confirmationCodes[message.code];
                    if (currentLobby !== null && currentLobby.currentChallenge === challengeId) {
                        currentLobby.solutions.set(ws, solution);
                        switch (currentLobby.variant) {
                            case 'race':
                                for (const member of currentLobby.members) {
                                    if (member !== ws) {
                                        member.send(JSON.stringify({
                                            type: "completeChallenge",
                                            variant: currentLobby.variant
                                        }));
                                    }
                                }
                                break;
                            case 'classroom':
                                if (currentLobby.owner !== ws) {
                                    currentLobby.owner.send(JSON.stringify({
                                        type: "completeChallenge",
                                        variant: currentLobby.variant,
                                        solver: clientId,
                                        solution,
                                        certificate: message.code
                                    }));
                                }
                        }
                    }
                }
                break;
        }
    });

    ws.addEventListener("close", () => {
        leaveLobby();
    });
});
