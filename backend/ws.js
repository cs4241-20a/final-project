import ws from 'ws';

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

/** @type {{[code: string]: boolean}} */
const confirmationCodes = {};

export function confirmChallengeCompletion(code) {
    confirmationCodes[code] = true;
}

export const wsServer = new ws.Server({ noServer: true });

wsServer.on("connection", (ws, request) => {
    /** @type {{
        id: string;
        owner: WebSocket;
        members: WebSocket[];
        currentChallenge: string | null;
    } | null} */
    let currentLobby = null;
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
                    lobbyId
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
                const lobbyId = createRandomLobbyId();
                lobbies[lobbyId] = {
                    id: lobbyId,
                    owner: ws,
                    members: [ws],
                    currentChallenge: null
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
                    lobbies[message.lobbyId].members.push(ws);
                    ws.send(JSON.stringify({
                        type: "joinLobby",
                        owner: false,
                        lobbyId: message.lobbyId
                    }));
                }
                break;
            case "startChallenge":
                if (currentLobby.owner === ws) {
                    for (const member of currentLobby.members) {
                        member.send(JSON.stringify({
                            type: "startChallenge",
                            challenge: message.challenge
                        }));
                    }
                }
            case "completeChallenge":
                if (confirmationCodes[message.code]) {
                    delete confirmationCodes[message.code];
                    if (currentLobby !== null) {
                        for (const member of currentLobby.members) {
                            member.send(JSON.stringify({
                                type: "completeChallenge"
                            }));
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
