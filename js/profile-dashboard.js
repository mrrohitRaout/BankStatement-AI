/**
 * Profile Dashboard JavaScript
 * Handles all dashboard interactions and data loading
 */

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    renderDashboardSections();
    loadRecentActivity();
});

// Load user profile data
function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch user data from API
    fetch('/api/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            updateProfileHeader(data.user);
        }
    })
    .catch(err => {
        console.error('Error loading profile:', err);
        // Use demo data for now
        updateProfileHeader({
            name: 'John Doe',
            email: 'john.doe@example.com',
            subscription: { plan: 'starter' },
            createdAt: new Date('2025-01-01')
        });
    });
}

// Update profile header
function updateProfileHeader(user) {
    document.getElementById('user-name').textContent = user.name || 'User';
    document.getElementById('user-email').textContent = user.email || '';
    
    const planMap = {
        'free': 'Free Plan',
        'starter': 'Starter Plan',
        'pro': 'Pro Plan',
        'enterprise': 'Enterprise Plan'
    };
    document.getElementById('user-plan').textContent = planMap[user.subscription?.plan] || 'Free Plan';
    
    const memberDate = new Date(user.createdAt);
    document.getElementById('member-since').textContent = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Set avatar initial
    const avatar = document.getElementById('user-avatar');
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    avatar.innerHTML = initial;
}

// Render all dashboard sections
function renderDashboardSections() {
    const container = document.getElementById('dashboard-sections');
    container.innerHTML = `
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
            ${renderSubscriptionSection()}
            ${renderRecentFilesSection()}
            ${renderAILearningSection()}
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
            ${renderConnectedAccountsSection()}
            ${renderExportPreferencesSection()}
            ${renderSecuritySection()}
            ${renderSupportSection()}
        </div>
    `;
}

// Subscription Details Section
function renderSubscriptionSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Subscription Details</h2>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <label class="text-sm font-semibold text-gray-600 mb-2 block">Current Plan</label>
                    <div class="text-2xl font-bold text-gray-900 mb-2">Starter Plan</div>
                    <p class="text-gray-600 text-sm">$9/month • Billed monthly</p>
                </div>
                <div>
                    <label class="text-sm font-semibold text-gray-600 mb-2 block">Next Renewal</label>
                    <div class="text-2xl font-bold text-gray-900 mb-2">Feb 15, 2025</div>
                    <p class="text-gray-600 text-sm">Auto-renewal enabled</p>
                </div>
            </div>
            
            <div class="mt-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-gray-700">Monthly Usage</span>
                    <span class="text-sm font-bold text-gray-900">47 / 600 statements</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 7.8%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">553 statements remaining this month</p>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button onclick="upgradePlan()" class="action-btn action-btn-primary">
                    <i class="fas fa-arrow-up"></i>
                    Upgrade Plan
                </button>
                <button onclick="manageBilling()" class="action-btn action-btn-secondary">
                    <i class="fas fa-credit-card"></i>
                    Manage Billing
                </button>
            </div>
        </div>
    `;
}

// Recent Files Section
function renderRecentFilesSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <div class="flex-1 flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-900">Recent Statements</h2>
                    <button onclick="viewAllFiles()" class="text-sm font-semibold text-teal-600 hover:text-teal-700">
                        View All <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
            
            <div id="recent-files">
                <div class="file-item">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                            <i class="fas fa-file-pdf text-white text-xl"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">Chase_Statement_Jan2025.pdf</div>
                            <div class="text-sm text-gray-500">Processed 2 hours ago • 25 transactions</div>
                        </div>
                    </div>
                    <button class="text-teal-600 hover:text-teal-700">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                
                <div class="file-item">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <i class="fas fa-file-image text-white text-xl"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">BoA_Receipt_Jan15.png</div>
                            <div class="text-sm text-gray-500">Processed yesterday • 12 transactions</div>
                        </div>
                    </div>
                    <button class="text-teal-600 hover:text-teal-700">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                
                <div class="file-item">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                            <i class="fas fa-file-pdf text-white text-xl"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">HDFC_Statement_Dec2024.pdf</div>
                            <div class="text-sm text-gray-500">Processed 3 days ago • 48 transactions</div>
                        </div>
                    </div>
                    <button class="text-teal-600 hover:text-teal-700">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// AI Learning Section
function renderAILearningSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">AI Learning Preferences</h2>
            </div>
            
            <p class="text-gray-600 mb-6">Help improve AI accuracy by correcting transaction categories.</p>
            
            <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-semibold text-gray-900">Auto-learn from corrections</div>
                        <div class="text-sm text-gray-600">AI learns when you fix categories</div>
                    </div>
                    <div class="toggle-switch active" onclick="toggleSwitch(this)"></div>
                </div>
                
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-semibold text-gray-900">Smart suggestions</div>
                        <div class="text-sm text-gray-600">Get category recommendations</div>
                    </div>
                    <div class="toggle-switch active" onclick="toggleSwitch(this)"></div>
                </div>
                
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-semibold text-gray-900">Feedback tracking</div>
                        <div class="text-sm text-gray-600">Track your correction history</div>
                    </div>
                    <div class="toggle-switch" onclick="toggleSwitch(this)"></div>
                </div>
            </div>
            
            <div class="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div class="flex items-start gap-3">
                    <i class="fas fa-lightbulb text-teal-600 text-xl"></i>
                    <div>
                        <div class="font-semibold text-teal-900 mb-1">Learning Stats</div>
                        <div class="text-sm text-teal-700">You've corrected 23 categories this month, improving AI accuracy by 15%!</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Connected Accounts Section
function renderConnectedAccountsSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-link"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Connected Accounts</h2>
            </div>
            
            <div class="space-y-3">
                <div class="connected-account">
                    <i class="fab fa-dropbox text-2xl text-blue-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">Dropbox</div>
                        <div class="text-xs text-gray-500">Connected</div>
                    </div>
                    <button onclick="disconnectAccount('dropbox')" class="text-red-500 hover:text-red-600">
                        <i class="fas fa-unlink"></i>
                    </button>
                </div>
                
                <div class="connected-account">
                    <i class="fab fa-google-drive text-2xl text-green-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">Google Drive</div>
                        <div class="text-xs text-gray-500">Connected</div>
                    </div>
                    <button onclick="disconnectAccount('gdrive')" class="text-red-500 hover:text-red-600">
                        <i class="fas fa-unlink"></i>
                    </button>
                </div>
                
                <div class="connected-account" style="opacity: 0.6;">
                    <i class="fas fa-calculator text-2xl text-purple-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">QuickBooks</div>
                        <div class="text-xs text-gray-500">Not connected</div>
                    </div>
                    <button onclick="connectAccount('quickbooks')" class="text-teal-600 hover:text-teal-700">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            
            <button onclick="addAccount()" class="w-full mt-4 action-btn action-btn-secondary">
                <i class="fas fa-plus-circle"></i>
                Add Account
            </button>
        </div>
    `;
}

// Export Preferences Section
function renderExportPreferencesSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-file-export"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Export Preferences</h2>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Default Format</label>
                    <select id="export-format" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none" onchange="saveExportPreference()">
                        <option value="csv">CSV (Comma Separated)</option>
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="json">JSON</option>
                        <option value="pdf">PDF Report</option>
                    </select>
                </div>
                
                <div>
                    <label class="text-sm font-semibold text-gray-700 mb-2 block">Date Format</label>
                    <select id="date-format" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none" onchange="saveExportPreference()">
                        <option value="mm-dd-yyyy">MM/DD/YYYY</option>
                        <option value="dd-mm-yyyy">DD/MM/YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="text-sm font-medium text-gray-700">Include raw data</span>
                    <div class="toggle-switch active" onclick="toggleSwitch(this)"></div>
                </div>
            </div>
        </div>
    `;
}

// Security Section
function renderSecuritySection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Security</h2>
            </div>
            
            <div class="space-y-3">
                <button onclick="changePassword()" class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-key text-gray-600"></i>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">Change Password</div>
                            <div class="text-xs text-gray-500">Last changed 30 days ago</div>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </button>
                
                <button onclick="setup2FA()" class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-mobile-alt text-gray-600"></i>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">Two-Factor Auth</div>
                            <div class="text-xs text-red-500">Not enabled</div>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </button>
                
                <button onclick="manageDevices()" class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-laptop text-gray-600"></i>
                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">Connected Devices</div>
                            <div class="text-xs text-gray-500">3 active sessions</div>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </button>
            </div>
        </div>
    `;
}

// Support Section
function renderSupportSection() {
    return `
        <div class="dashboard-card p-6">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas fa-life-ring"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Support</h2>
            </div>
            
            <div class="space-y-3">
                <a href="#" class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <i class="fas fa-book text-teal-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">Documentation</div>
                        <div class="text-xs text-gray-500">Guides and tutorials</div>
                    </div>
                    <i class="fas fa-external-link-alt text-gray-400"></i>
                </a>
                
                <a href="#" class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <i class="fas fa-question-circle text-teal-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">Help Center</div>
                        <div class="text-xs text-gray-500">FAQs and support</div>
                    </div>
                    <i class="fas fa-external-link-alt text-gray-400"></i>
                </a>
                
                <a href="#" class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <i class="fas fa-envelope text-teal-600"></i>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">Contact Support</div>
                        <div class="text-xs text-gray-500">Get help from our team</div>
                    </div>
                    <i class="fas fa-external-link-alt text-gray-400"></i>
                </a>
            </div>
        </div>
    `;
}

// Toggle switch handler
function toggleSwitch(element) {
    element.classList.toggle('active');
}

// Action handlers
function editProfile() {
    window.location.href = 'profile.html';
}

function openSettings() {
    window.location.href = 'settings.html';
}

function upgradePlan() {
    window.location.href = 'index.html#pricing';
}

function manageBilling() {
    alert('Billing management coming soon!');
}

function viewAllFiles() {
    alert('File history view coming soon!');
}

function addAccount() {
    alert('Account connection wizard coming soon!');
}

function connectAccount(service) {
    alert(`Connecting to ${service}...`);
}

function disconnectAccount(service) {
    if (confirm(`Are you sure you want to disconnect ${service}?`)) {
        alert(`${service} disconnected successfully!`);
    }
}

function saveExportPreference() {
    const format = document.getElementById('export-format').value;
    const dateFormat = document.getElementById('date-format').value;
    localStorage.setItem('exportFormat', format);
    localStorage.setItem('dateFormat', dateFormat);
    showToast('Export preferences saved!');
}

function changePassword() {
    window.location.href = 'settings.html';
}

function setup2FA() {
    alert('Two-factor authentication setup coming soon!');
}

function manageDevices() {
    alert('Device management coming soon!');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl animate-bounce';
    toast.style.background = 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
    toast.style.color = 'white';
    toast.style.zIndex = '9999';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function loadRecentActivity() {
    // Simulate loading recent activity
    console.log('Recent activity loaded');
}
