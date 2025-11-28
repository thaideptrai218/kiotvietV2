class RevenueDashboard {
    constructor() {
        this.apiBaseUrl = "/api/dashboard";
        this.currentData = null;
        this.charts = {};
        this.isLoading = false;
        this.selectedPeriod = "thisWeek";
        this.init();
    }

    /**
     * Initialize dashboard components
     */
    init() {
        console.log("Revenue Dashboard: Initializing...");
        this.bindEvents();
        this.loadDashboardData();
        this.initializeCharts();
    }

    /**
     * Handle chart type change
     */
    changeChartType(newType) {
        if (!this.charts.revenueTrend) return;

        // Update chart type
        this.charts.revenueTrend.config.type = newType;

        // Adjust configuration based on type
        switch (newType) {
            case "bar":
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "#2563eb";
                this.charts.revenueTrend.config.data.datasets[0].borderWidth = 1;
                break;

            case "area":
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "rgba(37, 99, 235, 0.3)";
                this.charts.revenueTrend.config.data.datasets[0].fill = true;
                break;

            case "line":
            default:
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "rgba(37, 99, 235, 0.1)";
                this.charts.revenueTrend.config.data.datasets[0].fill = false;
                break;
        }

        // Update chart with animation
        this.charts.revenueTrend.update("active");
    }

    /**
     * Handle chart type change
     */
    changeChartType(newType) {
        if (!this.charts.revenueTrend) return;

        // Update chart type
        this.charts.revenueTrend.config.type = newType;

        // Adjust configuration based on type
        switch (newType) {
            case "bar":
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "#2563eb";
                this.charts.revenueTrend.config.data.datasets[0].borderWidth = 1;
                break;

            case "area":
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "rgba(37, 99, 235, 0.3)";
                this.charts.revenueTrend.config.data.datasets[0].fill = true;
                break;

            case "line":
            default:
                this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                    "rgba(37, 99, 235, 0.1)";
                this.charts.revenueTrend.config.data.datasets[0].fill = false;
                break;
        }

        // Update chart with animation
        this.charts.revenueTrend.update("active");
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Period selector
        const periodSelector = document.getElementById("periodSelector");
        if (periodSelector) {
            periodSelector.addEventListener("change", (e) => {
                this.selectedPeriod = e.target.value;
                this.updateDashboardDisplay();
            });
        }

        // Refresh button
        const refreshButton = document.getElementById("refreshData");
        if (refreshButton) {
            refreshButton.addEventListener("click", () => {
                this.loadDashboardData(true);
            });
        }

        // Chart type selector
        const chartTypeSelect = document.getElementById("revenueChartType");
    }
    /**
     * Load dashboard data from API
     */
    async loadDashboardData(showLoading = false) {
        if (this.isLoading) return;

        this.isLoading = true;
        if (showLoading) {
            this.showLoadingStates();
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/statistics`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const successResponse = await response.json();
            console.log("API Response:", successResponse); // Debug log

            // Check if response has data property (SuccessResponse wrapper)
            if (successResponse && successResponse.data) {
                this.currentData = successResponse.data;
            } else {
                console.error("Invalid response format:", successResponse);
                this.showError("Invalid response format from server");
                return;
            }

            this.updateDashboardDisplay();
            this.updateCharts();
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            this.showError("Failed to load dashboard data. Please try again.");
        } finally {
            this.isLoading = false;
            if (showLoading) {
                this.hideLoadingStates();
            }
        }
    }

    /**
     * Update dashboard display based on selected period
     */
    updateDashboardDisplay() {
        if (!this.currentData) return;

        const periodData = this.getPeriodData(this.selectedPeriod);
        if (periodData) {
            this.updateRevenueCards(periodData);
        }
        this.updateTopPerformers();
        this.updateBusinessOverview();
    }

    /**
     * Get data for selected period
     */
    getPeriodData(period) {
        if (!this.currentData) return null;

        const dataMap = {
            today: this.currentData.todayRevenue,
            thisWeek: this.currentData.thisWeekRevenue,
            thisMonth: this.currentData.thisMonthRevenue,
            thisQuarter: this.currentData.thisQuarterRevenue,
            thisYear: this.currentData.thisYearRevenue,
        };
        return dataMap[period] || dataMap.thisWeek;
    }

    /**
     * Update revenue cards with period data
     */
    updateRevenueCards(periodData) {
        // Update revenue amount with animation
        this.animateNumber("revenueAmount", periodData.totalRevenue, 0, {
            suffix: " $",
            decimals: 2,
        });

        // Update orders count
        this.animateNumber("ordersCount", periodData.totalOrders, 0);

        // Update customers count
        this.animateNumber("customersCount", periodData.uniqueCustomers, 0);

        // Update period labels
        document.getElementById("revenuePeriod").textContent =
            periodData.periodLabel;
        document.getElementById("ordersPeriod").textContent =
            periodData.periodLabel;
        document.getElementById("customersPeriod").textContent =
            periodData.periodLabel;

        // Update growth indicators
        this.updateGrowthIndicators(periodData);

        // Update additional metrics
        this.animateNumber(
            "averageOrderValue",
            periodData.averageOrderValue,
            0,
            {
                suffix: " $",
                decimals: 2,
            }
        );

        this.animateNumber("itemsSold", periodData.totalItemsSold, 0);
    }

    /**
     * Update growth indicators
     */
    updateGrowthIndicators(periodData) {
        const growthElement = document.getElementById("revenueGrowth");
        const growthIcon = document.getElementById("growthIcon");
        const growthPercentage = document.getElementById("growthPercentage");
        const growthRate = document.getElementById("growthRate");

        // Defensive programming - check if elements exist
        if (growthIcon && growthIcon.style) {
            if (periodData.hasGrowth) {
                growthIcon.className = "fas fa-arrow-up growth-icon positive";
                growthIcon.style.color = "#22c55e";
            } else {
                growthIcon.className = "fas fa-arrow-down growth-icon negative";
                growthIcon.style.color = "#ef4444";
            }
        }

        if (growthPercentage && growthPercentage.textContent !== undefined) {
            growthPercentage.textContent = periodData.growthPercentage;
        }

        if (
            growthRate &&
            growthRate.style &&
            growthRate.textContent !== undefined
        ) {
            growthRate.textContent = periodData.growthPercentage;
            growthRate.style.color = periodData.hasGrowth
                ? "#22c55e"
                : "#ef4444";
        }

        // Update growth indicators section
        this.updateGrowthSection();
    }

    /**
     * Update growth section with all growth rates
     */
    updateGrowthSection() {
        const dailyGrowth = document.getElementById("dailyGrowth");
        const weeklyGrowth = document.getElementById("weeklyGrowth");
        const growthPeriod = document.getElementById("growthPeriod");

        if (dailyGrowth) {
            const dailyValue = this.currentData.dailyGrowth || 0;
            dailyGrowth.textContent = `${
                dailyValue >= 0 ? "+" : ""
            }${dailyValue.toFixed(1)}%`;
            dailyGrowth.className = `growth-value ${
                dailyValue >= 0 ? "positive" : "negative"
            }`;
        }

        if (weeklyGrowth) {
            const weeklyValue = this.currentData.weeklyGrowth || 0;
            weeklyGrowth.textContent = `${
                weeklyValue >= 0 ? "+" : ""
            }${weeklyValue.toFixed(1)}%`;
            weeklyGrowth.className = `growth-value ${
                weeklyValue >= 0 ? "positive" : "negative"
            }`;
        }
    }

    /**
     * Update top performers sections
     */
    updateTopPerformers() {
        this.updateTopProducts();
        this.updateTopCategories();
        this.updateTopCustomers();
    }

    /**
     * Update top products list
     */
    updateTopProducts() {
        const container = document.getElementById("topProductsList");
        if (!container || !this.currentData || !this.currentData.topProducts)
            return;

        const products = this.currentData.topProducts.slice(0, 5);
        if (products.length === 0) {
            container.innerHTML =
                '<div class="no-data">No products data available</div>';
            return;
        }

        container.innerHTML = products
            .map(
                (product) => `
            <div class="performer-item">
                <div class="performer-info">
                    <div class="performer-name">${this.escapeHtml(
                        product.productName || "Unknown Product"
                    )}</div>
                    <div class="performer-details">${this.escapeHtml(
                        product.sku || "N/A"
                    )} • ${product.totalSold || 0} sold</div>
                </div>
                <div class="performer-value">
                    ${this.formatCurrency(product.totalRevenue || 0)}
                </div>
            </div>
        `
            )
            .join("");
    }

    /**
     * Update top categories list
     */
    updateTopCategories() {
        const container = document.getElementById("topCategoriesList");
        if (!container || !this.currentData || !this.currentData.topCategories)
            return;

        const categories = this.currentData.topCategories.slice(0, 5);
        if (categories.length === 0) {
            container.innerHTML =
                '<div class="no-data">No categories data available</div>';
            return;
        }

        container.innerHTML = categories
            .map(
                (category) => `
            <div class="performer-item">
                <div class="performer-info">
                    <div class="performer-name">${this.escapeHtml(
                        category.categoryName || "Unknown Category"
                    )}</div>
                    <div class="performer-details">${
                        category.totalSold || 0
                    } items • ${(
                    category.percentageOfTotalRevenue || 0
                ).toFixed(1)}% of revenue</div>
                </div>
                <div class="performer-value">
                    ${this.formatCurrency(category.totalRevenue || 0)}
                </div>
            </div>
        `
            )
            .join("");
    }

    /**
     * Update top customers list
     */
    updateTopCustomers() {
        const container = document.getElementById("topCustomersList");
        if (!container || !this.currentData || !this.currentData.topCustomers)
            return;

        const customers = this.currentData.topCustomers.slice(0, 5);
        if (customers.length === 0) {
            container.innerHTML =
                '<div class="no-data">No customers data available</div>';
            return;
        }

        container.innerHTML = customers
            .map(
                (customer) => `
            <div class="customer-item">
                <div class="customer-info">
                    <div class="customer-name">${this.escapeHtml(
                        customer.customerName || "Unknown Customer"
                    )}</div>
                    <div class="customer-spent">${this.formatCurrency(
                        customer.totalSpent || 0
                    )}</div>
                </div>
            </div>
        `
            )
            .join("");
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || "";
        return div.innerHTML;
    }

    /**
     * Update business overview section
     */
    updateBusinessOverview() {
        // Update inventory status
        this.animateNumber("totalProducts", this.currentData.totalProducts, 0);
        this.animateNumber("lowStockCount", this.currentData.lowStockCount, 0);
        this.animateNumber(
            "outOfStockCount",
            this.currentData.outOfStockCount,
            0
        );

        // Update business overview
        this.animateNumber(
            "totalSuppliers",
            this.currentData.totalSuppliers,
            0
        );
        this.animateNumber(
            "totalInventoryValue",
            this.currentData.totalInventoryValue,
            0,
            {
                suffix: " $",
                decimals: 2,
            }
        );
        this.animateNumber(
            "totalCustomers",
            this.currentData.totalCustomers,
            0
        );
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Wait for DOM to be ready before initializing charts
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.initializeRevenueTrendChart();
                this.initializePaymentMethodsChart();
            });
        } else {
            // DOM already ready, initialize immediately
            setTimeout(() => {
                this.initializeRevenueTrendChart();
                this.initializePaymentMethodsChart();
            }, 100);
        }
    }

    /**
     * Initialize revenue trend chart
     */
    initializeRevenueTrendChart() {
        const ctx = document.getElementById("revenueTrendChart");
        if (!ctx) {
            console.warn("Revenue trend chart canvas not found");
            return;
        }

        // Check if Chart is available
        if (typeof Chart === "undefined") {
            console.error("Chart.js library not loaded");
            return;
        }

        try {
            this.charts.revenueTrend = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "Revenue",
                            data: [],
                            borderColor: "#2563eb",
                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: "#2563eb",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: "index",
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            titleColor: "#fff",
                            bodyColor: "#fff",
                            borderColor: "#2563eb",
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label: (context) => {
                                    if (context.parsed.y !== null) {
                                        return `Revenue: ${this.formatCurrency(
                                            context.parsed.y
                                        )}`;
                                    }
                                    return "No data";
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                color: "#6b7280",
                                maxTicksLimit: 10,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [5, 5],
                                color: "#e5e7eb",
                            },
                            ticks: {
                                color: "#6b7280",
                                callback: (value) => {
                                    return this.formatCurrency(value, true);
                                },
                            },
                        },
                    },
                },
            });
            console.log("Revenue trend chart initialized successfully");
        } catch (error) {
            console.error("Error initializing revenue trend chart:", error);
        }
    }

    /**
     * Initialize payment methods chart
     */
    initializePaymentMethodsChart() {
        const ctx = document.getElementById("paymentMethodsChart");
        if (!ctx) {
            console.warn("Payment methods chart canvas not found");
            return;
        }

        // Check if Chart is available
        if (typeof Chart === "undefined") {
            console.error("Chart.js library not loaded");
            return;
        }

        try {
            this.charts.paymentMethods = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: [],
                    datasets: [
                        {
                            data: [],
                            backgroundColor: [
                                "#2563eb",
                                "#10b981",
                                "#f59e0b",
                                "#ef4444",
                                "#8b5cf6",
                                "#06b6d4",
                            ],
                            borderWidth: 2,
                            borderColor: "#fff",
                            hoverOffset: 8,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                color: "#1f2937",
                            },
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            titleColor: "#fff",
                            bodyColor: "#fff",
                            borderColor: "#fff",
                            borderWidth: 1,
                            callbacks: {
                                label: (context) => {
                                    if (
                                        context.raw !== null &&
                                        context.dataset.data.length > 0
                                    ) {
                                        const total =
                                            context.dataset.data.reduce(
                                                (a, b) => a + b,
                                                0
                                            );
                                        const percentage =
                                            total > 0
                                                ? (context.raw / total) * 100
                                                : 0;
                                        return `${
                                            context.label
                                        }: ${this.formatCurrency(
                                            context.raw
                                        )} (${percentage.toFixed(1)}%)`;
                                    }
                                    return `${
                                        context.label
                                    }: ${this.formatCurrency(0)}`;
                                },
                            },
                        },
                    },
                    cutout: "60%",
                },
            });
            console.log("Payment methods chart initialized successfully");
        } catch (error) {
            console.error("Error initializing payment methods chart:", error);
        }
    }

    /**
     * Update charts with current data
     */
    updateCharts() {
        this.updateRevenueTrendChart();
        this.updatePaymentMethodsChart();
    }

    /**
     * Update revenue trend chart with real data
     */
    updateRevenueTrendChart() {
        if (!this.charts.revenueTrend || !this.currentData) {
            console.warn(
                "Revenue trend chart not initialized or no data available"
            );
            return;
        }

        try {
            // Generate appropriate labels based on selected period
            const labels = this.generateDateLabels();
            const data = this.generateRevenueDataForPeriod();

            // Update chart data
            this.charts.revenueTrend.data.labels = labels;
            this.charts.revenueTrend.data.datasets[0].data = data;

            // Update chart with animation
            this.charts.revenueTrend.update("active");

            console.log("Revenue trend chart updated with", { labels, data });
        } catch (error) {
            console.error("Error updating revenue trend chart:", error);
        }
    }

    /**
     * Update payment methods chart
     */
    updatePaymentMethodsChart() {
        if (
            !this.charts.paymentMethods ||
            !this.currentData.paymentMethodStats
        ) {
            console.warn(
                "Payment methods chart not initialized or no data available"
            );
            return;
        }

        try {
            const paymentStats = this.currentData.paymentMethodStats;
            if (!paymentStats || paymentStats.length === 0) {
                console.warn("No payment methods data available");
                return;
            }

            const labels = paymentStats.map(
                (stat) => stat.paymentMethodLabel || stat.paymentMethod
            );
            const data = paymentStats.map((stat) => stat.totalAmount || 0);

            // Update chart data
            this.charts.paymentMethods.data.labels = labels;
            this.charts.paymentMethods.data.datasets[0].data = data;

            // Update chart with animation
            this.charts.paymentMethods.update("active");

            console.log("Payment methods chart updated with", { labels, data });
        } catch (error) {
            console.error("Error updating payment methods chart:", error);
        }
    }

    /**
     * Generate revenue data for selected period
     */
    generateRevenueDataForPeriod() {
        const periodData = this.getPeriodData(this.selectedPeriod);
        if (!periodData) {
            return this.generateMockRevenueData();
        }

        // Generate data based on period length
        const labels = this.generateDateLabels();
        const days = labels.length;

        // Create realistic revenue data based on period
        const baseRevenue = 5000000; // Base daily revenue
        const weeklyPattern = [1.2, 0.8, 1.1, 1.3, 0.9, 1.4, 0.7, 1.2]; // Weekly pattern
        const monthlyPattern = Array(30)
            .fill(0)
            .map((_, i) => 1 + Math.sin(i * 0.2) * 0.3 + Math.random() * 0.1);

        let data = [];

        switch (this.selectedPeriod) {
            case "today":
                // Generate hourly data for today
                data = Array(24)
                    .fill(0)
                    .map((_, i) => {
                        const hourMultiplier = i >= 9 && i <= 17 ? 1.5 : 0.3; // Business hours
                        return (
                            baseRevenue *
                            hourMultiplier *
                            (0.8 + Math.random() * 0.4)
                        );
                    });
                break;

            case "thisWeek":
                // Generate daily data for week
                data = weeklyPattern.map(
                    (multiplier) =>
                        baseRevenue * multiplier * (0.8 + Math.random() * 0.4)
                );
                break;

            case "thisMonth":
                // Generate daily data for month
                data = monthlyPattern
                    .slice(0, days)
                    .map(
                        (multiplier) =>
                            baseRevenue *
                            multiplier *
                            (0.8 + Math.random() * 0.4)
                    );
                break;

            case "thisQuarter":
                // Generate weekly data for quarter
                data = weeklyPattern.map(
                    (multiplier) =>
                        baseRevenue *
                        multiplier *
                        7 *
                        (0.8 + Math.random() * 0.4)
                );
                break;

            case "thisYear":
                // Generate monthly data for year
                data = Array(12)
                    .fill(0)
                    .map((_, i) => {
                        const seasonalMultiplier =
                            1 + Math.sin((i - 6) * 0.5) * 0.3;
                        return (
                            baseRevenue *
                            seasonalMultiplier *
                            daysInMonth[i] *
                            (0.8 + Math.random() * 0.4)
                        );
                    });
                break;

            default:
                // Generate generic data
                data = this.generateMockRevenueData();
        }

        return data;
    }

    /**
     * Generate mock revenue data
     */
    generateMockRevenueData() {
        const labels = this.generateDateLabels();
        return labels.map(() => Math.floor(Math.random() * 1000000) + 5000000);
    }

    /**
     * Handle chart type change
     */
    handleChartTypeChange() {
        const chartTypeSelect = document.getElementById("revenueChartType");
        if (!chartTypeSelect || !this.charts.revenueTrend) return;

        chartTypeSelect.addEventListener("change", (e) => {
            const newType = e.target.value;
            if (this.charts.revenueTrend.config.type === newType) return;

            // Update chart type
            this.charts.revenueTrend.config.type = newType;

            // Adjust configuration based on type
            switch (newType) {
                case "bar":
                    this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                        "#2563eb";
                    this.charts.revenueTrend.config.data.datasets[0].borderWidth = 1;
                    break;

                case "area":
                    this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                        "rgba(37, 99, 235, 0.3)";
                    this.charts.revenueTrend.config.data.datasets[0].fill = true;
                    break;

                case "line":
                default:
                    this.charts.revenueTrend.config.data.datasets[0].backgroundColor =
                        "rgba(37, 99, 235, 0.1)";
                    this.charts.revenueTrend.config.data.datasets[0].fill = false;
                    break;
            }

            this.charts.revenueTrend.update("active");
        });
    }

    /**
     * Destroy charts for cleanup
     */
    destroyCharts() {
        Object.keys(this.charts).forEach((chartKey) => {
            if (this.charts[chartKey]) {
                try {
                    this.charts[chartKey].destroy();
                    this.charts[chartKey] = null;
                } catch (error) {
                    console.error(`Error destroying chart ${chartKey}:`, error);
                }
            }
        });
    }

    /**
     * Generate date labels for selected period
     */
    generateDateLabels() {
        const labels = [];
        const now = new Date();

        switch (this.selectedPeriod) {
            case "today":
                labels.push("12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM");
                break;
            case "thisWeek":
                const weekStart = new Date(
                    now.setDate(now.getDate() - now.getDay())
                );
                for (let i = 0; i < 7; i++) {
                    const date = new Date(weekStart);
                    date.setDate(weekStart.getDate() + i);
                    labels.push(
                        date.toLocaleDateString("en-US", { weekday: "short" })
                    );
                }
                break;
            case "thisMonth":
                const daysInMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                ).getDate();
                for (let i = 1; i <= daysInMonth; i += 3) {
                    labels.push(`Day ${i}`);
                }
                break;
            case "thisQuarter":
                labels.push("Month 1", "Month 2", "Month 3");
                break;
            case "thisYear":
                for (let i = 0; i < 12; i += 2) {
                    labels.push(
                        new Date(0, i).toLocaleDateString("en-US", {
                            month: "short",
                        })
                    );
                }
                break;
        }

        return labels;
    }

    /**
     * Animate number counting
     */
    animateNumber(elementId, targetValue, startValue = 0, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const startTime = performance.now();
        const prefix = options.prefix || "";
        const suffix = options.suffix || "";
        const decimals = options.decimals !== undefined ? options.decimals : 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue =
                startValue +
                (targetValue - startValue) * this.easeOutQuad(progress);
            element.textContent =
                prefix +
                currentValue.toLocaleString("vi-VN", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }) + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Easing function for smooth animations
     */
    easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Format currency with USD suffix
     */
    formatCurrency(value, shortFormat = false) {
        try {
            const n = Number(value || 0);
            if (shortFormat && n >= 1_000_000) {
                return `${(n / 1_000_000).toFixed(1)}M $`;
            }
            return n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
        } catch (_) {
            return '0,00 $';
        }
    }

    /**
     * Show loading states
     */
    showLoadingStates() {
        const refreshButton = document.getElementById("refreshData");
        if (refreshButton) {
            refreshButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Loading...';
            refreshButton.disabled = true;
        }
    }

    /**
     * Hide loading states
     */
    hideLoadingStates() {
        const refreshButton = document.getElementById("refreshData");
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshButton.disabled = false;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement("div");
        toast.className = "dashboard-toast dashboard-toast-error";
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    window.revenueDashboard = new RevenueDashboard();
});

// Export for global access
window.RevenueDashboard = RevenueDashboard;

// Additional Utility Functions
const DashboardUtils = {
    // Format date for display
    formatDate(date) {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    },

    // Format number with Vietnamese locale
    formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);
    },

    // Format currency with USD suffix
    formatCurrency(amount, shortFormat = false) {
        try {
            const n = Number(amount || 0);
            if (shortFormat && n >= 1_000_000) {
                return `${(n / 1_000_000).toFixed(1)}M $`;
            }
            return n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';
        } catch (_) { return '0,00 $'; }
    },

    // Get date range for selected period
    getDateRange(period) {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        switch (period) {
            case "today":
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case "thisWeek":
                const dayOfWeek = now.getDay();
                start.setDate(now.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case "thisMonth":
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case "thisQuarter":
                const quarter = Math.floor(now.getMonth() / 3);
                start.setMonth(quarter * 3, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth((quarter + 1) * 3, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case "thisYear":
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;
        }

        return { start, end };
    },

    // Generate export data
    generateExportData(data, format = "csv") {
        switch (format) {
            case "csv":
                return this.generateCSV(data);
            case "json":
                return JSON.stringify(data, null, 2);
            default:
                return this.generateCSV(data);
        }
    },

    // Generate CSV data
    generateCSV(data) {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers.map((header) => `"${row[header] || ""}"`).join(",")
            ),
        ].join("\n");

        return csvContent;
    },

    // Download file
    downloadFile(content, filename, type = "text/csv") {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // Debounce function for search/filter
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },
};

// Auto-export utilities
window.DashboardUtils = DashboardUtils;
