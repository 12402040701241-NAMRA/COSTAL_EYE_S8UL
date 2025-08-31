// Coastal Threat Alert System - Main Application Logic
class CoastalAlertSystem {
    constructor() {
        this.currentTab = 'dashboard';
        this.refreshInterval = 10000; // 10 seconds default
        this.dataUpdateTimer = null;
        this.charts = {};
        
        // Mock data storage
        this.mockData = {
            coastalRegions: [
                {
                    id: "region_001",
                    name: "Mumbai Coast",
                    latitude: 19.0760,
                    longitude: 72.8777,
                    threat_level: "medium",
                    current_threats: ["storm_surge", "high_tide"],
                    population_at_risk: 50000,
                    last_updated: new Date().toISOString()
                },
                {
                    id: "region_002", 
                    name: "Chennai Marina",
                    latitude: 13.0827,
                    longitude: 80.2707,
                    threat_level: "low",
                    current_threats: [],
                    population_at_risk: 25000,
                    last_updated: new Date().toISOString()
                },
                {
                    id: "region_003",
                    name: "Goa Beaches",
                    latitude: 15.2993,
                    longitude: 74.1240,
                    threat_level: "high",
                    current_threats: ["coastal_erosion", "pollution"],
                    population_at_risk: 75000,
                    last_updated: new Date().toISOString()
                }
            ],
            sensors: [
                {
                    station_id: "STN_001",
                    location: "Mumbai Coast",
                    tide_level: 2.3,
                    wave_height: 1.8,
                    wind_speed: 25,
                    water_temperature: 28.5,
                    salinity: 35.2,
                    ph_level: 8.1,
                    timestamp: new Date().toISOString()
                },
                {
                    station_id: "STN_002",
                    location: "Chennai Marina", 
                    tide_level: 1.9,
                    wave_height: 1.2,
                    wind_speed: 18,
                    water_temperature: 29.1,
                    salinity: 34.8,
                    ph_level: 8.0,
                    timestamp: new Date().toISOString()
                },
                {
                    station_id: "STN_003",
                    location: "Goa Beaches", 
                    tide_level: 2.7,
                    wave_height: 2.2,
                    wind_speed: 32,
                    water_temperature: 27.8,
                    salinity: 35.5,
                    ph_level: 7.9,
                    timestamp: new Date().toISOString()
                }
            ],
            weather: [
                {
                    region: "Mumbai Coast",
                    temperature: 32,
                    humidity: 78,
                    pressure: 1012,
                    wind_direction: "SW",
                    wind_speed: 25,
                    visibility: 8,
                    conditions: "Partly Cloudy",
                    forecast_48h: "Thunderstorms expected"
                },
                {
                    region: "Chennai Marina",
                    temperature: 34,
                    humidity: 72,
                    pressure: 1015,
                    wind_direction: "SE", 
                    wind_speed: 18,
                    visibility: 10,
                    conditions: "Clear",
                    forecast_48h: "Stable conditions"
                },
                {
                    region: "Goa Beaches",
                    temperature: 30,
                    humidity: 85,
                    pressure: 1008,
                    wind_direction: "W", 
                    wind_speed: 32,
                    visibility: 6,
                    conditions: "Overcast",
                    forecast_48h: "Heavy rain expected"
                }
            ],
            alerts: [
                {
                    id: "ALERT_001",
                    type: "Storm Surge Warning",
                    region: "Mumbai Coast",
                    severity: "HIGH",
                    issued_at: new Date(Date.now() - 45 * 60000).toISOString(),
                    expected_impact: "Coastal flooding possible in low-lying areas",
                    recommended_actions: ["Evacuate vulnerable areas", "Activate emergency shelters"],
                    estimated_affected: 50000,
                    status: "Active"
                },
                {
                    id: "ALERT_002", 
                    type: "Coastal Erosion Alert",
                    region: "Goa Beaches",
                    severity: "MEDIUM",
                    issued_at: new Date(Date.now() - 75 * 60000).toISOString(),
                    expected_impact: "Beach infrastructure at risk",
                    recommended_actions: ["Monitor beach access", "Deploy protective barriers"],
                    estimated_affected: 15000,
                    status: "Active"
                },
                {
                    id: "ALERT_003", 
                    type: "Water Quality Alert",
                    region: "Chennai Marina",
                    severity: "LOW",
                    issued_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
                    expected_impact: "Minor water quality concerns",
                    recommended_actions: ["Continue monitoring", "Inform local authorities"],
                    estimated_affected: 5000,
                    status: "Resolved"
                }
            ],
            threatTypes: [
                {name: "Storm Surge", color: "#FF4444", icon: "🌊", status: "active"},
                {name: "Coastal Erosion", color: "#FF8800", icon: "🏔️", status: "active"},
                {name: "Water Pollution", color: "#AA4400", icon: "☢️", status: "monitoring"},
                {name: "Illegal Dumping", color: "#666666", icon: "🗑️", status: "clear"},
                {name: "Cyclonic Activity", color: "#8844FF", icon: "🌀", status: "monitoring"},
                {name: "High Tide", color: "#0088FF", icon: "📈", status: "active"}
            ]
        };

        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.initializeDashboard();
        this.setupEventListeners();
        this.startDataUpdates();
        this.loadChartLibrary();
    }

    loadChartLibrary() {
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                setTimeout(() => this.initializeCharts(), 100);
            };
            document.head.appendChild(script);
        } else {
            this.initializeCharts();
        }
    }

    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Region markers
        const regionMarkers = document.querySelectorAll('.region-marker');
        regionMarkers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.preventDefault();
                const regionId = marker.getAttribute('data-region');
                this.showRegionDetails(regionId);
            });
        });

        // Modal controls
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        if (closeModal) {
            closeModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }

        // Alert management
        const createAlertBtn = document.getElementById('createAlertBtn');
        const cancelAlert = document.getElementById('cancelAlert');
        const newAlertForm = document.getElementById('newAlertForm');

        if (createAlertBtn) {
            createAlertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAlertForm();
            });
        }
        if (cancelAlert) {
            cancelAlert.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAlertForm();
            });
        }
        if (newAlertForm) {
            newAlertForm.addEventListener('submit', (e) => {
                this.createAlert(e);
            });
        }

        // Settings
        const saveSettings = document.getElementById('saveSettings');
        const resetSettings = document.getElementById('resetSettings');
        const themeSelect = document.getElementById('themeSelect');
        const refreshInterval = document.getElementById('refreshInterval');

        if (saveSettings) {
            saveSettings.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
        if (resetSettings) {
            resetSettings.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetSettings();
            });
        }
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.handleThemeChange(e);
            });
        }
        if (refreshInterval) {
            refreshInterval.addEventListener('change', (e) => {
                this.handleRefreshIntervalChange(e);
            });
        }

        // Refresh controls
        const refreshAlerts = document.getElementById('refreshAlerts');
        if (refreshAlerts) {
            refreshAlerts.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshData();
            });
        }

        // Severity filter
        const severityFilter = document.getElementById('severityFilter');
        if (severityFilter) {
            severityFilter.addEventListener('change', (e) => {
                this.filterAlerts();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    switchTab(tabName) {
        if (!tabName) return;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTabContent = document.getElementById(tabName);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }

        this.currentTab = tabName;

        // Load tab-specific content
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'monitoring':
                this.updateMonitoring();
                break;
            case 'alerts':
                this.updateAlertsTab();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'settings':
                this.updateSettings();
                break;
        }
    }

    initializeDashboard() {
        this.updateDashboard();
        this.updateMonitoring();
        this.updateAlertsTab();
    }

    updateDashboard() {
        // Update threat counts
        const activeThreats = this.mockData.alerts.filter(alert => alert.status === 'Active');
        const highThreats = activeThreats.filter(alert => alert.severity === 'HIGH').length;
        const mediumThreats = activeThreats.filter(alert => alert.severity === 'MEDIUM').length;
        const lowThreats = activeThreats.filter(alert => alert.severity === 'LOW').length;

        const activeThreatCount = document.getElementById('activeThreatCount');
        const highThreatsEl = document.getElementById('highThreats');
        const mediumThreatsEl = document.getElementById('mediumThreats');
        const lowThreatsEl = document.getElementById('lowThreats');

        if (activeThreatCount) activeThreatCount.textContent = activeThreats.length;
        if (highThreatsEl) highThreatsEl.textContent = highThreats;
        if (mediumThreatsEl) mediumThreatsEl.textContent = mediumThreats;
        if (lowThreatsEl) lowThreatsEl.textContent = lowThreats;

        // Update weather info
        const primaryWeather = this.mockData.weather[0];
        const weatherInfo = document.getElementById('weatherInfo');
        if (weatherInfo && primaryWeather) {
            weatherInfo.innerHTML = `
                <div class="weather-temp">${Math.round(primaryWeather.temperature)}°C</div>
                <div class="weather-desc">${primaryWeather.conditions}</div>
                <div class="weather-details">
                    <span>💨 ${Math.round(primaryWeather.wind_speed)} km/h</span>
                    <span>💧 ${Math.round(primaryWeather.humidity)}%</span>
                </div>
            `;
        }

        // Update population at risk
        const totalPopulation = this.mockData.coastalRegions
            .filter(region => region.threat_level !== 'low')
            .reduce((sum, region) => sum + region.population_at_risk, 0);
        
        const populationAtRisk = document.getElementById('populationAtRisk');
        if (populationAtRisk) {
            populationAtRisk.textContent = totalPopulation.toLocaleString();
        }

        // Update active alerts
        this.updateActiveAlerts();
    }

    updateActiveAlerts() {
        const alertsList = document.getElementById('activeAlertsList');
        if (!alertsList) return;

        const activeAlerts = this.mockData.alerts.filter(alert => alert.status === 'Active');
        
        if (activeAlerts.length === 0) {
            alertsList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No active alerts</p>';
            return;
        }

        alertsList.innerHTML = activeAlerts.map(alert => `
            <div class="alert-item severity-${alert.severity}">
                <div class="alert-header">
                    <div class="alert-type">${alert.type}</div>
                    <div class="alert-time">${this.formatTime(alert.issued_at)}</div>
                </div>
                <div class="alert-region">${alert.region}</div>
                <div class="alert-description">${alert.expected_impact}</div>
            </div>
        `).join('');
    }

    updateMonitoring() {
        // Update sensor cards
        const sensorsGrid = document.getElementById('sensorsGrid');
        if (sensorsGrid) {
            sensorsGrid.innerHTML = this.mockData.sensors.map(sensor => `
                <div class="sensor-card">
                    <div class="sensor-header">
                        <div class="sensor-title">${sensor.location}</div>
                        <div class="sensor-status">
                            <div class="status-dot"></div>
                            <span>Online</span>
                        </div>
                    </div>
                    <div class="sensor-readings">
                        <div class="reading-item">
                            <div class="reading-value">${sensor.tide_level.toFixed(1)}<span class="reading-unit">m</span></div>
                            <div class="reading-label">Tide Level</div>
                        </div>
                        <div class="reading-item">
                            <div class="reading-value">${sensor.wave_height.toFixed(1)}<span class="reading-unit">m</span></div>
                            <div class="reading-label">Wave Height</div>
                        </div>
                        <div class="reading-item">
                            <div class="reading-value">${Math.round(sensor.wind_speed)}<span class="reading-unit">km/h</span></div>
                            <div class="reading-label">Wind Speed</div>
                        </div>
                        <div class="reading-item">
                            <div class="reading-value">${sensor.water_temperature.toFixed(1)}<span class="reading-unit">°C</span></div>
                            <div class="reading-label">Water Temp</div>
                        </div>
                        <div class="reading-item">
                            <div class="reading-value">${sensor.salinity.toFixed(1)}<span class="reading-unit">ppt</span></div>
                            <div class="reading-label">Salinity</div>
                        </div>
                        <div class="reading-item">
                            <div class="reading-value">${sensor.ph_level.toFixed(1)}</div>
                            <div class="reading-label">pH Level</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update weather grid
        const weatherGrid = document.getElementById('weatherGrid');
        if (weatherGrid) {
            weatherGrid.innerHTML = this.mockData.weather.map(weather => `
                <div class="weather-region-card">
                    <div class="weather-region-name">${weather.region}</div>
                    <div class="weather-params">
                        <div class="weather-param">
                            <span>Temperature:</span>
                            <span>${Math.round(weather.temperature)}°C</span>
                        </div>
                        <div class="weather-param">
                            <span>Humidity:</span>
                            <span>${Math.round(weather.humidity)}%</span>
                        </div>
                        <div class="weather-param">
                            <span>Pressure:</span>
                            <span>${Math.round(weather.pressure)} mb</span>
                        </div>
                        <div class="weather-param">
                            <span>Wind:</span>
                            <span>${Math.round(weather.wind_speed)} km/h ${weather.wind_direction}</span>
                        </div>
                        <div class="weather-param">
                            <span>Visibility:</span>
                            <span>${weather.visibility} km</span>
                        </div>
                        <div class="weather-param">
                            <span>Conditions:</span>
                            <span>${weather.conditions}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update threat types
        const threatTypes = document.getElementById('threatTypes');
        if (threatTypes) {
            threatTypes.innerHTML = this.mockData.threatTypes.map(threat => `
                <div class="threat-type-item">
                    <div class="threat-icon">${threat.icon}</div>
                    <div class="threat-info">
                        <div class="threat-name">${threat.name}</div>
                        <div class="threat-status ${threat.status}">${threat.status}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateAlertsTab() {
        const alertsTableBody = document.getElementById('alertsTableBody');
        if (!alertsTableBody) return;

        alertsTableBody.innerHTML = this.mockData.alerts.map(alert => `
            <tr>
                <td>${this.formatTime(alert.issued_at)}</td>
                <td>${alert.type}</td>
                <td>${alert.region}</td>
                <td><span class="severity-badge severity-${alert.severity}">${alert.severity}</span></td>
                <td><span class="status ${alert.status.toLowerCase()}">${alert.status}</span></td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="coastalSystem.viewAlertDetails('${alert.id}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    updateAnalytics() {
        // Update key metrics
        const keyMetrics = document.getElementById('keyMetrics');
        if (keyMetrics) {
            const totalAlerts = this.mockData.alerts.length;
            const activeAlerts = this.mockData.alerts.filter(alert => alert.status === 'Active').length;
            const totalPopulation = this.mockData.coastalRegions.reduce((sum, region) => sum + region.population_at_risk, 0);
            const avgResponseTime = '8.5';

            keyMetrics.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${totalAlerts}</div>
                    <div class="stat-label">Total Alerts</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${activeAlerts}</div>
                    <div class="stat-label">Active Alerts</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${totalPopulation.toLocaleString()}</div>
                    <div class="stat-label">Population Monitored</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${avgResponseTime} min</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
            `;
        }

        // Update predictions
        const predictions = document.getElementById('predictions');
        if (predictions) {
            predictions.innerHTML = `
                <div class="prediction-item">
                    <div class="prediction-title">Storm Activity Forecast</div>
                    <p>Increased storm activity expected in the next 48-72 hours, particularly affecting western coastal regions.</p>
                    <div class="prediction-confidence">Confidence: 85%</div>
                </div>
                <div class="prediction-item">
                    <div class="prediction-title">Tide Level Prediction</div>
                    <p>Higher than normal tide levels anticipated during the upcoming full moon cycle.</p>
                    <div class="prediction-confidence">Confidence: 92%</div>
                </div>
                <div class="prediction-item">
                    <div class="prediction-title">Erosion Risk Assessment</div>
                    <p>Coastal erosion risk remains elevated for Goa beaches due to recent weather patterns.</p>
                    <div class="prediction-confidence">Confidence: 78%</div>
                </div>
            `;
        }

        // Initialize charts if not already done
        setTimeout(() => this.initializeCharts(), 100);
    }

    initializeCharts() {
        if (!window.Chart) return;

        // Threat trends chart
        const threatTrendsCanvas = document.getElementById('threatTrendsChart');
        if (threatTrendsCanvas && !this.charts.threatTrends) {
            const ctx = threatTrendsCanvas.getContext('2d');
            this.charts.threatTrends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Storm Surge',
                        data: [2, 3, 1, 4, 2, 5, 3],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true
                    }, {
                        label: 'Coastal Erosion',
                        data: [1, 2, 2, 1, 3, 2, 4],
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Incidents'
                            }
                        }
                    }
                }
            });
        }

        // Response time chart
        const responseTimeCanvas = document.getElementById('responseTimeChart');
        if (responseTimeCanvas && !this.charts.responseTime) {
            const ctx = responseTimeCanvas.getContext('2d');
            this.charts.responseTime = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mumbai Coast', 'Chennai Marina', 'Goa Beaches'],
                    datasets: [{
                        label: 'Response Time (minutes)',
                        data: [8.5, 6.2, 9.1],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Minutes'
                            }
                        }
                    }
                }
            });
        }
    }

    showRegionDetails(regionId) {
        const region = this.mockData.coastalRegions.find(r => r.id === regionId);
        if (!region) return;

        const modal = document.getElementById('regionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modalTitle) modalTitle.textContent = region.name;
        
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-details">
                    <div class="detail-row">
                        <span class="detail-label">Threat Level:</span>
                        <span class="detail-value">
                            <span class="status ${region.threat_level}">${region.threat_level.toUpperCase()}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Population at Risk:</span>
                        <span class="detail-value">${region.population_at_risk.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Current Threats:</span>
                        <span class="detail-value">${region.current_threats.length > 0 ? region.current_threats.join(', ') : 'None'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Coordinates:</span>
                        <span class="detail-value">${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${this.formatTime(region.last_updated)}</span>
                    </div>
                </div>
            `;
        }

        if (modal) modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('regionModal');
        if (modal) modal.classList.add('hidden');
    }

    showAlertForm() {
        const alertForm = document.getElementById('alertForm');
        if (alertForm) alertForm.classList.remove('hidden');
    }

    hideAlertForm() {
        const alertForm = document.getElementById('alertForm');
        if (alertForm) alertForm.classList.add('hidden');
        
        const newAlertForm = document.getElementById('newAlertForm');
        if (newAlertForm) newAlertForm.reset();
    }

    createAlert(e) {
        e.preventDefault();
        
        const alertType = document.getElementById('alertType');
        const alertRegion = document.getElementById('alertRegion');
        const alertSeverity = document.getElementById('alertSeverity');
        const alertImpact = document.getElementById('alertImpact');
        const alertActions = document.getElementById('alertActions');

        if (!alertType || !alertRegion || !alertSeverity || !alertImpact || !alertActions) {
            this.showNotification('Missing form elements!', 'error');
            return;
        }

        const newAlert = {
            id: `ALERT_${Date.now()}`,
            type: alertType.value,
            region: alertRegion.value,
            severity: alertSeverity.value,
            expected_impact: alertImpact.value,
            recommended_actions: alertActions.value.split('\n'),
            issued_at: new Date().toISOString(),
            estimated_affected: Math.floor(Math.random() * 50000) + 1000,
            status: 'Active'
        };

        this.mockData.alerts.unshift(newAlert);
        this.hideAlertForm();
        this.updateAlertsTab();
        this.updateDashboard();
        
        this.showNotification('Alert created successfully!', 'success');
    }

    filterAlerts() {
        const severityFilter = document.getElementById('severityFilter');
        const alertsTableBody = document.getElementById('alertsTableBody');
        
        if (!severityFilter || !alertsTableBody) return;

        let filteredAlerts = this.mockData.alerts;
        if (severityFilter.value) {
            filteredAlerts = this.mockData.alerts.filter(alert => alert.severity === severityFilter.value);
        }

        alertsTableBody.innerHTML = filteredAlerts.map(alert => `
            <tr>
                <td>${this.formatTime(alert.issued_at)}</td>
                <td>${alert.type}</td>
                <td>${alert.region}</td>
                <td><span class="severity-badge severity-${alert.severity}">${alert.severity}</span></td>
                <td><span class="status ${alert.status.toLowerCase()}">${alert.status}</span></td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="coastalSystem.viewAlertDetails('${alert.id}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    viewAlertDetails(alertId) {
        const alert = this.mockData.alerts.find(a => a.id === alertId);
        if (!alert) return;

        const modal = document.getElementById('regionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modalTitle) modalTitle.textContent = `Alert: ${alert.type}`;
        
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-details">
                    <div class="detail-row">
                        <span class="detail-label">Region:</span>
                        <span class="detail-value">${alert.region}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Severity:</span>
                        <span class="detail-value">
                            <span class="severity-badge severity-${alert.severity}">${alert.severity}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${alert.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Issued:</span>
                        <span class="detail-value">${this.formatTime(alert.issued_at)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Expected Impact:</span>
                        <span class="detail-value">${alert.expected_impact}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Recommended Actions:</span>
                        <span class="detail-value">${Array.isArray(alert.recommended_actions) ? alert.recommended_actions.join('; ') : alert.recommended_actions}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estimated Affected:</span>
                        <span class="detail-value">${alert.estimated_affected.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }

        if (modal) modal.classList.remove('hidden');
    }

    updateSettings() {
        // Load current settings into form
        const preferences = this.getUserPreferences();
        
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const pushNotifications = document.getElementById('pushNotifications');
        const minSeverity = document.getElementById('minSeverity');
        const themeSelect = document.getElementById('themeSelect');
        const refreshInterval = document.getElementById('refreshInterval');

        if (emailNotifications) emailNotifications.checked = preferences.notifications.email;
        if (smsNotifications) smsNotifications.checked = preferences.notifications.sms;
        if (pushNotifications) pushNotifications.checked = preferences.notifications.push;
        if (minSeverity) minSeverity.value = preferences.minSeverity;
        if (themeSelect) themeSelect.value = preferences.theme;
        if (refreshInterval) refreshInterval.value = preferences.refreshInterval;
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput) apiKeyInput.value = preferences.apiKey || '';
    }

    saveSettings() {
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const pushNotifications = document.getElementById('pushNotifications');
        const minSeverity = document.getElementById('minSeverity');
        const themeSelect = document.getElementById('themeSelect');
        const refreshInterval = document.getElementById('refreshInterval');
        const apiEndpoint = document.getElementById('apiEndpoint');
        const backupFreq = document.getElementById('backupFreq');
            const apiKeyInput = document.getElementById('apiKeyInput');

        const preferences = {
            notifications: {
                email: emailNotifications ? emailNotifications.checked : true,
                sms: smsNotifications ? smsNotifications.checked : true,
                push: pushNotifications ? pushNotifications.checked : true
            },
            minSeverity: minSeverity ? minSeverity.value : 'MEDIUM',
            theme: themeSelect ? themeSelect.value : 'auto',
            refreshInterval: refreshInterval ? parseInt(refreshInterval.value) : 10,
            apiEndpoint: apiEndpoint ? apiEndpoint.value : 'https://api.coastalguard.com/v1',
            backupFrequency: backupFreq ? backupFreq.value : 'daily'
                ,apiKey: apiKeyInput ? apiKeyInput.value : ''
        };

        this.saveUserPreferences(preferences);
        this.refreshInterval = preferences.refreshInterval * 1000;
        this.restartDataUpdates();
        
        this.showNotification('Settings saved successfully!', 'success');
    }

    resetSettings() {
        const defaultPreferences = {
            notifications: { email: true, sms: true, push: true },
            minSeverity: 'MEDIUM',
            theme: 'auto',
            refreshInterval: 10,
            apiEndpoint: 'https://api.coastalguard.com/v1',
            backupFrequency: 'daily'
                ,apiKey: ''
        };

        this.saveUserPreferences(defaultPreferences);
        this.updateSettings();
        this.refreshInterval = 10000;
        this.restartDataUpdates();
        
        this.showNotification('Settings reset to defaults!', 'info');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        // Save preference
        const preferences = this.getUserPreferences();
        preferences.theme = newTheme;
        this.saveUserPreferences(preferences);
    }

    handleThemeChange(e) {
        const theme = e.target.value;
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    handleRefreshIntervalChange(e) {
        this.refreshInterval = parseInt(e.target.value) * 1000;
        this.restartDataUpdates();
    }

    startDataUpdates() {
        this.dataUpdateTimer = setInterval(() => {
            this.simulateDataUpdates();
            if (this.currentTab === 'dashboard') {
                this.updateDashboard();
            } else if (this.currentTab === 'monitoring') {
                this.updateMonitoring();
            }
        }, this.refreshInterval);
    }

    restartDataUpdates() {
        if (this.dataUpdateTimer) {
            clearInterval(this.dataUpdateTimer);
        }
        this.startDataUpdates();
    }

    simulateDataUpdates() {
        // Simulate sensor data changes with smaller, more realistic variations
        this.mockData.sensors.forEach(sensor => {
            sensor.tide_level += (Math.random() - 0.5) * 0.05;
            sensor.wave_height += (Math.random() - 0.5) * 0.05;
            sensor.wind_speed += (Math.random() - 0.5) * 1;
            sensor.water_temperature += (Math.random() - 0.5) * 0.1;
            
            // Keep values within realistic ranges
            sensor.tide_level = Math.max(0.5, Math.min(4.0, sensor.tide_level));
            sensor.wave_height = Math.max(0.2, Math.min(3.0, sensor.wave_height));
            sensor.wind_speed = Math.max(5, Math.min(50, sensor.wind_speed));
            sensor.water_temperature = Math.max(20, Math.min(35, sensor.water_temperature));
            sensor.timestamp = new Date().toISOString();
        });

        // Simulate weather changes with smaller variations
        this.mockData.weather.forEach(weather => {
            weather.temperature += (Math.random() - 0.5) * 0.5;
            weather.humidity += (Math.random() - 0.5) * 1;
            weather.pressure += (Math.random() - 0.5) * 1;
            weather.wind_speed += (Math.random() - 0.5) * 1;
            
            // Keep values within realistic ranges
            weather.temperature = Math.max(20, Math.min(40, weather.temperature));
            weather.humidity = Math.max(40, Math.min(95, weather.humidity));
            weather.pressure = Math.max(995, Math.min(1025, weather.pressure));
            weather.wind_speed = Math.max(5, Math.min(50, weather.wind_speed));
        });

        // Update threat levels occasionally
        if (Math.random() < 0.05) { // 5% chance per update
            const region = this.mockData.coastalRegions[Math.floor(Math.random() * this.mockData.coastalRegions.length)];
            const levels = ['low', 'medium', 'high'];
            region.threat_level = levels[Math.floor(Math.random() * levels.length)];
            region.last_updated = new Date().toISOString();
        }
    }

    refreshData() {
        this.simulateDataUpdates();
        this.updateDashboard();
        this.updateMonitoring();
        this.showNotification('Data refreshed!', 'success');
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.switchTab('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchTab('monitoring');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchTab('alerts');
                    break;
                case '4':
                    e.preventDefault();
                    this.switchTab('analytics');
                    break;
                case '5':
                    e.preventDefault();
                    this.switchTab('settings');
                    break;
                case 'r':
                    e.preventDefault();
                    this.refreshData();
                    break;
            }
        }
    }

    loadUserPreferences() {
        const preferences = this.getUserPreferences();
        
        // Apply theme
        if (preferences.theme !== 'auto') {
            document.documentElement.setAttribute('data-color-scheme', preferences.theme);
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.textContent = preferences.theme === 'dark' ? '☀️' : '🌙';
            }
        }

        // Apply refresh interval
        this.refreshInterval = preferences.refreshInterval * 1000;
    }

    getUserPreferences() {
        const defaultPreferences = {
            notifications: { email: true, sms: true, push: true },
            minSeverity: 'MEDIUM',
            theme: 'auto',
            refreshInterval: 10,
            apiEndpoint: 'https://api.coastalguard.com/v1',
            backupFrequency: 'daily'
                ,apiKey: ''
        };

        try {
            const stored = localStorage.getItem('coastalAlertPreferences');
            return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
        } catch {
            return defaultPreferences;
        }
    }

    saveUserPreferences(preferences) {
        try {
            localStorage.setItem('coastalAlertPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Unable to save preferences:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            box-shadow: var(--shadow-lg);
            z-index: 1100;
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            color: var(--color-text);
            max-width: 300px;
        `;

        if (type === 'success') {
            notification.style.borderLeftColor = 'var(--color-success)';
            notification.style.borderLeftWidth = '4px';
        } else if (type === 'error') {
            notification.style.borderLeftColor = 'var(--color-error)';
            notification.style.borderLeftWidth = '4px';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }
}

// Initialize the application
// --- API request helper ---
CoastalAlertSystem.prototype.fetchWithApiKey = async function(url, options = {}) {
    const preferences = this.getUserPreferences();
    options.headers = options.headers || {};
    if (preferences.apiKey) {
        options.headers['Authorization'] = preferences.apiKey;
    }
    return fetch(url, options);
};
let coastalSystem;

document.addEventListener('DOMContentLoaded', () => {
    coastalSystem = new CoastalAlertSystem();
});