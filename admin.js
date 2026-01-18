// === WebSocket Connection (Exact Place Inserted) ===
const ws = new WebSocket('wss://ameng-gogs-dani2-62.deno.dev/ws');

ws.onopen = () => console.log("🟢 Admin WebSocket Connected");
ws.onclose = () => console.log("🔴 Admin WebSocket Disconnected");
ws.onerror = (e) => console.error("WebSocket Error:", e);

// ===================================================

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
        
        // Listen to server messages
        ws.onmessage = (event) => this.handleServerMessage(event);
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
            <div class="admin-header">
                <h3>Admin Panel</h3>
                <button onclick="adminPanel.togglePanel()">✖</button>
            </div>
            
            <div class="admin-controls">
                <button onclick="adminPanel.sendCommand('startGame')">▶ Start Game</button>
                <button onclick="adminPanel.sendCommand('nextNumber')">🔢 Call Number</button>
                <button onclick="adminPanel.sendCommand('resetGame')">♻ Reset Game</button>
            </div>
            
            <div class="admin-log" id="adminLog"></div>
        `;
    }
    
    togglePanel() {
        this.isOpen = !this.isOpen;
        document.getElementById('adminPanel').style.display = this.isOpen ? 'block' : 'none';
    }
    
    loadData() {
        // Placeholder for loading stored admin data if needed
    }
    
    setupEventListeners() {
        // Placeholder for future event bindings
    }
    
    startUpdates() {
        // Placeholder for periodic updates if needed
    }
    
    sendCommand(action) {
        const message = {
            type: "admin",
            action: action
        };
        ws.send(JSON.stringify(message));
        this.log("Admin Command Sent: " + action);
    }
    
    handleServerMessage(event) {
        this.log("Server: " + event.data);
    }
    
    log(text) {
        const logBox = document.getElementById("adminLog");
        if(logBox){
            logBox.innerHTML += text + "<br>";
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
}

// === Initialize Admin Panel ===
const adminPanel = new AdminPanel();
