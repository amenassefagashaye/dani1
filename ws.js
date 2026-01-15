class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageQueue = [];
        this.eventHandlers = {};
        
        // Determine WebSocket URL
        this.wsUrl = this.getWebSocketUrl();
        
        this.connect();
    }
    
    getWebSocketUrl() {
        // For local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'ws://localhost:8080/ws';
        }
        // For Deno Deploy
        return `wss://${window.location.hostname}/ws`;
    }
    
    connect() {
        try {
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.flushMessageQueue();
                
                // Send connection info
                this.send({
                    type: 'connect',
                    playerId: window.gameState?.playerId,
                    sessionId: window.gameState?.sessionId,
                    isAdmin: window.gameState?.isAdmin || false
                });
                
                this.triggerEvent('connect', {});
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected = false;
                this.socket = null;
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connect();
                    }, this.reconnectDelay * this.reconnectAttempts);
                }
                
                this.triggerEvent('disconnect', {});
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.triggerEvent('error', { error });
            };
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.triggerEvent('error', { error });
        }
    }
    
    send(data) {
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify(data));
        } else {
            this.messageQueue.push(data);
        }
    }
    
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'game_state':
                this.handleGameState(data);
                break;
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
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
            case 'admin_command':
                this.handleAdminCommand(data);
                break;
            case 'error':
                this.handleError(data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
        
        this.triggerEvent('message', data);
    }
    
    handleGameState(data) {
        const gameState = window.gameState;
        if (!gameState) return;
        
        if (data.calledNumbers) {
            gameState.calledNumbers = data.calledNumbers;
            gameState.calledNumbersDisplay = data.calledNumbers.slice(-8).reverse();
            this.updateCalledNumbersDisplay();
        }
        
        if (data.gameActive !== undefined) {
            gameState.gameActive = data.gameActive;
        }
        
        if (data.players) {
            this.updatePlayersList(data.players);
        }
        
        console.log('Game state updated:', data);
    }
    
    handlePlayerJoined(data) {
        const notification = `${data.name} ወደ ጨዋታው ተጨምሯል`;
        this.showSystemNotification(notification);
        
        if (window.updatePlayersList) {
            window.updatePlayersList(data.players);
        }
    }
    
    handlePlayerLeft(data) {
        const notification = `${data.name} ከጨዋታው ወጥቷል`;
        this.showSystemNotification(notification);
        
        if (window.updatePlayersList) {
            window.updatePlayersList(data.players);
        }
    }
    
    handleNumberCalled(data) {
        const gameState = window.gameState;
        if (!gameState || !gameState.gameActive) return;
        
        gameState.calledNumbers.push(data.number);
        gameState.currentNumber = data.display;
        
        if (gameState.currentNumber) {
            this.moveNumberToBar(gameState.currentNumber);
        }
        
        document.getElementById('currentNumberDisplay').textContent = data.display;
        
        // Play call audio
        const audio = document.getElementById('callAudio');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
        
        // Check for win
        if (window.checkForWin) {
            window.checkForWin();
        }
    }
    
    handlePlayerMarked(data) {
        // Update other players' boards if needed
        if (window.gameState && data.playerId !== window.gameState.playerId) {
            // Find and mark the cell
            const cell = document.querySelector(`.board-cell[data-number="${data.number}"]`);
            if (cell) {
                if (data.marked) {
                    cell.classList.add('marked');
                } else {
                    cell.classList.remove('marked');
                }
            }
        }
    }
    
    handlePlayerWon(data) {
        const notification = `🎉 ${data.name} ቢንጎ! ያሸነፈ - ${data.pattern} - ${data.amount.toLocaleString()} ብር`;
        this.showSystemNotification(notification);
        
        // If it's not this player, show a different notification
        if (window.gameState && data.playerId !== window.gameState.playerId) {
            this.showWinnerNotification(data.name, data.pattern, data.amount);
        }
    }
    
    handleAdminCommand(data) {
        if (!window.gameState || !window.gameState.isAdmin) return;
        
        switch(data.command) {
            case 'start_game':
                if (window.startNewGame) {
                    window.startNewGame();
                }
                break;
            case 'stop_game':
                if (window.stopCalling) {
                    window.stopCalling();
                }
                break;
            case 'call_number':
                if (window.callNextNumber) {
                    window.callNextNumber();
                }
                break;
            case 'reset_game':
                if (window.startNewGame) {
                    window.startNewGame();
                }
                break;
        }
    }
    
    handleError(data) {
        console.error('Server error:', data.message);
        this.showSystemNotification(`ስህተት: ${data.message}`);
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
        }
    }
    
    showSystemNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'system-notification amharic-text';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #ffd700;
            padding: 10px 15px;
            border-radius: 8px;
            border: 2px solid #28a745;
            z-index: 3000;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    showWinnerNotification(name, pattern, amount) {
        const notification = document.createElement('div');
        notification.className = 'winner-notification-popup amharic-text';
        notification.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 5px;">🏆 ቢንጎ!</div>
            <div>${name} አሸነፈ</div>
            <div style="color: #ffd700; font-size: 12px; margin: 5px 0;">${pattern}</div>
            <div style="color: #28a745; font-weight: bold;">${amount.toLocaleString()} ብር</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 20px;
            border-radius: 15px;
            border: 3px solid #ffd700;
            z-index: 3000;
            text-align: center;
            animation: popIn 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
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
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// Initialize WebSocket when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ws = new WebSocketClient();
    
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
        
        .system-notification {
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}