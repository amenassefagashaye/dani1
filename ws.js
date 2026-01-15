class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000;
        this.messageQueue = [];
        this.eventHandlers = {};
        this.heartbeatInterval = null;
        this.lastPingTime = null;
        this.connectionTimeout = 10000;
        
        // Use the provided Deno Deploy URL
        this.wsUrl = this.getWebSocketUrl();
        
        this.connect();
        this.setupHeartbeat();
    }
    
    getWebSocketUrl() {
        // Use the provided Deno Deploy URL
        return 'wss://ameng-gogs-dani2-62.deno.dev/ws';
    }
    
    connect() {
        try {
            console.log(`Connecting to WebSocket: ${this.wsUrl}`);
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.lastPingTime = Date.now();
                this.flushMessageQueue();
                
                // Send connection info
                if (window.gameState) {
                    this.send({
                        type: 'connect',
                        playerId: window.gameState.playerId,
                        sessionId: window.gameState.sessionId,
                        isAdmin: window.gameState.isAdmin || false
                    });
                }
                
                this.triggerEvent('connect', {});
                this.showSystemNotification('✅ ከሰርቨር ጋር ተገናኝቷል');
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📥 Received:', data.type, data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error, 'Raw:', event.data);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log(`🔌 WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
                this.connected = false;
                this.socket = null;
                this.triggerEvent('disconnect', { code: event.code, reason: event.reason });
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
                    console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                    
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connect();
                    }, delay);
                    
                    this.showSystemNotification(`ዳግም በማገናኘት ላይ... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                } else {
                    console.error('Max reconnection attempts reached');
                    this.showSystemNotification('ማገናኘት አልተቻለም። እባክዎ ገጹን ዳግም ይጫኑ።');
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.triggerEvent('error', { error });
                this.showSystemNotification('የመስመር ስህተት። እባክዎ እንደገና ይሞክሩ።');
            };
            
            // Set connection timeout
            setTimeout(() => {
                if (!this.connected && this.socket && this.socket.readyState === WebSocket.CONNECTING) {
                    console.error('Connection timeout');
                    this.socket.close();
                    this.showSystemNotification('የግንኙነት ጊዜ አልፏል። እንደገና ይሞክሩ።');
                }
            }, this.connectionTimeout);
            
        } catch (error) {
            console.error('❌ WebSocket connection error:', error);
            this.triggerEvent('error', { error });
        }
    }
    
    send(data) {
        if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(data));
                console.log('📤 Sent:', data.type, data);
            } catch (error) {
                console.error('❌ Error sending message:', error);
                this.messageQueue.push(data);
            }
        } else {
            this.messageQueue.push(data);
            console.log('📦 Queued message (offline):', data.type);
        }
    }
    
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    handleMessage(data) {
        this.lastPingTime = Date.now();
        
        switch (data.type) {
            case 'connected':
                this.handleConnected(data);
                break;
            case 'registered':
                this.handleRegistered(data);
                break;
            case 'game_state':
                this.handleGameState(data);
                break;
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'player_reconnected':
                this.handlePlayerReconnected(data);
                break;
            case 'number_called':
                this.handleNumberCalled(data);
                break;
            case 'player_marked':
                this.handlePlayerMarked(data);
                break;
            case 'player_won':
                this.handlePlayerWon(data);
                break;
            case 'game_started':
                this.handleGameStarted(data);
                break;
            case 'game_stopped':
                this.handleGameStopped(data);
                break;
            case 'game_reset':
                this.handleGameReset(data);
                break;
            case 'announcement':
                this.handleAnnouncement(data);
                break;
            case 'admin_authenticated':
                this.handleAdminAuthenticated(data);
                break;
            case 'admin_stats':
                this.handleAdminStats(data);
                break;
            case 'admin_command_response':
                this.handleAdminCommandResponse(data);
                break;
            case 'pong':
                this.handlePong(data);
                break;
            case 'kicked':
                this.handleKicked(data);
                break;
            case 'error':
                this.handleError(data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
        
        this.triggerEvent('message', data);
    }
    
    handleConnected(data) {
        console.log('Server connection confirmed:', data.message);
        this.showSystemNotification('✅ ' + data.message);
        
        // Update player ID if provided by server
        if (data.playerId && window.gameState) {
            window.gameState.playerId = data.playerId;
        }
    }
    
    handleRegistered(data) {
        console.log('Registration confirmed:', data);
        this.showSystemNotification(`✅ በተሳካ ሁኔታ ተመዝግበዋል - ${data.name}`);
        
        if (window.gameState) {
            window.gameState.playerName = data.name;
        }
    }
    
    handleGameState(data) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        console.log('Game state updated:', data);
        
        // Update called numbers
        if (data.calledNumbers) {
            gameState.calledNumbers = data.calledNumbers;
            gameState.calledNumbersDisplay = data.calledNumbers.slice(-8).reverse();
            this.updateCalledNumbersDisplay();
        }
        
        if (data.gameActive !== undefined) {
            gameState.gameActive = data.gameActive;
        }
        
        if (data.currentNumber !== undefined) {
            gameState.currentNumber = data.currentNumber;
            if (gameState.currentNumber && document.getElementById('currentNumberDisplay')) {
                document.getElementById('currentNumberDisplay').textContent = 
                    this.formatNumberDisplay(gameState.currentNumber, gameState.gameType);
            }
        }
        
        if (data.players) {
            this.updatePlayersList(data.players);
        }
        
        // If we're on game page and game just started, update UI
        if (data.gameActive && document.getElementById('page3')?.classList.contains('active')) {
            if (window.startNewGame) {
                setTimeout(() => window.startNewGame(), 100);
            }
        }
    }
    
    handlePlayerJoined(data) {
        const notification = `👤 ${data.name} ወደ ጨዋታው ተጨምሯል`;
        this.showSystemNotification(notification);
        
        // Update players list if available
        if (window.updatePlayersList) {
            window.updatePlayersList(data.players);
        }
        
        // Update game state members
        if (window.gameState && data.players) {
            window.gameState.members = data.players.map((player, index) => ({
                id: index + 1,
                name: player.name,
                phone: player.phone || 'N/A',
                boardType: player.boardType || '75-ቢንጎ',
                boards: 1,
                paid: true,
                won: false,
                stake: player.stake || 25,
                payment: player.stake || 0,
                balance: player.balance || 0,
                withdrawn: 0
            }));
        }
    }
    
    handlePlayerLeft(data) {
        const notification = `🚪 ${data.name} ከጨዋታው ወጥቷል`;
        this.showSystemNotification(notification);
    }
    
    handlePlayerReconnected(data) {
        const notification = `🔁 ${data.name} እንደገና ተገናኝቷል`;
        this.showSystemNotification(notification);
    }
    
    handleNumberCalled(data) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        console.log('Number called:', data);
        
        // Update game state
        if (!gameState.calledNumbers.includes(data.number)) {
            gameState.calledNumbers.push(data.number);
        }
        
        // Update display
        const displayText = data.display || this.formatNumberDisplay(data.number, gameState.gameType);
        
        if (gameState.currentNumber) {
            this.moveNumberToBar(gameState.currentNumber);
        }
        
        gameState.currentNumber = displayText;
        
        // Update UI
        if (document.getElementById('currentNumberDisplay')) {
            document.getElementById('currentNumberDisplay').textContent = displayText;
        }
        
        // Play sound
        this.playCallSound();
        
        // Check for win
        if (window.checkForWin) {
            setTimeout(() => window.checkForWin(), 100);
        }
        
        // Show notification for manual calls
        if (data.isManual) {
            this.showSystemNotification(`📢 ${data.calledBy || 'አስተዳዳሪ'} ቁጥር ጠርተዋል: ${displayText}`);
        }
    }
    
    handlePlayerMarked(data) {
        // Update other players' boards if needed
        if (window.gameState && data.playerId !== window.gameState.playerId) {
            // Find and mark the cell
            const cell = document.querySelector(`.board-cell[data-number="${data.number}"]`);
            if (cell && !cell.classList.contains('center-cell')) {
                if (data.marked) {
                    cell.classList.add('marked');
                } else {
                    cell.classList.remove('marked');
                }
            }
        }
    }
    
    handlePlayerWon(data) {
        console.log('Player won:', data);
        
        const notification = `🏆 ${data.name} ቢንጎ! - ${this.getPatternName(data.pattern)} - ${data.amount.toLocaleString()} ብር`;
        this.showSystemNotification(notification);
        
        // If it's not this player, show a different notification
        if (window.gameState && data.playerId !== window.gameState.playerId) {
            this.showWinnerNotification(data.name, data.pattern, data.amount);
        } else {
            // Update this player's balance
            if (window.gameState) {
                window.gameState.totalWon += data.amount;
                if (window.updateFinance) {
                    window.updateFinance();
                }
            }
        }
        
        // Play win sound
        this.playWinSound();
    }
    
    handleGameStarted(data) {
        const notification = `▶️ ጨዋታ ተጀምሯል ${data.startedBy ? `በ ${data.startedBy}` : ''}`;
        this.showSystemNotification(notification);
        
        if (window.gameState) {
            window.gameState.gameActive = true;
        }
        
        if (window.startNewGame) {
            setTimeout(() => window.startNewGame(), 500);
        }
    }
    
    handleGameStopped(data) {
        const notification = `⏸️ ጨዋታ ተቆጥቷል ${data.stoppedBy ? `በ ${data.stoppedBy}` : ''}`;
        this.showSystemNotification(notification);
        
        if (window.gameState) {
            window.gameState.gameActive = false;
        }
        
        if (window.stopCalling) {
            window.stopCalling();
        }
    }
    
    handleGameReset(data) {
        const notification = `🔄 ጨዋታ ዳግም ተጀምሯል ${data.resetBy ? `በ ${data.resetBy}` : ''}`;
        this.showSystemNotification(notification);
        
        if (window.startNewGame) {
            setTimeout(() => window.startNewGame(), 500);
        }
    }
    
    handleAnnouncement(data) {
        const notification = `📢 ${data.from ? `${data.from}: ` : ''}${data.message}`;
        this.showSystemNotification(notification);
    }
    
    handleAdminAuthenticated(data) {
        console.log('Admin authenticated:', data);
        this.showSystemNotification('✅ አስተዳዳሪ መግቢያ ተረጋግጧል');
        
        if (window.gameState) {
            window.gameState.isAdmin = true;
        }
    }
    
    handleAdminStats(data) {
        console.log('Admin stats received:', data);
        // Pass to admin panel if available
        if (window.adminPanel && window.adminPanel.handleWebSocketMessage) {
            window.adminPanel.handleWebSocketMessage(data);
        }
    }
    
    handleAdminCommandResponse(data) {
        console.log('Admin command response:', data);
        this.showSystemNotification(`🔧 ${data.command}: ${data.message || 'ተግባሩ ተከናውኗል'}`);
    }
    
    handlePong(data) {
        // Update last ping time
        this.lastPingTime = Date.now();
    }
    
    handleKicked(data) {
        this.showSystemNotification(`🚫 ከጨዋታው ተወግደዋል: ${data.message}`);
        this.disconnect();
        
        // Redirect to welcome page after 3 seconds
        setTimeout(() => {
            if (window.showPage) {
                window.showPage(0);
            }
        }, 3000);
    }
    
    handleError(data) {
        console.error('Server error:', data.message);
        this.showSystemNotification(`❌ ስህተት: ${data.message}`);
    }
    
    formatNumberDisplay(number, gameType) {
        if (!number) return '';
        
        if (gameType === '75ball' || gameType === '50ball' || gameType === 'pattern') {
            const letters = 'BINGO';
            let columnSize, columnIndex;
            
            if (gameType === '75ball' || gameType === 'pattern') {
                columnSize = 15;
                columnIndex = Math.floor((number - 1) / columnSize);
            } else {
                columnSize = 10;
                columnIndex = Math.floor((number - 1) / columnSize);
            }
            
            columnIndex = Math.min(columnIndex, 4);
            const letter = letters[columnIndex];
            return `${letter}-${number}`;
        }
        
        return number.toString();
    }
    
    getPatternName(pattern) {
        const patternNames = {
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
        };
        
        return patternNames[pattern] || pattern;
    }
    
    playCallSound() {
        try {
            const audio = document.getElementById('callAudio');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }
    
    playWinSound() {
        try {
            const audio = document.getElementById('winAudio');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Win audio play failed:', e));
            }
        } catch (error) {
            console.log('Win sound error:', error);
        }
    }
    
    updateCalledNumbersDisplay() {
        const gameState = window.gameState;
        if (!gameState) return;
        
        const bar = document.getElementById('calledNumbersBar');
        if (!bar) return;
        
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
    
    moveNumberToBar(number) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        gameState.calledNumbersDisplay.unshift(number);
        if (gameState.calledNumbersDisplay.length > gameState.maxDisplayNumbers) {
            gameState.calledNumbersDisplay.pop();
        }
        
        this.updateCalledNumbersDisplay();
    }
    
    updatePlayersList(players) {
        // Update the members list with real-time data
        if (window.gameState) {
            window.gameState.members = players.map((player, index) => ({
                id: index + 1,
                name: player.name,
                phone: player.phone || 'N/A',
                boardType: player.boardType || '75-ቢንጎ',
                boards: 1,
                paid: player.paid || false,
                won: player.won || false,
                stake: player.stake || 25,
                payment: player.payment || 0,
                balance: player.balance || 0,
                withdrawn: player.withdrawn || 0
            }));
            
            // Update members modal if open
            const membersModal = document.getElementById('membersModal');
            if (membersModal && membersModal.style.display === 'block') {
                if (window.showMembers) {
                    window.showMembers();
                }
            }
        }
    }
    
    showSystemNotification(message) {
        // Remove any existing notifications
        document.querySelectorAll('.system-notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'system-notification amharic-text';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.95);
            color: #ffd700;
            padding: 12px 16px;
            border-radius: 10px;
            border: 2px solid #28a745;
            z-index: 3000;
            font-size: 14px;
            font-weight: bold;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            backdrop-filter: blur(5px);
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    showWinnerNotification(name, pattern, amount) {
        // Remove any existing winner notifications
        document.querySelectorAll('.winner-notification-popup').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = 'winner-notification-popup amharic-text';
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">🎉 ቢንጎ!</div>
            <div style="font-size: 18px; margin-bottom: 5px;">${name}</div>
            <div style="color: #ffd700; font-size: 14px; margin: 8px 0;">${this.getPatternName(pattern)}</div>
            <div style="color: #28a745; font-weight: bold; font-size: 20px;">${amount.toLocaleString()} ብር</div>
            <div style="margin-top: 10px; font-size: 12px; color: #ccc;">ሌላ ተጫዋች አሸነፈ!</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.98);
            color: white;
            padding: 25px;
            border-radius: 15px;
            border: 3px solid #ffd700;
            z-index: 3000;
            text-align: center;
            animation: popIn 0.5s ease;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            min-width: 300px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
    
    setupHeartbeat() {
        // Send ping every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
            
            // Check if connection is stale (no pong for 60 seconds)
            if (this.lastPingTime && Date.now() - this.lastPingTime > 60000) {
                console.warn('Connection appears stale, reconnecting...');
                this.reconnect();
            }
        }, 30000);
    }
    
    reconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.connect();
    }
    
    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.socket) {
            this.socket.close();
        }
        
        this.connected = false;
        this.socket = null;
    }
    
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }
    
    off(event, handler) {
        if (this.eventHandlers[event]) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        }
    }
    
    triggerEvent(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }
}

// Initialize WebSocket when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes popIn {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            70% {
                transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        
        .system-notification {
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .winner-notification-popup {
            transition: opacity 0.3s, transform 0.3s;
        }
    `;
    document.head.appendChild(style);
    
    // Create connection status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'connectionStatus';
    statusIndicator.style.cssText = `
        position: fixed;
        top: 15px;
        left: 15px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #dc3545;
        z-index: 1001;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(statusIndicator);
    
    // Initialize WebSocket client
    window.ws = new WebSocketClient();
    
    // Update connection status
    window.ws.on('connect', () => {
        statusIndicator.style.background = '#28a745';
        statusIndicator.title = 'የተገናኘ';
    });
    
    window.ws.on('disconnect', () => {
        statusIndicator.style.background = '#dc3545';
        statusIndicator.title = 'የተገናኘለሁ';
    });
    
    window.ws.on('error', () => {
        statusIndicator.style.background = '#ffc107';
        statusIndicator.title = 'ስህተት';
    });
    
    // Add connection status tooltip
    statusIndicator.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.textContent = statusIndicator.title;
        tooltip.style.cssText = `
            position: fixed;
            top: 30px;
            left: 15px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1002;
            white-space: nowrap;
        `;
        tooltip.id = 'connectionTooltip';
        document.body.appendChild(tooltip);
    });
    
    statusIndicator.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('connectionTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
    
    console.log('WebSocket client initialized');
});

// Add reconnect button to help page
function addReconnectButton() {
    const helpPage = document.getElementById('page5');
    if (helpPage) {
        const reconnectBtn = document.createElement('button');
        reconnectBtn.className = 'control-btn btn-info';
        reconnectBtn.innerHTML = '🔄 እንደገና ይገናኙ';
        reconnectBtn.onclick = () => {
            if (window.ws) {
                window.ws.reconnect();
                window.showNotification('ዳግም በማገናኘት ላይ...', false);
            }
        };
        
        const controls = helpPage.querySelector('.fixed-controls');
        if (controls) {
            controls.appendChild(reconnectBtn);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}

// Add reconnect button when page loads
setTimeout(addReconnectButton, 1000);
