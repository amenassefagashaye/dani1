// === WebSocket Connection (Exact Place Inserted) ===
const ws = new WebSocket('wss://ameng-gogs-dani2-62.deno.dev/ws');

ws.onopen = () => console.log("🟢 WebSocket Connected");
ws.onclose = () => console.log("🔴 WebSocket Disconnected");
ws.onerror = (e) => console.error("WebSocket Error:", e);

// ===================================================


// Game State - Optimized
const gameState = {
    gameType: null,
    payment: 0,
    paymentAmount: 25,
    stake: 25,
    totalWon: 0,
    boardId: 1,
    calledNumbers: [],
    markedNumbers: new Set(),
    gameActive: false,
    isCalling: true,
    callInterval: null,
    playerName: '',
    playerPhone: '',
    totalWithdrawn: 0,
    members: [],
    totalMembers: 90,
    calledNumbersDisplay: [],
    maxDisplayNumbers: 8,
    winReady: false,
    centerCell: null,
    currentNumber: null,
    winnerDetected: false,
    currentPattern: null,
    winningPatterns: {
        '75ball': ['row', 'column', 'diagonal', 'four-corners', 'full-house'],
        '90ball': ['one-line', 'two-lines', 'full-house'],
        '30ball': ['full-house'],
        '50ball': ['row', 'column', 'diagonal', 'four-corners', 'full-house'],
        'pattern': ['x-pattern', 'frame', 'postage-stamp', 'small-diamond'],
        'coverall': ['full-board']
    },
    winConditions: {
        'row': 'ረድፍ',
        'column': 'አምድ',
        'diagonal': 'አራት ማዕዘን',
        'four-corners': 'አራት ማዕዘን',
        'full-house': 'ፉል ሀውስ',
        'one-line': 'አንድ መስመር',
        'two-lines': 'ሁለት መስመር',
        'x-pattern': 'X ፓተርን',
        'frame': 'ፍሬም',
        'postage-stamp': 'ፖስታ ቴምብር',
        'small-diamond': 'ትንሽ ዳይመንድ',
        'full-board': 'ሙሉ ቦርድ'
    }
};

// === Incoming Messages from Server ===
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        // Handle admin commands
        if (data.type === "admin-command") {
            console.log("Admin Action:", data.action);
            handleAdminAction(data.action, data.payload || {});
        }

        // Handle user messages if needed
        if (data.type === "user-message") {
            console.log("User Message:", data.message);
        }

    } catch (e) {
        console.log("Raw Message:", event.data);
    }
};

// === Handle Admin Actions ===
function handleAdminAction(action, payload) {
    switch(action){
        case "startGame":
            gameState.gameActive = true;
            console.log("Game Started by Admin");
            break;

        case "nextNumber":
            console.log("Admin called next number");
            break;

        case "resetGame":
            console.log("Game Reset by Admin");
            location.reload();
            break;

        case "announceWinner":
            console.log("Winner Announced by Admin");
            break;
    }
}

// === Example: Send User Message to Server ===
function sendUserMessage(msg){
    ws.send(JSON.stringify({
        type: "user-message",
        message: msg
    }));
}
