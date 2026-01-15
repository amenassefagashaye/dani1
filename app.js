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
        'diagonal': 'ዲያግናል',
        'four-corners': 'አራት ማእዘኖች',
        'full-house': 'ሙሉ ቤት',
        'one-line': 'አንድ ረድፍ',
        'two-lines': 'ሁለት ረድፍ',
        'x-pattern': 'X ንድፍ',
        'frame': 'አውራ ቀለበት',
        'postage-stamp': 'ማህተም',
        'small-diamond': 'ዲያምንድ',
        'full-board': 'ሙሉ ቦርድ'
    },
    playerId: null,
    sessionId: null,
    isAdmin: false
};

// Board Types
const boardTypes = [
    { id: '75ball', name: '75-ቢንጎ', icon: '🎯', desc: '5×5 ከBINGO', range: 75, columns: 5 },
    { id: '90ball', name: '90-ቢንጎ', icon: '🇬🇧', desc: '9×3 ፈጣን', range: 90, columns: 9 },
    { id: '30ball', name: '30-ቢንጎ', icon: '⚡', desc: '3×3 ፍጥነት', range: 30, columns: 3 },
    { id: '50ball', name: '50-ቢንጎ', icon: '🎲', desc: '5×5 ከBINGO', range: 50, columns: 5 },
    { id: 'pattern', name: 'ንድፍ ቢንጎ', icon: '✨', desc: 'ተጠቀም ንድፍ', range: 75, columns: 5 },
    { id: 'coverall', name: 'ሙሉ ቤት', icon: '🏆', desc: 'ሁሉንም ምልክት ያድርጉ', range: 90, columns: 9 }
];

// Help content
const helpContent = {
    'general': `
        <div class="help-section">
            <div class="help-title amharic-text">ቢንጎ ምንድን ነው? / What is Bingo?</div>
            <div class="help-text amharic-text">
                ቢንጎ የአጋጣሚ ቁጥሮችን የሚጠቀም ጨዋታ ነው። ቁጥሮች በዘፈቀደ ይጠራሉ፣ ተጫዋቾች ደግሞ በመሳቸው ሰንጠረዥ ላይ ተጠርተው ያዩትን ምልክት ያደርጋሉ። አንድ ንድፍ ሙሉ ሲሆን "ቢንጎ" በማለት ይጠራሉ።
            </div>
            <div class="help-text">
                Bingo is a game of chance where numbers are randomly drawn and players mark them on their cards. The first to complete a pattern calls "Bingo" and wins.
            </div>
        </div>
        <div class="help-section">
            <div class="help-title amharic-text">የጨዋታ አወቃቀር / Game Structure</div>
            <div class="help-text amharic-text">
                1. የጨዋታ ገጽ 6: የተለያዩ ቦርድ ዓይነቶች<br>
                2. ምዝገባ ገጽ: የተጫዋች መረጃ እና ክፍያ<br>
                3. የጨዋታ ቦርድ: የቁጥር ምልክት እና አሸናፊነት<br>
                4. ፋይናንስ ገጽ: ሚዛን እና የማውጣት ሂደት<br>
                5. እርዳታ ገጽ: ዝርዝር መመሪያ በአማርኛ እና እንግሊዝኛ
            </div>
            <div class="help-text">
                1. Game Page 6: Different board types<br>
                2. Registration Page: Player info and payment<br>
                3. Game Board: Number marking and winning<br>
                4. Finance Page: Balance and withdrawal<br>
                5. Help Page: Detailed instructions in Amharic and English
            </div>
        </div>
    `,
    'rules': `
        <div class="help-section">
            <div class="help-title amharic-text">አጠቃላይ ደንቦች / General Rules</div>
            <div class="help-text amharic-text">
                1. እያንዳንዱ ተጫዋች የቢንጎ ሰንጠረዥ ይገዛል<br>
                2. ቁጥሮች በዘፈቀደ ይጠራሉ (ሁለ 7 ሰከንድ)<br>
                3. የተጠራው ቁጥር በሰንጠረዥህ ላይ ካለ ምልክት አድርግ<br>
                4. ንድፍ ሙሉ ከሆነ መሃል ሕዋሱን ይንኩ<br>
                5. ሽልማት ይቀበላሉ
            </div>
            <div class="help-text">
                1. Each player buys a bingo card<br>
                2. Numbers are randomly called (every 7 seconds)<br>
                3. Mark called numbers on your card<br>
                4. Click center cell when pattern is complete<br>
                5. Receive your prize
            </div>
        </div>
    `,
    // Add other help sections similarly...
};

// Calculate potential win
function calculatePotentialWin(stake) {
    const validMembers = 90;
    const potential = (0.8 * validMembers * stake * 0.97);
    return Math.floor(potential);
}

// Initialize
function init() {
    setupBoardSelection();
    setupStakeOptions();
    setupBoardNumbers();
    generateMembers();
    updatePotentialWin();
    loadHelpContent();
    checkAdminMode();
    
    document.getElementById('nextBtn').onclick = () => {
        if (gameState.gameType) showPage(2);
        else showNotification('እባክዎ የቦርድ ዓይነት ይምረጡ', false);
    };
    document.getElementById('confirmBtn').onclick = confirmRegistration;
    document.getElementById('circularCallBtn').onclick = toggleCalling;
    document.getElementById('playerStake').onchange = updatePotentialWin;
    document.getElementById('paymentAmount').onchange = processPayment;
    
    updateCalledNumbersDisplay();
    
    // Generate unique player ID
    gameState.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    gameState.sessionId = 'session_' + Date.now();
}

// Setup Board Selection
function setupBoardSelection() {
    const grid = document.getElementById('boardTypeGrid');
    grid.innerHTML = '';
    
    boardTypes.forEach(type => {
        const card = document.createElement('div');
        card.className = 'board-type-card';
        card.innerHTML = `
            <div class="board-type-icon">${type.icon}</div>
            <div class="board-type-title amharic-text">${type.name}</div>
            <div class="board-type-desc amharic-text">${type.desc}</div>
        `;
        card.onclick = () => {
            document.querySelectorAll('.board-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameState.gameType = type.id;
            if (type.id === 'pattern') {
                const patterns = gameState.winningPatterns.pattern;
                gameState.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
            }
        };
        
        grid.appendChild(card);
    });
}

// Setup Stake Options
function setupStakeOptions() {
    const select = document.getElementById('playerStake');
    const stakes = [25, 50, 100, 200, 500, 1000, 2000, 5000];
    stakes.forEach(stake => {
        const option = document.createElement('option');
        option.value = stake;
        option.textContent = `${stake} ብር`;
        select.appendChild(option);
    });
    select.value = 25;
    gameState.stake = 25;
}

// Setup Board Numbers
function setupBoardNumbers() {
    const select = document.getElementById('boardSelect');
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `ቦርድ ${i}`;
        select.appendChild(option);
    }
    select.value = 1;
}

// Load Help Content
function loadHelpContent() {
    const helpDiv = document.getElementById('helpContent');
    helpDiv.innerHTML = helpContent['general'];
}

// Generate sample members
function generateMembers() {
    const names = [
        'መለስ ዜናዊ', 'አብይ አህመድ', 'ሳህለ ወልደ ማርያም', 'ደመቀ መኮንን',
        'ተዋሕዶ ረዳ', 'ብርሃን ነጋ', 'ሙሉጌታ ገብረ ክርስቶስ', 'ፍቅር አለማየሁ'
    ];
    
    const boardTypesList = ['75-ቢንጎ', '90-ቢንጎ', '30-ቢንጎ', '50-ቢንጎ', 'ንድፍ', 'ሙሉ ቤት'];
    
    gameState.members = [];
    
    for (let i = 1; i <= 90; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const boardType = boardTypesList[Math.floor(Math.random() * boardTypesList.length)];
        const boards = Math.floor(Math.random() * 5) + 1;
        const paid = i <= 85;
        const won = Math.random() > 0.9 && paid;
        const stake = [25, 50, 100, 200, 500, 1000, 2000, 5000][Math.floor(Math.random() * 8)];
        const payment = paid ? stake + Math.floor(Math.random() * 100) : 0;
        const balance = payment + (won ? calculatePotentialWin(stake) * Math.random() : 0);
        const withdrawn = Math.random() > 0.7 ? Math.floor(balance * 0.5) : 0;
        
        gameState.members.push({
            id: i,
            name: `${name} ${i}`,
            phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
            boardType: boardType,
            boards: boards,
            paid: paid,
            won: won,
            stake: stake,
            payment: payment,
            balance: balance,
            withdrawn: withdrawn
        });
    }
    
    gameState.members.sort((a, b) => b.payment - a.payment);
}

// Show Page
function showPage(pageNum) {
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page${pageNum}`).classList.add('active');
    
    if (pageNum === 3) {
        generateGameBoard();
        startNewGame();
    }
    if (pageNum === 4) {
        updateFinance();
    }
    if (pageNum === 5) {
        showHelpTab('general');
    }
}

// Show Help Tab
function showHelpTab(tabId) {
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const helpDiv = document.getElementById('helpContent');
    helpDiv.innerHTML = helpContent[tabId] || helpContent['general'];
    
    // Mark active button
    const activeBtn = document.querySelector(`.help-nav-btn[onclick="showHelpTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Show Members Modal
function showMembers() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';
    
    gameState.members.forEach(member => {
        const row = document.createElement('tr');
        row.className = 'member-row';
        row.innerHTML = `
            <td>${member.id}</td>
            <td class="member-name">${member.name}</td>
            <td>${member.phone}</td>
            <td class="${member.paid ? 'member-paid' : 'member-not-paid'}">${member.paid ? '✓' : '✗'}</td>
            <td>${member.stake} ብር</td>
            <td>${Math.floor(member.balance)} ብር</td>
        `;
        membersList.appendChild(row);
    });
    
    document.getElementById('membersModal').style.display = 'block';
}

// Show Potential Win Modal
function showPotentialWin() {
    const tbody = document.getElementById('winningTableBody');
    tbody.innerHTML = '';
    
    const stakes = [25, 50, 100, 200, 500, 1000, 2000, 5000];
    stakes.forEach(stake => {
        const winAmount = calculatePotentialWin(stake);
        const row = document.createElement('tr');
        row.className = stake === gameState.stake ? 'current-stake-row' : '';
        row.innerHTML = `
            <td class="amharic-text">${stake} ብር</td>
            <td class="win-amount">${winAmount.toLocaleString()} ብር</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('potentialWinModal').style.display = 'block';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Update Potential Win Display
function updatePotentialWin() {
    const stake = parseInt(document.getElementById('playerStake').value) || 25;
    const winAmount = calculatePotentialWin(stake);
    
    document.getElementById('currentWinDisplay').textContent = winAmount.toLocaleString();
    gameState.stake = stake;
}

// Show Notification
function showNotification(message, showContinue) {
    document.getElementById('notificationText').textContent = message;
    document.getElementById('continueBtn').style.display = showContinue ? 'flex' : 'none';
    document.getElementById('notification').style.display = 'block';
}

// Hide Notification
function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

// Continue with incomplete information
function continueWithIncomplete() {
    hideNotification();
    gameState.playerName = document.getElementById('playerName').value || 'Guest';
    gameState.playerPhone = document.getElementById('playerPhone').value || '0000000000';
    gameState.stake = parseInt(document.getElementById('playerStake').value) || 25;
    gameState.boardId = document.getElementById('boardSelect').value || 1;
    showPage(3);
}

// Process Payment
function processPayment() {
    const amount = parseInt(document.getElementById('paymentAmount').value);
    
    if (!amount || amount < 25) {
        return;
    }
    
    gameState.payment = amount;
    gameState.paymentAmount = amount;
    
    const select = document.getElementById('paymentAmount');
    select.style.background = '#28a745';
    select.style.color = 'white';
}

// Confirm Registration
function confirmRegistration() {
    const name = document.getElementById('playerName').value;
    const phone = document.getElementById('playerPhone').value;
    const stake = document.getElementById('playerStake').value;
    const board = document.getElementById('boardSelect').value;
    
    const incomplete = !name || !phone || !stake || !board || gameState.payment === 0;
    
    if (incomplete) {
        showNotification('መረጃዎች ሙሉ አይደሉም። በዚህ ሁኔታ መቀጠል ይፈልጋሉ?', true);
        return;
    }
    
    gameState.playerName = name;
    gameState.playerPhone = phone;
    gameState.stake = parseInt(stake);
    gameState.boardId = board;
    
    // Add to members
    const existing = gameState.members.find(m => m.phone === phone);
    if (!existing) {
        const boardTypeName = boardTypes.find(t => t.id === gameState.gameType)?.name || '75-ቢንጎ';
        gameState.members.unshift({
            id: gameState.members.length + 1,
            name: name,
            phone: phone,
            boardType: boardTypeName,
            boards: 1,
            paid: true,
            won: false,
            stake: gameState.stake,
            payment: gameState.payment,
            balance: gameState.payment,
            withdrawn: 0
        });
    }
    
    // Send registration to server
    if (window.ws && window.ws.connected) {
        window.ws.send({
            type: 'register',
            playerId: gameState.playerId,
            name: name,
            phone: phone,
            stake: gameState.stake,
            boardType: gameState.gameType,
            boardId: board
        });
    }
    
    showPage(3);
}

// Generate Game Board
function generateGameBoard() {
    const board = document.getElementById('gameBoard');
    const header = document.getElementById('gameHeader');
    const type = boardTypes.find(t => t.id === gameState.gameType);
    
    board.innerHTML = '';
    header.textContent = `${type.name} - ቦርድ ${gameState.boardId}`;
    
    if (gameState.gameType === '75ball' || gameState.gameType === '50ball') {
        generateBingoBoard(type);
    } else if (gameState.gameType === '90ball') {
        generate90BallBoard(type);
    } else if (gameState.gameType === '30ball') {
        generate30BallBoard(type);
    } else if (gameState.gameType === 'pattern') {
        generatePatternBoard(type);
    } else if (gameState.gameType === 'coverall') {
        generateCoverallBoard(type);
    }
}

// Generate BINGO Board (75/50 ball)
function generateBingoBoard(type) {
    const board = document.getElementById('gameBoard');
    const wrapper = document.createElement('div');
    wrapper.className = 'board-75-wrapper';
    
    // BINGO Labels
    const labels = document.createElement('div');
    labels.className = 'bingo-labels';
    'BINGO'.split('').forEach(letter => {
        const label = document.createElement('div');
        label.className = 'bingo-label';
        label.textContent = letter;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Board Grid
    const grid = document.createElement('div');
    grid.className = type.id === '75ball' ? 'board-75' : 'board-50';
    
    const columnRanges = type.id === '75ball' ? 
        [[1,15], [16,30], [31,45], [46,60], [61,75]] :
        [[1,10], [11,20], [21,30], [31,40], [41,50]];
    
    const columnNumbers = columnRanges.map(range => {
        let nums = new Set();
        while (nums.size < 5) {
            nums.add(Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]);
        }
        return Array.from(nums).sort((a, b) => a - b);
    });
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('button');
            cell.className = 'board-cell';
            
            if (row === 2 && col === 2) {
                cell.textContent = '★';
                cell.classList.add('center-cell');
                cell.dataset.center = 'true';
                cell.onclick = () => {
                    if (gameState.winReady) {
                        claimWin();
                    }
                };
                gameState.centerCell = cell;
            } else {
                const num = columnNumbers[col][row];
                cell.textContent = num;
                cell.dataset.number = num;
                cell.dataset.row = row;
                cell.dataset.column = col;
                cell.onclick = () => toggleMark(cell, num);
            }
            
            grid.appendChild(cell);
        }
    }
    
    wrapper.appendChild(grid);
    board.appendChild(wrapper);
}

// Generate 90 Ball Board
function generate90BallBoard(type) {
    const board = document.getElementById('gameBoard');
    const wrapper = document.createElement('div');
    wrapper.className = 'board-90-wrapper';
    
    // Column labels
    const labels = document.createElement('div');
    labels.className = 'board-90-labels';
    for (let i = 1; i <= 9; i++) {
        const label = document.createElement('div');
        label.className = 'board-90-label';
        label.textContent = `${(i-1)*10+1}-${i*10}`;
        labels.appendChild(label);
    }
    wrapper.appendChild(labels);
    
    // Board Grid
    const grid = document.createElement('div');
    grid.className = 'board-90';
    
    const ranges = [
        [1,10], [11,20], [21,30], [31,40], [41,50],
        [51,60], [61,70], [71,80], [81,90]
    ];
    
    const columnNumbers = ranges.map(range => {
        const count = Math.floor(Math.random() * 3) + 1;
        let nums = new Set();
        while (nums.size < count) {
            nums.add(Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]);
        }
        return Array.from(nums).sort((a, b) => a - b);
    });
    
    const layout = Array(3).fill().map(() => Array(9).fill(null));
    
    columnNumbers.forEach((nums, col) => {
        const positions = [0,1,2].sort(() => Math.random() - 0.5).slice(0, nums.length);
        positions.forEach((row, idx) => {
            layout[row][col] = nums[idx];
        });
    });
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('button');
            cell.className = 'board-cell';
            const num = layout[row][col];
            
            if (num) {
                cell.textContent = num;
                cell.dataset.number = num;
                cell.dataset.row = row;
                cell.dataset.column = col;
                
                // Center cell (row 2, column 4)
                if (row === 1 && col === 4) {
                    cell.classList.add('center-cell');
                    cell.dataset.center = 'true';
                    gameState.centerCell = cell;
                    cell.onclick = () => {
                        if (gameState.winReady) {
                            claimWin();
                        } else {
                            toggleMark(cell, num);
                        }
                    };
                } else {
                    cell.onclick = () => toggleMark(cell, num);
                }
            } else {
                cell.classList.add('blank-cell');
                cell.textContent = '✗';
            }
            
            grid.appendChild(cell);
        }
    }
    
    wrapper.appendChild(grid);
    board.appendChild(wrapper);
}

// Generate 30 Ball Board
function generate30BallBoard(type) {
    const board = document.getElementById('gameBoard');
    const wrapper = document.createElement('div');
    wrapper.className = 'board-30-wrapper';
    
    // Column labels
    const labels = document.createElement('div');
    labels.className = 'board-30-labels';
    for (let i = 1; i <= 3; i++) {
        const label = document.createElement('div');
        label.className = 'board-30-label';
        label.textContent = `${(i-1)*10+1}-${i*10}`;
        labels.appendChild(label);
    }
    wrapper.appendChild(labels);
    
    // Board Grid
    const grid = document.createElement('div');
    grid.className = 'board-30';
    
    let nums = new Set();
    while (nums.size < 9) {
        nums.add(Math.floor(Math.random() * 30) + 1);
    }
    const numbers = Array.from(nums).sort((a, b) => a - b);
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'board-cell';
        cell.textContent = numbers[i];
        cell.dataset.number = numbers[i];
        cell.dataset.index = i;
        
        // Center cell (index 4)
        if (i === 4) {
            cell.classList.add('center-cell');
            cell.dataset.center = 'true';
            gameState.centerCell = cell;
            cell.onclick = () => {
                if (gameState.winReady) {
                    claimWin();
                } else {
                    toggleMark(cell, numbers[i]);
                }
            };
        } else {
            cell.onclick = () => toggleMark(cell, numbers[i]);
        }
        
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    board.appendChild(wrapper);
}

// Generate Pattern Board
function generatePatternBoard(type) {
    const board = document.getElementById('gameBoard');
    const wrapper = document.createElement('div');
    wrapper.className = 'board-pattern-wrapper';
    
    // BINGO Labels
    const labels = document.createElement('div');
    labels.className = 'board-pattern-labels';
    'BINGO'.split('').forEach(letter => {
        const label = document.createElement('div');
        label.className = 'board-pattern-label';
        label.textContent = letter;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Board Grid
    const grid = document.createElement('div');
    grid.className = 'board-pattern';
    
    const columnRanges = [[1,15], [16,30], [31,45], [46,60], [61,75]];
    const columnNumbers = columnRanges.map(range => {
        let nums = new Set();
        while (nums.size < 5) {
            nums.add(Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]);
        }
        return Array.from(nums).sort((a, b) => a - b);
    });
    
    // Define pattern cells
    const patternCells = getPatternCells(gameState.currentPattern);
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('button');
            cell.className = 'board-cell';
            
            if (row === 2 && col === 2) {
                cell.textContent = '★';
                cell.classList.add('center-cell');
                cell.dataset.center = 'true';
                cell.onclick = () => {
                    if (gameState.winReady) {
                        claimWin();
                    }
                };
                gameState.centerCell = cell;
            } else {
                const num = columnNumbers[col][row];
                cell.textContent = num;
                cell.dataset.number = num;
                cell.dataset.row = row;
                cell.dataset.column = col;
                
                if (patternCells.includes(`${row}-${col}`)) {
                    cell.classList.add('pattern-cell');
                }
                
                cell.onclick = () => toggleMark(cell, num);
            }
            
            grid.appendChild(cell);
        }
    }
    
    wrapper.appendChild(grid);
    board.appendChild(wrapper);
}

// Generate Coverall Board
function generateCoverallBoard(type) {
    const board = document.getElementById('gameBoard');
    const wrapper = document.createElement('div');
    wrapper.className = 'board-coverall-wrapper';
    
    // Column labels
    const labels = document.createElement('div');
    labels.className = 'board-coverall-labels';
    for (let i = 1; i <= 9; i++) {
        const label = document.createElement('div');
        label.className = 'board-coverall-label';
        label.textContent = `${(i-1)*10+1}-${i*10}`;
        labels.appendChild(label);
    }
    wrapper.appendChild(labels);
    
    // Board Grid
    const grid = document.createElement('div');
    grid.className = 'board-coverall';
    
    let allNumbers = Array.from({length: 90}, (_, i) => i + 1);
    allNumbers = shuffleArray(allNumbers).slice(0, 45);
    
    for (let i = 0; i < 45; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const cell = document.createElement('button');
        cell.className = 'board-cell';
        cell.textContent = allNumbers[i];
        cell.dataset.number = allNumbers[i];
        cell.dataset.index = i;
        
        // Center cell (row 2, column 4)
        if (row === 2 && col === 4) {
            cell.classList.add('center-cell');
            cell.dataset.center = 'true';
            gameState.centerCell = cell;
            cell.onclick = () => {
                if (gameState.winReady) {
                    claimWin();
                } else {
                    toggleMark(cell, allNumbers[i]);
                }
            };
        } else {
            cell.onclick = () => toggleMark(cell, allNumbers[i]);
        }
        
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    board.appendChild(wrapper);
}

// Get pattern cells
function getPatternCells(pattern) {
    const patterns = {
        'x-pattern': ['0-0', '0-4', '1-1', '1-3', '2-2', '3-1', '3-3', '4-0', '4-4'],
        'frame': ['0-0', '0-1', '0-2', '0-3', '0-4', '4-0', '4-1', '4-2', '4-3', '4-4', '1-0', '2-0', '3-0', '1-4', '2-4', '3-4'],
        'postage-stamp': ['0-0', '0-1', '1-0', '1-1', '3-3', '3-4', '4-3', '4-4'],
        'small-diamond': ['1-2', '2-1', '2-2', '2-3', '3-2']
    };
    return patterns[pattern] || patterns['x-pattern'];
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Toggle Mark
function toggleMark(cell, number) {
    if (!gameState.gameActive) return;
    
    if (cell.classList.contains('marked')) {
        cell.classList.remove('marked');
        gameState.markedNumbers.delete(number);
    } else {
        cell.classList.add('marked');
        gameState.markedNumbers.add(number);
    }
    
    // Send mark to server
    if (window.ws && window.ws.connected) {
        window.ws.send({
            type: 'mark',
            playerId: gameState.playerId,
            number: number,
            marked: cell.classList.contains('marked')
        });
    }
    
    checkForWin();
}

// Start New Game
function startNewGame() {
    gameState.gameActive = true;
    gameState.calledNumbers = [];
    gameState.calledNumbersDisplay = [];
    gameState.markedNumbers.clear();
    gameState.winReady = false;
    gameState.currentNumber = null;
    gameState.winnerDetected = false;
    
    // Reset center cell
    if (gameState.centerCell) {
        gameState.centerCell.classList.remove('winner-ready', 'winner-claimed');
        gameState.centerCell.classList.add('center-cell');
        if (gameState.gameType === '75ball' || gameState.gameType === '50ball' || gameState.gameType === 'pattern') {
            gameState.centerCell.textContent = '★';
        }
        const indicator = gameState.centerCell.querySelector('.winner-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Reset circular call button
    document.getElementById('currentNumberDisplay').textContent = '';
    document.getElementById('circularCallBtn').classList.remove('calling');
    
    updateCalledNumbersDisplay();
    
    stopCalling();
    
    setTimeout(() => {
        startAutoCalling();
    }, 1000);
}

// Start Auto Calling
function startAutoCalling() {
    gameState.isCalling = true;
    const btn = document.getElementById('circularCallBtn');
    btn.classList.add('calling');
    
    callNextNumber();
    gameState.callInterval = setInterval(callNextNumber, 7000);
}

// Toggle Calling
function toggleCalling() {
    const btn = document.getElementById('circularCallBtn');
    
    if (gameState.isCalling) {
        stopCalling();
        btn.classList.remove('calling');
    } else {
        startAutoCalling();
    }
}

// Stop Calling
function stopCalling() {
    gameState.isCalling = false;
    if (gameState.callInterval) {
        clearInterval(gameState.callInterval);
        gameState.callInterval = null;
    }
}

// Call Next Number
function callNextNumber() {
    if (!gameState.gameActive || !gameState.isCalling) return;
    
    const type = boardTypes.find(t => t.id === gameState.gameType);
    let number;
    
    do {
        number = Math.floor(Math.random() * type.range) + 1;
    } while (gameState.calledNumbers.includes(number));
    
    gameState.calledNumbers.push(number);
    
    let displayText = number.toString();
    
    if (gameState.gameType === '75ball' || gameState.gameType === '50ball' || gameState.gameType === 'pattern') {
        const letters = 'BINGO';
        let columnSize, columnIndex;
        
        if (gameState.gameType === '75ball' || gameState.gameType === 'pattern') {
            columnSize = 15;
            columnIndex = Math.floor((number - 1) / columnSize);
        } else {
            columnSize = 10;
            columnIndex = Math.floor((number - 1) / columnSize);
        }
        
        columnIndex = Math.min(columnIndex, 4);
        const letter = letters[columnIndex];
        displayText = `${letter}-${number}`;
    }
    
    if (gameState.currentNumber) {
        moveNumberToBar(gameState.currentNumber);
    }
    
    gameState.currentNumber = displayText;
    document.getElementById('currentNumberDisplay').textContent = displayText;
    
    // Send called number to server
    if (window.ws && window.ws.connected) {
        window.ws.send({
            type: 'call',
            playerId: gameState.playerId,
            number: number,
            display: displayText
        });
    }
    
    const audio = document.getElementById('callAudio');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    
    checkForWin();
}

// Move number from circular button to bar
function moveNumberToBar(number) {
    gameState.calledNumbersDisplay.unshift(number);
    if (gameState.calledNumbersDisplay.length > gameState.maxDisplayNumbers) {
        gameState.calledNumbersDisplay.pop();
    }
    
    updateCalledNumbersDisplay();
}

// Update Called Numbers Display
function updateCalledNumbersDisplay() {
    const bar = document.getElementById('calledNumbersBar');
    bar.innerHTML = '';
    
    gameState.calledNumbersDisplay.forEach(num => {
        const span = document.createElement('span');
        span.className = 'called-number amharic-text';
        span.textContent = num;
        bar.appendChild(span);
    });
    
    if (gameState.calledNumbersDisplay.length === 0) {
        bar.innerHTML = '<span style="color: #888; font-style: italic;" class="amharic-text">ቁጥሮች ይጠራሉ...</span>';
    }
}

// Check for Win
function checkForWin() {
    if (!gameState.gameActive) return;
    
    const win = calculateWin();
    if (win && !gameState.winReady) {
        enableWinClaim(win);
    }
}

// Calculate Win
function calculateWin() {
    const type = gameState.gameType;
    const patterns = gameState.winningPatterns[type];
    
    for (const pattern of patterns) {
        if (checkPattern(pattern)) {
            return { pattern: pattern };
        }
    }
    
    return null;
}

// Check Specific Pattern
function checkPattern(pattern) {
    const cells = document.querySelectorAll('.board-cell:not(.blank-cell)');
    const markedCells = Array.from(cells).filter(cell => 
        cell.classList.contains('marked') || 
        (cell.classList.contains('center-cell') && 
         (gameState.gameType === '75ball' || gameState.gameType === '50ball' || gameState.gameType === 'pattern'))
    );
    
    const markedPositions = new Set();
    markedCells.forEach(cell => {
        if (cell.dataset.row !== undefined && cell.dataset.column !== undefined) {
            markedPositions.add(`${cell.dataset.row}-${cell.dataset.column}`);
        } else if (cell.dataset.index !== undefined) {
            markedPositions.add(`i${cell.dataset.index}`);
        }
    });
    
    switch(gameState.gameType) {
        case '75ball':
        case '50ball':
            return check75BallPattern(pattern, markedPositions);
        case '90ball':
            return check90BallPattern(pattern, markedPositions);
        case '30ball':
            return check30BallPattern(pattern, markedPositions);
        case 'pattern':
            return checkPatternBingo(pattern, markedPositions);
        case 'coverall':
            return checkCoverallPattern(pattern, markedPositions);
        default:
            return false;
    }
}

// Check 75-Ball Patterns
function check75BallPattern(pattern, markedPositions) {
    switch(pattern) {
        case 'row':
            for (let row = 0; row < 5; row++) {
                let complete = true;
                for (let col = 0; col < 5; col++) {
                    const pos = `${row}-${col}`;
                    if (row === 2 && col === 2) continue;
                    if (!markedPositions.has(pos)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) return true;
            }
            return false;
            
        case 'column':
            for (let col = 0; col < 5; col++) {
                let complete = true;
                for (let row = 0; row < 5; row++) {
                    const pos = `${row}-${col}`;
                    if (row === 2 && col === 2) continue;
                    if (!markedPositions.has(pos)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) return true;
            }
            return false;
            
        case 'diagonal':
            let diag1Complete = true;
            for (let i = 0; i < 5; i++) {
                const pos = `${i}-${i}`;
                if (i === 2) continue;
                if (!markedPositions.has(pos)) {
                    diag1Complete = false;
                    break;
                }
            }
            if (diag1Complete) return true;
            
            let diag2Complete = true;
            for (let i = 0; i < 5; i++) {
                const pos = `${i}-${4-i}`;
                if (i === 2) continue;
                if (!markedPositions.has(pos)) {
                    diag2Complete = false;
                    break;
                }
            }
            return diag2Complete;
            
        case 'four-corners':
            const corners = ['0-0', '0-4', '4-0', '4-4'];
            return corners.every(pos => markedPositions.has(pos));
            
        case 'full-house':
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (row === 2 && col === 2) continue;
                    const pos = `${row}-${col}`;
                    if (!markedPositions.has(pos)) {
                        return false;
                    }
                }
            }
            return true;
            
        default:
            return false;
    }
}

// Check 90-Ball Patterns
function check90BallPattern(pattern, markedPositions) {
    const rowCounts = [0, 0, 0];
    const totalCells = 15;
    
    const markedCells = Array.from(document.querySelectorAll('.board-cell:not(.blank-cell)')).filter(cell => 
        cell.classList.contains('marked')
    );
    
    markedCells.forEach(cell => {
        if (cell.dataset.row !== undefined) {
            const row = parseInt(cell.dataset.row);
            if (row >= 0 && row < 3) {
                rowCounts[row]++;
            }
        }
    });
    
    switch(pattern) {
        case 'one-line':
            return rowCounts.some(count => count >= 5);
            
        case 'two-lines':
            const rowsWithAllNumbers = rowCounts.filter(count => count >= 5);
            return rowsWithAllNumbers.length >= 2;
            
        case 'full-house':
            return markedCells.length >= totalCells;
            
        default:
            return false;
    }
}

// Check 30-Ball Pattern
function check30BallPattern(pattern, markedPositions) {
    if (pattern === 'full-house') {
        return markedPositions.size >= 9;
    }
    return false;
}

// Check Pattern Bingo
function checkPatternBingo(pattern, markedPositions) {
    const patternCells = getPatternCells(pattern);
    return patternCells.every(pos => markedPositions.has(pos));
}

// Check Coverall Pattern
function checkCoverallPattern(pattern, markedPositions) {
    if (pattern === 'full-board') {
        return markedPositions.size >= 45;
    }
    return false;
}

// Enable Win Claim
function enableWinClaim(win) {
    if (gameState.winReady) return;
    
    gameState.winReady = true;
    gameState.winnerDetected = true;
    gameState.winningPattern = win.pattern;
    
    if (gameState.centerCell) {
        gameState.centerCell.classList.remove('center-cell');
        gameState.centerCell.classList.add('winner-ready');
        gameState.centerCell.textContent = '🎉';
        
        const indicator = document.createElement('div');
        indicator.className = 'winner-indicator';
        indicator.textContent = '✓';
        gameState.centerCell.appendChild(indicator);
    }
    
    stopCalling();
}

// Claim Win
function claimWin() {
    if (!gameState.winReady) return;
    
    const winAmount = calculatePotentialWin(gameState.stake);
    gameState.totalWon += winAmount;
    
    if (gameState.centerCell) {
        gameState.centerCell.classList.remove('winner-ready');
        gameState.centerCell.classList.add('winner-claimed');
        gameState.centerCell.textContent = '🏆';
    }
    
    document.getElementById('winnerName').textContent = gameState.playerName;
    document.getElementById('winPattern').textContent = gameState.winConditions[gameState.winningPattern] || gameState.winningPattern;
    document.getElementById('displayWinAmount').textContent = `${winAmount.toLocaleString()} ብር`;
    document.getElementById('winnerNotification').style.display = 'block';
    
    // Send win to server
    if (window.ws && window.ws.connected) {
        window.ws.send({
            type: 'win',
            playerId: gameState.playerId,
            name: gameState.playerName,
            pattern: gameState.winningPattern,
            amount: winAmount
        });
    }
    
    const audio = document.getElementById('winAudio');
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// Continue Game
function continueGame() {
    document.getElementById('winnerNotification').style.display = 'none';
    startNewGame();
}

// Update Finance
function updateFinance() {
    const balance = gameState.payment + gameState.totalWon - gameState.totalWithdrawn;
    const withdraw = Math.floor(balance * 0.97);
    
    document.getElementById('totalPayment').value = `${gameState.payment} ብር`;
    document.getElementById('totalWon').value = `${gameState.totalWon.toLocaleString()} ብር`;
    document.getElementById('currentBalance').value = `${balance.toLocaleString()} ብር`;
    document.getElementById('withdrawAmount').value = `${withdraw.toLocaleString()} ብር`;
}

// Process Withdrawal
function processWithdrawal() {
    const account = document.getElementById('withdrawAccount').value;
    const amount = parseInt(document.getElementById('withdrawAmount').value.replace(/,/g, ''));
    
    if (!account) {
        showNotification('የአካውንት ቁጥር ያስገቡ', false);
        return;
    }
    
    if (amount < 25) {
        showNotification('ዝቅተኛ መጠን 25 ብር', false);
        return;
    }
    
    const balance = gameState.payment + gameState.totalWon - gameState.totalWithdrawn;
    if (amount > balance) {
        showNotification('በቂ ሚዛን የለም', false);
        return;
    }
    
    gameState.totalWithdrawn += amount;
    updateFinance();
    showNotification(`${amount.toLocaleString()} ብር በተሳካ ሁኔታ ተወግዷል!`, false);
}

// Check Admin Mode
function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        document.getElementById('adminLoginModal').style.display = 'block';
    }
}

// Admin Login
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'asse2123') {
        gameState.isAdmin = true;
        closeModal('adminLoginModal');
        showNotification('እንኳን ወደ አስተዳዳሪ ፓነል በደህና መጡ!', false);
        
        // Show admin panel
        document.getElementById('adminPanels').style.display = 'block';
        
        // Connect to admin WebSocket
        if (window.ws) {
            window.ws.send({
                type: 'admin_login',
                password: password
            });
        }
    } else {
        showNotification('ልክ ያልሆነ የይለፍ ቃል', false);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);

// Mobile compatibility
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
        if (gameState.gameType) {
            generateGameBoard();
        }
    }, 100);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const modals = ['membersModal', 'potentialWinModal', 'adminLoginModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Ensure boards fit on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (gameState.gameType) {
            generateGameBoard();
        }
    }, 250);
});