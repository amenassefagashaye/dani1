class AdminPanel {
    constructor() {
        this.isOpen = false;
        this.players = [];
        this.gameStats = {
            totalPlayers: 0,
            activePlayers: 0,
            totalCalled: 0,
            totalWon: 0,
            totalRevenue: 0
        };
        this.callHistory = [];
        this.logs = [];
        
        this.init();
    }
    
    init() {
        // Create admin toggle button
        this.createToggleButton();
        
        // Create admin panel
        this.createAdminPanel();
        
        // Load existing data
        this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start periodic updates
        this.startUpdates();
    }
    
    createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'adminToggleBtn';
        toggleBtn.className = 'admin-toggle-btn';
        toggleBtn.innerHTML = '⚙️';
        toggleBtn.title = 'Admin Panel';
        toggleBtn.onclick = () => this.togglePanel();
        
        document.body.appendChild(toggleBtn);
        
        // Show button if admin is logged in
        if (window.gameState && window.gameState.isAdmin) {
            toggleBtn.style.display = 'flex';
        }
    }
    
    createAdminPanel() {
        const panel = document.createElement('div');
        panel.id = 'adminPanel';
        panel.className = 'admin-panel';
        panel.innerHTML = this.getPanelHTML();
        
        document.getElementById('adminPanels').appendChild(panel);
    }
    
    getPanelHTML() {
        return `
            <div class="admin-modal-content">
                <button class="admin-close-btn" onclick="window.adminPanel.togglePanel()">×</button>
                
                <div class="admin-header amharic-text">አስተዳዳሪ ፓነል</div>
                
                <!-- Game Stats -->
                <div class="admin-section">
                    <div class="admin-section-title">
                        <span class="amharic-text">የጨዋታ ስታቲስቲክስ</span>
                        <span id="adminLastUpdate" style="font-size: 12px; color: #ccc;">የተዘመነ: አሁን</span>
                    </div>
                    
                    <div class="admin-stats-grid">
                        <div class="admin-stat-box">
                            <div class="admin-stat-value" id="adminTotalPlayers">0</div>
                            <div class="admin-stat-label amharic-text">ጠቅላላ ተጫዋቾች</div>
                        </div>
                        <div class="admin-stat-box">
                            <div class="admin-stat-value" id="adminActivePlayers">0</div>
                            <div class="admin-stat-label amharic-text">አንቲቭ ተጫዋቾች</div>
                        </div>
                        <div class="admin-stat-box">
                            <div class="admin-stat-value" id="adminTotalCalled">0</div>
                            <div class="admin-stat-label amharic-text">ተጠርተው ያሉ</div>
                        </div>
                        <div class="admin-stat-box">
                            <div class="admin-stat-value" id="adminTotalWon">0</div>
                            <div class="admin-stat-label amharic-text">ያሸነፉ</div>
                        </div>
                        <div class="admin-stat-box">
                            <div class="admin-stat-value" id="adminTotalRevenue">0 ብር</div>
                            <div class="admin-stat-label amharic-text">ጠቅላላ ገቢ</div>
                        </div>
                    </div>
                </div>
                
                <!-- Game Controls -->
                <div class="admin-section">
                    <div class="admin-section-title amharic-text">የጨዋታ መቆጣጠሪያዎች</div>
                    
                    <div class="admin-controls-grid">
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.startGame()">ጨዋታ ጀምር</button>
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.stopGame()">ጨዋታ አቁም</button>
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.callNumber()">ቁጥር ጥራ</button>
                        <button class="admin-control-btn amharic-text warning" onclick="window.adminPanel.resetGame()">ጨዋታ ዳግም ጀምር</button>
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.manualCall()">ጊዜ ለጥራ</button>
                        <button class="admin-control-btn amharic-text danger" onclick="window.adminPanel.kickAll()">ሁሉንም አውጣ</button>
                    </div>
                    
                    <!-- Manual Call Input -->
                    <div style="margin-top: 15px;">
                        <div class="admin-form-group">
                            <label class="amharic-text">ቁጥር በእጅ</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="number" id="adminManualNumber" class="admin-form-control" placeholder="1-90" min="1" max="90">
                                <button class="admin-control-btn" onclick="window.adminPanel.manualCall()" style="flex: 0 0 auto;">ጥራ</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Players List -->
                <div class="admin-section">
                    <div class="admin-section-title">
                        <span class="amharic-text">ተጫዋቾች</span>
                        <span style="font-size: 14px; color: #ffd700;" id="adminPlayersCount">0 ተጫዋቾች</span>
                    </div>
                    
                    <div class="admin-player-list" id="adminPlayersList">
                        <!-- Players will be listed here -->
                        <div style="text-align: center; color: #888; padding: 20px;" class="amharic-text">
                            ተጫዋቾች አልተገኙም...
                        </div>
                    </div>
                </div>
                
                <!-- Called Numbers -->
                <div class="admin-section">
                    <div class="admin-section-title amharic-text">ተጠርተው የተጠሩ ቁጥሮች</div>
                    
                    <div class="admin-call-history" id="adminCallHistory">
                        <!-- Called numbers will be displayed here -->
                        <div style="text-align: center; color: #888; width: 100%;" class="amharic-text">
                            ቁጥሮች አልተጠሩም...
                        </div>
                    </div>
                </div>
                
                <!-- System Logs -->
                <div class="admin-section">
                    <div class="admin-section-title">
                        <span class="amharic-text">ሲስተም ሎጎች</span>
                        <button class="admin-control-btn" onclick="window.adminPanel.clearLogs()" style="padding: 5px 10px; font-size: 12px;">አፅዳ</button>
                    </div>
                    
                    <div class="admin-log-container" id="adminLogs">
                        <!-- Logs will be displayed here -->
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="admin-section">
                    <div class="admin-section-title amharic-text">ፈጣን ተግባራት</div>
                    
                    <div class="admin-controls-grid">
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.sendAnnouncement()">ማስታወቂያ</button>
                        <button class="admin-control-btn amharic-text" onclick="window.adminPanel.exportData()">ውሂብ አምጣ</button>
                        <button class="admin-control-btn amharic-text warning" onclick="window.adminPanel.backupGame()">በክፍያ አስቀምጥ</button>
                        <button class="admin-control-btn amharic-text danger" onclick="window.adminPanel.shutdownGame()">ጨዋታ ዝጋ</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Listen for WebSocket messages
        if (window.ws) {
            window.ws.on('message', (data) => {
                this.handleWebSocketMessage(data);
            });
        }
        
        // Listen for admin commands from players
        document.addEventListener('adminCommand', (event) => {
            this.handleAdminCommand(event.detail);
        });
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'player_joined':
                this.addPlayer(data.player);
                this.addLog(`${data.player.name} ተጨምሯል`, 'player');
                break;
            case 'player_left':
                this.removePlayer(data.playerId);
                this.addLog(`${data.name} ወጥቷል`, 'player');
                break;
            case 'number_called':
                this.addCalledNumber(data.number, data.display);
                this.addLog(`ቁጥር ተጠርቷል: ${data.display}`, 'game');
                break;
            case 'player_marked':
                this.updatePlayerMark(data.playerId, data.number, data.marked);
                break;
            case 'player_won':
                this.addLog(`${data.name} ቢንጎ! ሽልማት: ${data.amount} ብር`, 'winner');
                this.gameStats.totalWon += data.amount;
                break;
            case 'game_state':
                this.updateGameState(data);
                break;
        }
        
        this.updateStats();
    }
    
    handleAdminCommand(command) {
        switch (command) {
            case 'refresh':
                this.loadData();
                break;
            case 'get_stats':
                this.sendStats();
                break;
        }
    }
    
    loadData() {
        // Load players from game state
        if (window.gameState && window.gameState.members) {
            this.players = window.gameState.members.map(member => ({
                id: member.id.toString(),
                name: member.name,
                phone: member.phone,
                status: 'idle',
                marks: 0,
                joined: new Date().toISOString()
            }));
        }
        
        // Load call history from game state
        if (window.gameState && window.gameState.calledNumbers) {
            this.callHistory = window.gameState.calledNumbers.map(num => ({
                number: num,
                display: `B-${num}`,
                time: new Date().toISOString()
            }));
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update stats
        document.getElementById('adminTotalPlayers').textContent = this.gameStats.totalPlayers;
        document.getElementById('adminActivePlayers').textContent = this.gameStats.activePlayers;
        document.getElementById('adminTotalCalled').textContent = this.gameStats.totalCalled;
        document.getElementById('adminTotalWon').textContent = this.gameStats.totalWon;
        document.getElementById('adminTotalRevenue').textContent = `${this.gameStats.totalRevenue} ብር`;
        
        // Update players list
        this.updatePlayersList();
        
        // Update call history
        this.updateCallHistory();
        
        // Update logs
        this.updateLogs();
        
        // Update last update time
        document.getElementById('adminLastUpdate').textContent = 
            `የተዘመነ: ${new Date().toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    updatePlayersList() {
        const list = document.getElementById('adminPlayersList');
        if (!list) return;
        
        if (this.players.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; color: #888; padding: 20px;" class="amharic-text">
                    ተጫዋቾች አልተገኙም...
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        this.players.forEach(player => {
            const item = document.createElement('div');
            item.className = 'admin-player-item';
            item.innerHTML = `
                <div>
                    <div class="admin-player-name">${player.name}</div>
                    <div style="font-size: 11px; color: #ccc;">${player.phone}</div>
                </div>
                <div>
                    <span class="admin-player-status ${player.status}">${player.status === 'playing' ? 'ጨዋታ ላይ' : 'ተኝቷል'}</span>
                    <div style="font-size: 11px; color: #ffd700; margin-top: 2px;">${player.marks} ምልክቶች</div>
                </div>
            `;
            list.appendChild(item);
        });
        
        document.getElementById('adminPlayersCount').textContent = `${this.players.length} ተጫዋቾች`;
    }
    
    updateCallHistory() {
        const history = document.getElementById('adminCallHistory');
        if (!history) return;
        
        if (this.callHistory.length === 0) {
            history.innerHTML = `
                <div style="text-align: center; color: #888; width: 100%;" class="amharic-text">
                    ቁጥሮች አልተጠሩም...
                </div>
            `;
            return;
        }
        
        history.innerHTML = '';
        
        // Show last 20 called numbers
        const recentCalls = this.callHistory.slice(-20);
        
        recentCalls.forEach(call => {
            const span = document.createElement('span');
            span.className = 'admin-called-number';
            span.textContent = call.display;
            span.title = `ቁጥር: ${call.number} | ጊዜ: ${new Date(call.time).toLocaleTimeString()}`;
            history.appendChild(span);
        });
    }
    
    updateLogs() {
        const logsDiv = document.getElementById('adminLogs');
        if (!logsDiv) return;
        
        logsDiv.innerHTML = '';
        
        // Show last 50 logs
        const recentLogs = this.logs.slice(-50);
        
        recentLogs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'admin-log-entry';
            entry.innerHTML = `
                <span class="admin-log-time">[${new Date(log.time).toLocaleTimeString('en-ET', { hour12: false })}]</span>
                <span class="admin-log-message">${log.message}</span>
            `;
            logsDiv.appendChild(entry);
        });
        
        // Auto-scroll to bottom
        logsDiv.scrollTop = logsDiv.scrollHeight;
    }
    
    updateStats() {
        this.gameStats.totalPlayers = this.players.length;
        this.gameStats.activePlayers = this.players.filter(p => p.status === 'playing').length;
        this.gameStats.totalCalled = this.callHistory.length;
        
        this.updateDisplay();
    }
    
    addPlayer(player) {
        // Check if player already exists
        const existingIndex = this.players.findIndex(p => p.id === player.id);
        
        if (existingIndex >= 0) {
            this.players[existingIndex] = { ...this.players[existingIndex], ...player };
        } else {
            this.players.push({
                id: player.id,
                name: player.name || `ተጫዋች ${this.players.length + 1}`,
                phone: player.phone || 'N/A',
                status: 'idle',
                marks: 0,
                joined: new Date().toISOString(),
                ...player
            });
        }
        
        this.updateDisplay();
    }
    
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.updateDisplay();
    }
    
    updatePlayerMark(playerId, number, marked) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            if (marked) {
                player.marks = (player.marks || 0) + 1;
                player.status = 'playing';
            }
        }
        this.updateDisplay();
    }
    
    addCalledNumber(number, display) {
        this.callHistory.push({
            number,
            display: display || `B-${number}`,
            time: new Date().toISOString()
        });
        
        this.gameStats.totalCalled++;
        this.updateDisplay();
    }
    
    addLog(message, type = 'system') {
        const colors = {
            system: '#17a2b8',
            player: '#28a745',
            game: '#ffd700',
            winner: '#dc3545',
            error: '#dc3545'
        };
        
        this.logs.push({
            time: new Date().toISOString(),
            message: message,
            type: type,
            color: colors[type] || '#ffffff'
        });
        
        this.updateLogs();
    }
    
    updateGameState(data) {
        if (data.players) {
            this.players = data.players.map(p => ({
                id: p.id,
                name: p.name,
                status: p.status || 'idle',
                marks: p.marks || 0
            }));
        }
        
        if (data.calledNumbers) {
            this.callHistory = data.calledNumbers.map((num, index) => ({
                number: num,
                display: `B-${num}`,
                time: new Date(Date.now() - (data.calledNumbers.length - index) * 7000).toISOString()
            }));
        }
        
        this.updateDisplay();
    }
    
    sendStats() {
        // Send stats to server via WebSocket
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_stats',
                stats: this.gameStats,
                players: this.players,
                callHistory: this.callHistory.slice(-20)
            });
        }
    }
    
    startUpdates() {
        // Update every 5 seconds
        setInterval(() => {
            this.updateStats();
            this.sendStats();
        }, 5000);
    }
    
    // Admin Control Functions
    
    startGame() {
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'start_game'
            });
            
            this.addLog('ጨዋታ ተጀምሯል', 'game');
        }
    }
    
    stopGame() {
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'stop_game'
            });
            
            this.addLog('ጨዋታ ተቆጥቷል', 'game');
        }
    }
    
    callNumber() {
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'call_number'
            });
            
            this.addLog('ቁጥር በራስ-ሰር ተጠርቷል', 'game');
        }
    }
    
    manualCall() {
        const input = document.getElementById('adminManualNumber');
        const number = parseInt(input.value);
        
        if (!number || number < 1 || number > 90) {
            this.addLog('ልክ ያልሆነ ቁጥር', 'error');
            return;
        }
        
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'manual_call',
                number: number
            });
            
            this.addLog(`ቁጥር በእጅ ተጠርቷል: ${number}`, 'game');
            input.value = '';
        }
    }
    
    resetGame() {
        if (confirm('እርግጠኛ ነዎት? ይህ ሁሉንም ተጫዋቾች እና የጨዋታ ሁኔታ ዳግም ይጀምራል።')) {
            if (window.ws && window.ws.connected) {
                window.ws.send({
                    type: 'admin_command',
                    command: 'reset_game'
                });
                
                this.addLog('ጨዋታ ዳግም ተጀምሯል', 'game');
            }
        }
    }
    
    kickAll() {
        if (confirm('እርግጠኛ ነዎት? ይህ ሁሉንም ተጫዋቾች ከጨዋታው ያወጣል።')) {
            if (window.ws && window.ws.connected) {
                window.ws.send({
                    type: 'admin_command',
                    command: 'kick_all'
                });
                
                this.addLog('ሁሉም ተጫዋቾች ከጨዋታው ወጥተዋል', 'player');
            }
        }
    }
    
    sendAnnouncement() {
        const message = prompt('ማስታወቂያ ግብጽ:');
        if (message && window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'announcement',
                message: message
            });
            
            this.addLog(`ማስታወቂያ ተልኳል: ${message}`, 'system');
        }
    }
    
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.gameStats,
            players: this.players,
            callHistory: this.callHistory,
            logs: this.logs
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bingo-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.addLog('ውሂብ ተላልፏል', 'system');
    }
    
    backupGame() {
        if (window.ws && window.ws.connected) {
            window.ws.send({
                type: 'admin_command',
                command: 'backup'
            });
            
            this.addLog('ጨዋታ ተመጣጥኗል', 'system');
        }
    }
    
    shutdownGame() {
        if (confirm('እርግጠኛ ነዎት? ይህ ሁሉንም ጨዋታዎች ያቋርጣል።')) {
            if (window.ws && window.ws.connected) {
                window.ws.send({
                    type: 'admin_command',
                    command: 'shutdown'
                });
                
                this.addLog('ጨዋታ ተዘግቷል', 'system');
            }
        }
    }
    
    clearLogs() {
        this.logs = [];
        this.updateLogs();
        this.addLog('ሎጎች ተወግደዋል', 'system');
    }
    
    togglePanel() {
        const panel = document.getElementById('adminPanel');
        const toggleBtn = document.getElementById('adminToggleBtn');
        
        if (this.isOpen) {
            panel.style.display = 'none';
            toggleBtn.classList.remove('active');
        } else {
            panel.style.display = 'block';
            toggleBtn.classList.add('active');
            this.loadData();
        }
        
        this.isOpen = !this.isOpen;
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    if (window.gameState && window.gameState.isAdmin) {
        window.adminPanel = new AdminPanel();
    }
});