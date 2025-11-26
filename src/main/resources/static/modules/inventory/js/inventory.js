
/* =====================================================
   SHARED HELPERS
===================================================== */
function goToCreate() {
    window.location.href = "/inventory/create";
}

const DATE_CHANGE_EVENT = "inventory-date-change";
let fromDate = null;
let toDate = null;

const InventoryUtils = {
    formatDate(date) {
        if (!date) {
            return "";
        }
        const d = typeof date === "string" ? new Date(date) : date;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day}`;
    },
    formatDateTime(date) {
        if (!date) {
            return "-";
        }
        const d = typeof date === "string" ? new Date(date) : date;
        if (Number.isNaN(d.getTime())) {
            return "-";
        }
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hh}:${mm}`;
    },
    downloadFile(filename, text) {
        const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(null, args), delay);
        };
    },
    showToast(message) {
        if (window.Toastify) {
            window.Toastify({ text: message, duration: 3000, gravity: "top", position: "right" }).showToast();
            return;
        }
        alert(message);
    }
};

function broadcastDateRangeChange() {
    document.dispatchEvent(new CustomEvent(DATE_CHANGE_EVENT, {
        detail: {
            fromDate,
            toDate
        }
    }));
}

function generateTempId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* =====================================================
   DATE FILTER + POPUPS
===================================================== */
(function initDateFilter() {
    const presetBtn = document.getElementById("datePresetBtn");
    const popup = document.getElementById("datePopup");
    const dateLabel = document.getElementById("selectedDateLabel");
    const presetRadio = document.querySelector("input[name='dateRange']");
    const customTrigger = document.getElementById("customTrigger");
    const customPopup = document.getElementById("customDatePopup");
    const customRadio = document.getElementById("customRadio");

    if (!presetBtn || !popup || !dateLabel) {
        return;
    }

    const today = new Date();
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    toDate = today;
    dateLabel.textContent = "This month";
    broadcastDateRangeChange();

    popup.classList.remove("show");

    presetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        customPopup?.classList.add("hidden");
        popup.classList.add("show");
    });

    popup.addEventListener("click", (e) => {
        if (!e.target.classList.contains("popup-item")) return;

        document.querySelectorAll(".popup-item").forEach(i => i.classList.remove("selected"));
        e.target.classList.add("selected");

        const presetKey = e.target.dataset.range;
        if (presetKey) {
            const range = resolvePresetRange(presetKey);
            if (range) {
                fromDate = range.from;
                toDate = range.to;
                dateLabel.textContent = range.label;
                broadcastDateRangeChange();
            }
        } else {
            dateLabel.textContent = e.target.textContent;
        }

        popup.classList.remove("show");
        presetRadio.checked = true;
    });

    document.addEventListener("click", (e) => {
        if (!popup.contains(e.target) && !presetBtn.contains(e.target)) {
            popup.classList.remove("show");
        }
    });

    if (customTrigger && customPopup) {
        customTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            popup.classList.remove("show");
            customPopup.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!customPopup.contains(e.target) && !customTrigger.contains(e.target)) {
                customPopup.classList.add("hidden");
            }
        });
    }
    const customApplyBtn = document.getElementById("customApplyBtn");
    const customCancelBtn = document.getElementById("customCancelBtn");

    let currentYearFrom = today.getFullYear();
    let currentYearTo = today.getFullYear();
    let currentMonthFrom = today.getMonth();
    let currentMonthTo = today.getMonth();
    let viewModeFrom = "day";
    let viewModeTo = "day";

    const fromCal = document.getElementById("fromCalendar");
    const toCal = document.getElementById("toCalendar");
    const fromTitle = document.getElementById("fromCalTitle");
    const toTitle = document.getElementById("toCalTitle");
    const fromDateText = document.getElementById("fromDateText");
    const toDateText = document.getElementById("toDateText");

    function renderCalendar(year, month, container, titleEl, side) {
        if (!container || !titleEl) return;
        titleEl.textContent = `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(year, month, 1))} ${year}`;
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        let html = "";
        const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        html += weekdays.map(day => `<div class="cal-weekday">${day}</div>`).join("");
        for (let i = 0; i < firstDay; i++) {
            html += `<div></div>`;
        }
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const isSelected =
                (fromDate && side === "from" && sameDay(dateObj, fromDate)) ||
                (toDate && side === "to" && sameDay(dateObj, toDate));
            html += `<div class="cal-day ${isSelected ? "selected-date" : ""}" data-day="${day}" data-side="${side}">${day}</div>`;
        }
        container.innerHTML = html;
    }

    function renderMonthSelector(titleEl, container, year, side) {
        if (!container || !titleEl) return;
        titleEl.textContent = year;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let html = '<div class="month-grid">';
        months.forEach((label, idx) => {
            html += `<div class="month-item" data-side="${side}" data-month="${idx}">${label}</div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function renderView(side) {
        if (side === "from") {
            if (viewModeFrom === "month") {
                renderMonthSelector(fromTitle, fromCal, currentYearFrom, "from");
            } else {
                renderCalendar(currentYearFrom, currentMonthFrom, fromCal, fromTitle, "from");
            }
        } else {
            if (viewModeTo === "month") {
                renderMonthSelector(toTitle, toCal, currentYearTo, "to");
            } else {
                renderCalendar(currentYearTo, currentMonthTo, toCal, toTitle, "to");
            }
        }
    }

    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    }

    renderView("from");
    renderView("to");

    document.querySelectorAll(".cal-prev").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.cal;
            if (type === "from") {
                if (viewModeFrom === "month") currentYearFrom--;
                else currentMonthFrom--;
                renderView("from");
            } else {
                if (viewModeTo === "month") currentYearTo--;
                else currentMonthTo--;
                renderView("to");
            }
        });
    });

    document.querySelectorAll(".cal-next").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.cal;
            if (type === "from") {
                if (viewModeFrom === "month") currentYearFrom++;
                else currentMonthFrom++;
                renderView("from");
            } else {
                if (viewModeTo === "month") currentYearTo++;
                else currentMonthTo++;
                renderView("to");
            }
        });
    });

    document.querySelectorAll(".cal-title").forEach(title => {
        title.addEventListener("click", () => {
            const type = title.dataset.side;
            if (type === "from") {
                viewModeFrom = viewModeFrom === "day" ? "month" : "day";
                renderView("from");
            } else {
                viewModeTo = viewModeTo === "day" ? "month" : "day";
                renderView("to");
            }
        });
    });

    document.addEventListener("click", e => {
        if (e.target.classList.contains("month-item")) {
            const side = e.target.dataset.side;
            const month = parseInt(e.target.dataset.month, 10);
            if (side === "from") {
                currentMonthFrom = month;
                viewModeFrom = "day";
                renderView("from");
            } else {
                currentMonthTo = month;
                viewModeTo = "day";
                renderView("to");
            }
        }
    });

    document.addEventListener("click", e => {
        if (!e.target.classList.contains("cal-day")) return;
        const day = parseInt(e.target.dataset.day, 10);
        const side = e.target.dataset.side;
        if (side === "from") {
            fromDate = new Date(currentYearFrom, currentMonthFrom, day);
            if (fromDateText) fromDateText.textContent = fromDate.toLocaleDateString("en-GB");
        } else {
            toDate = new Date(currentYearTo, currentMonthTo, day);
            if (toDateText) toDateText.textContent = toDate.toLocaleDateString("en-GB");
        }
        renderView("from");
        renderView("to");
    });

    const customTodayBtn = document.getElementById("customTodayBtn");
    customTodayBtn?.addEventListener("click", () => {
        fromDate = new Date();
        toDate = new Date();
        if (fromDateText) fromDateText.textContent = fromDate.toLocaleDateString("en-GB");
        if (toDateText) toDateText.textContent = toDate.toLocaleDateString("en-GB");
        currentYearFrom = currentYearTo = fromDate.getFullYear();
        currentMonthFrom = currentMonthTo = fromDate.getMonth();
        viewModeFrom = viewModeTo = "day";
        renderView("from");
        renderView("to");
        broadcastDateRangeChange();
    });

    customApplyBtn?.addEventListener("click", () => {
        if (!fromDate || !toDate) {
            alert("Please select both dates.");
            return;
        }
        const label = document.getElementById("customRangeLabel");
        if (label) {
            label.textContent = `${fromDate.toLocaleDateString("en-GB")} → ${toDate.toLocaleDateString("en-GB")}`;
        }
        customPopup?.classList.add("hidden");
        customRadio.checked = true;
        broadcastDateRangeChange();
    });

    customCancelBtn?.addEventListener("click", () => {
        customPopup?.classList.add("hidden");
    });
})();

function resolvePresetRange(key) {
    const now = new Date();
    const startOfWeek = (date) => {
        const copy = new Date(date);
        const diff = copy.getDay();
        copy.setDate(copy.getDate() - diff);
        copy.setHours(0, 0, 0, 0);
        return copy;
    };
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

    switch (key) {
        case "today":
            return { from: new Date(now), to: new Date(now), label: "Today" };
        case "yesterday": {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            return { from: y, to: y, label: "Yesterday" };
        }
        case "thisWeek":
            return { from: startOfWeek(now), to: new Date(now), label: "This week" };
        case "lastWeek": {
            const start = startOfWeek(now);
            start.setDate(start.getDate() - 7);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            return { from: start, to: end, label: "Last week" };
        }
        case "last7": {
            const start = new Date(now);
            start.setDate(start.getDate() - 6);
            return { from: start, to: new Date(now), label: "Last 7 days" };
        }
        case "thisMonth":
        case "thisMonthLunar":
            return { from: startOfMonth(now), to: new Date(now), label: "This month" };
        case "lastMonth":
        case "lastMonthLunar": {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            return { from: start, to: end, label: "Last month" };
        }
        case "last30": {
            const start = new Date(now);
            start.setDate(start.getDate() - 29);
            return { from: start, to: new Date(now), label: "Last 30 days" };
        }
        case "thisQuarter": {
            const quarter = Math.floor(now.getMonth() / 3);
            const start = new Date(now.getFullYear(), quarter * 3, 1);
            return { from: start, to: new Date(now), label: "This quarter" };
        }
        case "lastQuarter": {
            const quarter = Math.floor(now.getMonth() / 3) - 1;
            const start = new Date(now.getFullYear(), quarter * 3, 1);
            const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
            return { from: start, to: end, label: "Last quarter" };
        }
        case "thisYear":
        case "thisYearLunar": {
            const start = new Date(now.getFullYear(), 0, 1);
            return { from: start, to: new Date(now), label: "This year" };
        }
        case "lastYear":
        case "lastYearLunar": {
            const start = new Date(now.getFullYear() - 1, 0, 1);
            const end = new Date(now.getFullYear() - 1, 11, 31);
            return { from: start, to: end, label: "Last year" };
        }
        default:
            return null;
    }
}
/* =====================================================
   INVENTORY API CLIENT
===================================================== */
const InventoryApi = (() => {
    async function request(url, options = {}) {
        const config = {
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            ...options
        };

        if (config.body && typeof config.body !== "string") {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, config);
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const payload = isJson ? await response.json() : null;

        if (!response.ok) {
            const message = payload?.message || "Request failed";
            throw new Error(message);
        }

        return payload?.data ?? payload;
    }

    return {
        list(params) {
            const search = new URLSearchParams(params);
            return request(`/api/inventory-counts?${search.toString()}`);
        },
        detail(id) {
            return request(`/api/inventory-counts/${id}`);
        },
        create(body) {
            return request("/api/inventory-counts", { method: "POST", body });
        },
        update(id, body) {
            return request(`/api/inventory-counts/${id}`, { method: "PUT", body });
        },
        complete(id) {
            return request(`/api/inventory-counts/${id}/complete`, { method: "PUT" });
        },
        addItem(id, body) {
            return request(`/api/inventory-counts/${id}/items`, { method: "POST", body });
        },
        updateItemCount(id, itemId, body) {
            return request(`/api/inventory-counts/${id}/items/${itemId}`, { method: "PUT", body });
        },
        deleteItem(itemId) {
            return request(`/api/inventory-counts/items/${itemId}`, { method: "DELETE" });
        },
        delete(id) {
            return request(`/api/inventory-counts/${id}`, { method: "DELETE" });
        },
        merge(body) {
            return request("/api/inventory-counts/merge", { method: "POST", body });
        }
    };
})();
/* =====================================================
   INVENTORY LIST PAGE
===================================================== */
(function initInventoryListPage() {
    const layout = document.querySelector("[data-page='inventory-list']");
    if (!layout) return;

    const tableBody = document.getElementById("inventoryTableBody");
    const searchInput = document.getElementById("inventorySearchInput");
    const creatorInput = document.getElementById("inventoryCreatorFilter");
    const statusCheckboxes = document.querySelectorAll(".status-filter");
    const exportBtn = document.getElementById("inventoryListExportBtn");
    const mergeBtnContainer = document.getElementById("mergeFloatingBtn");
    const mergeBtn = mergeBtnContainer?.querySelector(".btn-merge");
    const mergeModal = document.getElementById("mergeModal");
    const mergeCloseBtn = document.getElementById("mergeCloseBtn");
    const mergeCancelBtn = document.getElementById("mergeCancelBtn");
    const mergeConfirmBtn = document.getElementById("mergeConfirmBtn");
    const mergeTableBody = document.getElementById("mergeTableBody");
    const mergeSurplus = document.getElementById("mergeSurplus");
    const mergeMissing = document.getElementById("mergeMissing");
    const mergeOnHand = document.getElementById("mergeOnHand");
    const mergeDiff = document.getElementById("mergeDiff");
    const deleteBtnContainer = document.getElementById("deleteFloatingBtn");
    const deleteBtn = deleteBtnContainer?.querySelector(".btn-delete");
    let currentDetailId = null;
    let currentDetailRow = null;

    const state = {
        page: 0,
        size: 20,
        code: "",
        creatorId: "",
        statuses: new Set(Array.from(statusCheckboxes).filter(cb => cb.checked).map(cb => cb.dataset.status)),
        fromDate: null,
        toDate: null,
        sort: "createdAt,desc",
        data: [],
        selectedIds: new Set(),
        hasNonDraft: false
    };

    async function loadInventoryCounts() {
        tableBody.innerHTML = `<tr><td colspan="11" class="inventory-empty-row">Loading...</td></tr>`;
        try {
            const params = {
                page: state.page,
                size: state.size,
                sort: state.sort
            };
            if (state.code) params.code = state.code;
            if (state.creatorId) params.creatorId = state.creatorId;
            if (state.statuses.size === 1) {
                params.status = Array.from(state.statuses)[0];
            }
            if (state.fromDate) params.fromDate = InventoryUtils.formatDate(state.fromDate);
            if (state.toDate) params.toDate = InventoryUtils.formatDate(state.toDate);

            const response = await InventoryApi.list(params);
            state.data = response?.content ?? [];
            state.selectedIds.clear();
            state.hasNonDraft = false;
            currentDetailId = null;
            currentDetailRow = null;
            if (!state.data.length) {
                tableBody.innerHTML = `<tr><td colspan="11" class="inventory-empty-row">No inventory counts found</td></tr>`;
                updateSelectionUI();
                return;
            }

            tableBody.innerHTML = state.data.map(item => `
                <tr data-id="${item.id}" data-status="${item.status}">
                    <td><input type="checkbox" data-row-checkbox></td>
                    <td>${item.code}</td>
                    <td>${InventoryUtils.formatDateTime(item.createdAt)}</td>
                    <td>${item.completedAt ? InventoryUtils.formatDateTime(item.completedAt) : "-"}</td>
                    <td>${item.totalActualCount ?? 0}</td>
                    <td>${item.totalPriceActual ?? 0}</td>
                    <td>${item.totalDiffQty ?? 0}</td>
                    <td>${item.totalSurplus ?? 0}</td>
                    <td>${item.totalMissing ?? 0}</td>
                    <td>${item.note || "-"}</td>
                    <td class="status-cell">${renderStatusBadge(item.status)}</td>
                </tr>
            `).join("");
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="11" class="inventory-empty-row">${error.message}</td></tr>`;
        }
    }

    function renderStatusBadge(status) {
        if (status === "COMPLETED") {
            return `<span class="status-completed">Completed</span>`;
        }
        if (status === "CANCELLED") {
            return `<span class="status-cancelled">Cancelled</span>`;
        }
        return `<span class="status-draft">Draft</span>`;
    }

    tableBody.addEventListener("click", (e) => {
        const row = e.target.closest("tr[data-id]");
        if (!row) return;
        if (e.target.matches("input[type='checkbox']")) {
            return;
        }
        openDetail(row.dataset.id, row);
    });

    async function openDetail(id, rowEl) {
        // remove existing detail rows
        if (currentDetailRow) {
            currentDetailRow.remove();
            currentDetailRow = null;
        }
        if (currentDetailId === id) {
            currentDetailId = null;
            return;
        }
        currentDetailId = id;
        const detailRow = document.createElement("tr");
        detailRow.className = "detail-row";
        detailRow.innerHTML = `<td colspan="11"><div class="detail-loading">Loading detail...</div></td>`;
        rowEl.insertAdjacentElement("afterend", detailRow);
        currentDetailRow = detailRow;
        try {
            const detail = await InventoryApi.detail(id);
            detailRow.innerHTML = `<td colspan="11">${buildDetailMarkup(detail)}</td>`;
            wireDetailActions(detail);
        } catch (error) {
            detailRow.innerHTML = `<td colspan="11"><div class="detail-loading">${error.message}</div></td>`;
        }
    }

    function buildDetailMarkup(detail) {
        const statusBadge = renderStatusBadge(detail.status);
        const items = (detail.items ?? []).map(item => `
            <tr>
                <td>${item.productNumber}</td>
                <td>${item.productName}</td>
                <td>${item.onHand}</td>
                <td>${item.counted}</td>
                <td>${item.diffQty}</td>
                <td>${item.diffCost}</td>
            </tr>
        `).join("") || `<tr><td colspan="6" class="inventory-empty-row">No items</td></tr>`;

        const totals = `
            <div>Total counted: <b>${detail.totalActualCount ?? 0}</b></div>
            <div>Surplus qty: <b>${detail.totalSurplus ?? 0}</b></div>
            <div>Missing qty: <b>${detail.totalMissing ?? 0}</b></div>
            <div>Total diff. quantity: <b>${detail.totalDiffQty ?? 0}</b></div>
        `;

        return `
            <div class="inventory-detail-box" data-detail-id="${detail.id}">
                <div class="detail-header">
                    <h3 class="detail-title">${detail.code}</h3>
                    ${statusBadge}
                </div>

                <div class="detail-meta">
                    Creator: <b>${detail.createdBy ?? "-"}</b>
                    <span class="meta-sep">|</span>
                    Created date: ${InventoryUtils.formatDateTime(detail.createdAt)}
                    ${detail.completedAt ? `<span class="meta-sep">|</span> Completed date: ${InventoryUtils.formatDateTime(detail.completedAt)}` : ""}
                </div>

                <table class="kv-table detail-table">
                    <thead>
                        <tr>
                            <th>Product number</th>
                            <th>Product name</th>
                            <th>On hand</th>
                            <th>Counted</th>
                            <th>Diff. qty</th>
                            <th>Diff. cost</th>
                        </tr>
                    </thead>
                    <tbody>${items}</tbody>
                </table>

                <div class="detail-totals">${totals}</div>
                <textarea class="detail-note" id="detailNoteField" placeholder="Note...">${detail.note || ""}</textarea>

                <div class="detail-actions">
                    <button class="btn-outline" data-action="delete">Delete</button>
                    <button class="btn-outline" data-action="copy">Copy</button>
                    <button class="btn-outline" data-action="export">Export</button>
                    <button class="btn-outline" data-action="edit">Edit</button>
                    <button class="btn-save" data-action="save">Save</button>
                    <button class="btn-save" data-action="complete">Complete</button>
                </div>
            </div>
        `;
    }

    function wireDetailActions(detail) {
        const detailBox = currentDetailRow ? currentDetailRow.querySelector(".inventory-detail-box") : null;
        if (!detailBox) return;

        detailBox.addEventListener("click", async (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            try {
                switch (action) {
                    case "close":
                        if (currentDetailRow) currentDetailRow.remove();
                        currentDetailRow = null;
                        currentDetailId = null;
                        break;
                    case "delete":
                        if (!confirm("Delete this inventory count?")) return;
                        await InventoryApi.delete(detail.id);
                        if (currentDetailRow) currentDetailRow.remove();
                        currentDetailRow = null;
                        currentDetailId = null;
                        state.selectedIds.delete(detail.id);
                        await loadInventoryCounts();
                        updateSelectionUI();
                        break;
                    case "copy":
                        await duplicateInventory(detail);
                        break;
                    case "export":
                        exportInventory(detail);
                        break;
                    case "complete":
                        await InventoryApi.complete(detail.id);
                        InventoryUtils.showToast("Inventory completed");
                        await loadInventoryCounts();
                        await openDetail(detail.id);
                        break;
                    case "save": {
                        const noteField = document.getElementById("detailNoteField");
                        await InventoryApi.update(detail.id, { note: noteField.value });
                        InventoryUtils.showToast("Inventory updated");
                        await loadInventoryCounts();
                        await openDetail(detail.id);
                        break;
                    }
                    case "edit":
                        window.location.href = `/inventory/edit/${detail.id}`;
                        break;
                    default:
                        break;
                }
            } catch (error) {
                InventoryUtils.showToast(error.message);
            }
        });
    }

    async function duplicateInventory(detail) {
        if (!(detail.items ?? []).length) {
            InventoryUtils.showToast("Nothing to copy");
            return;
        }
        const payload = {
            code: null,
            note: detail.note ? `Copy of ${detail.code}: ${detail.note}` : `Copy of ${detail.code}`,
            items: detail.items.map(item => ({
                productId: item.productId,
                productNumber: item.productNumber,
                productName: item.productName,
                unit: item.unit,
                onHand: item.onHand,
                counted: item.counted
            }))
        };
        const result = await InventoryApi.create(payload);
        InventoryUtils.showToast("Inventory duplicated");
        await loadInventoryCounts();
        await openDetail(result.id);
    }

    function exportInventory(detail) {
        const rows = [
            ["Product number", "Product name", "On hand", "Counted", "Diff qty", "Diff cost"],
            ...(detail.items ?? []).map(item => [
                item.productNumber,
                item.productName,
                item.onHand,
                item.counted,
                item.diffQty,
                item.diffCost
            ])
        ];
        const csv = rows.map(row => row.map(value => `"${value ?? ""}"`).join(",")).join("\n");
        InventoryUtils.downloadFile(`${detail.code}.csv`, csv);
    }

    searchInput?.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            state.code = e.target.value.trim();
            state.page = 0;
            loadInventoryCounts();
        }
    });

    creatorInput?.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            state.creatorId = e.target.value.trim();
            state.page = 0;
            loadInventoryCounts();
        }
    });

    statusCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            if (cb.checked) {
                state.statuses.add(cb.dataset.status);
            } else {
                state.statuses.delete(cb.dataset.status);
            }
            loadInventoryCounts();
        });
    });

    exportBtn?.addEventListener("click", () => {
        if (!state.data.length) {
            InventoryUtils.showToast("No data to export");
            return;
        }
        const header = ["Code", "Created", "Completed", "Actual", "Actual price", "Diff", "Surplus", "Missing", "Note", "Status"];
        const rows = state.data.map(item => [
            item.code,
            InventoryUtils.formatDateTime(item.createdAt),
            item.completedAt ? InventoryUtils.formatDateTime(item.completedAt) : "-",
            item.totalActualCount ?? 0,
            item.totalPriceActual ?? 0,
            item.totalDiffQty ?? 0,
            item.totalSurplus ?? 0,
            item.totalMissing ?? 0,
            item.note ?? "",
            item.status
        ]);
        const csv = [header, ...rows].map(row => row.map(value => `"${value}"`).join(",")).join("\n");
        InventoryUtils.downloadFile("inventory-counts.csv", csv);
    });

    document.addEventListener(DATE_CHANGE_EVENT, (event) => {
        state.fromDate = event.detail.fromDate;
        state.toDate = event.detail.toDate;
        state.page = 0;
        loadInventoryCounts();
    });

    function updateSelectionUI() {
        if (!mergeBtnContainer || !mergeBtn || !deleteBtnContainer || !deleteBtn) return;
        const count = state.selectedIds.size;
        if (count === 0) {
            mergeBtnContainer.classList.add("hidden");
            mergeBtn.disabled = true;
            deleteBtnContainer.classList.add("hidden");
            deleteBtn.disabled = true;
            return;
        }
        mergeBtnContainer.classList.remove("hidden");
        mergeBtn.textContent = `Merge (${count})`;
        mergeBtn.disabled = state.hasNonDraft;
        deleteBtnContainer.classList.remove("hidden");
        deleteBtn.textContent = `Delete (${count})`;
        deleteBtn.disabled = false;
    }

    tableBody.addEventListener("change", (e) => {
        if (!e.target.matches("input[data-row-checkbox]")) return;
        const row = e.target.closest("tr[data-id]");
        if (!row) return;
        const id = Number(row.dataset.id);
        const status = row.dataset.status;
        if (e.target.checked) {
            state.selectedIds.add(id);
        } else {
            state.selectedIds.delete(id);
        }
        state.hasNonDraft = Array.from(state.selectedIds).some(selId => {
            const item = state.data.find(d => d.id === selId);
            return item && item.status !== "DRAFT";
        });
        updateSelectionUI();
    });

    mergeBtn?.addEventListener("click", async () => {
        if (state.hasNonDraft) {
            InventoryUtils.showToast("Only draft inventories can be merged");
            return;
        }
        await openMergeModal();
    });

    async function openMergeModal() {
        const ids = Array.from(state.selectedIds);
        if (!ids.length) return;
        mergeModal.classList.remove("hidden");
        mergeTableBody.innerHTML = `<tr><td colspan="5" class="inventory-empty-row">Loading...</td></tr>`;
        try {
            const details = await Promise.all(ids.map(id => InventoryApi.detail(id)));
            const aggregated = {};
            details.forEach(det => {
                (det.items || []).forEach(item => {
                    const key = item.productNumber || `ID-${item.productId}`;
                    if (!aggregated[key]) {
                        aggregated[key] = {
                            productNumber: item.productNumber,
                            productName: item.productName,
                            onHand: 0,
                            counted: 0
                        };
                    }
                    aggregated[key].onHand += item.onHand || 0;
                    aggregated[key].counted += item.counted || 0;
                });
            });

            let surplus = 0;
            let missing = 0;
            let totalOnHand = 0;
            let totalDiff = 0;

            const rows = Object.values(aggregated).map(item => {
                const diff = item.counted - item.onHand;
                totalOnHand += item.onHand;
                totalDiff += diff;
                if (diff > 0) surplus += diff;
                if (diff < 0) missing += diff;
                return `
                    <tr>
                        <td>${item.productNumber}</td>
                        <td>${item.productName}</td>
                        <td>${item.onHand}</td>
                        <td>${item.counted}</td>
                        <td class="${diff > 0 ? "merge-positive" : diff < 0 ? "merge-negative" : ""}">${diff}</td>
                    </tr>
                `;
            });

            mergeTableBody.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="5" class="inventory-empty-row">No items</td></tr>`;
            mergeSurplus.textContent = surplus;
            mergeMissing.textContent = missing;
            mergeOnHand.textContent = totalOnHand;
            mergeDiff.textContent = totalDiff;
        } catch (error) {
            mergeTableBody.innerHTML = `<tr><td colspan="5" class="inventory-empty-row">${error.message}</td></tr>`;
        }
    }

    function closeMergeModal() {
        mergeModal.classList.add("hidden");
    }

    mergeCloseBtn?.addEventListener("click", closeMergeModal);
    mergeCancelBtn?.addEventListener("click", closeMergeModal);

    mergeConfirmBtn?.addEventListener("click", async () => {
        const ids = Array.from(state.selectedIds);
        if (!ids.length) return;
        mergeConfirmBtn.classList.add("btn-loading");
        try {
            const res = await InventoryApi.merge({ ids });
            closeMergeModal();
            InventoryUtils.showToast("Merged successfully");
            window.location.href = `/inventory/edit/${res.newInventoryId}`;
        } catch (error) {
            InventoryUtils.showToast(error.message);
        } finally {
            mergeConfirmBtn.classList.remove("btn-loading");
        }
    });

    deleteBtn?.addEventListener("click", async () => {
        const ids = Array.from(state.selectedIds);
        if (!ids.length) return;
        if (!confirm("Delete selected inventory counts?")) {
            return;
        }
        deleteBtn.classList.add("btn-loading");
        try {
            for (const id of ids) {
                await InventoryApi.delete(id);
            }
            InventoryUtils.showToast("Deleted selected inventory counts");
            state.selectedIds.clear();
            await loadInventoryCounts();
            updateSelectionUI();
        } catch (error) {
            InventoryUtils.showToast(error.message);
        } finally {
            deleteBtn.classList.remove("btn-loading");
        }
    });

    loadInventoryCounts().then(updateSelectionUI);
})();
/* =====================================================
   INVENTORY FORM PAGE
===================================================== */
(function initInventoryFormPage() {
    const layout = document.querySelector(".inventory-form-layout");
    if (!layout) return;

    const tableBody = document.getElementById("inventoryItemsBody");
    const numberInput = document.getElementById("invNumber");
    const noteInput = document.getElementById("inventoryNote");
    const creatorLabel = document.getElementById("inventoryCreatorLabel");
    const createdAtLabel = document.getElementById("inventoryCreatedAtLabel");
    const statusBadge = document.getElementById("inventoryStatusBadge");
    const totalOnHandLabel = document.getElementById("inventoryTotalOnHand");
    const activityList = document.getElementById("activityList");
    const saveBtn = document.getElementById("inventorySaveBtn");
    const completeBtn = document.getElementById("inventoryCompleteBtn");
    const searchInput = document.getElementById("productSearchInput");
    const searchResults = document.getElementById("productSearchResults");
    const tabs = document.querySelectorAll("#invTabs span");
    const diffBox = document.getElementById("diffSummary");

    const formState = {
        mode: layout.dataset.mode || "create",
        inventoryId: layout.dataset.inventoryId || null,
        status: "DRAFT",
        items: [],
        activeTab: "all"
    };

    function setStatusBadge(status) {
        const normalized = (status || "").trim().toUpperCase();
        formState.status = normalized || "DRAFT";
        statusBadge.textContent = formState.status.charAt(0) + formState.status.slice(1).toLowerCase();
        statusBadge.className = "";
        if (formState.status === "COMPLETED") {
            statusBadge.classList.add("status-completed");
        } else if (formState.status === "CANCELLED") {
            statusBadge.classList.add("status-cancelled");
        } else {
            statusBadge.classList.add("status-draft");
        }
        const disabled = formState.status !== "DRAFT";
        tableBody.querySelectorAll("input, button").forEach(el => {
            el.disabled = disabled && el.dataset.preserve !== "true";
        });
        saveBtn.disabled = disabled && formState.mode === "edit";
        completeBtn.disabled = disabled;
    }

    function renderItems() {
        if (!formState.items.length) {
            tableBody.innerHTML = `<tr><td colspan="9" class="inventory-empty-row">No products selected</td></tr>`;
            applyTabFilterAndSummary();
            return;
        }
        tableBody.innerHTML = formState.items.filter(item => !item.markedForDelete).map((item, index) => {
            const diff = item.counted - item.onHand;
            const diffClass = diff > 0 ? "diff-positive" : diff < 0 ? "diff-negative" : "";
            return `
                <tr data-temp-id="${item.tempId}" data-item-id="${item.itemId || ""}">
                    <td><button class="btn-icon" data-action="remove" title="Remove item">&times;</button></td>
                    <td>${index + 1}</td>
                    <td>${item.productNumber}</td>
                    <td>${item.productName}</td>
                    <td>${item.unit || "-"}</td>
                    <td class="on-hand">${item.onHand}</td>
                    <td>
                        <input type="number" class="count-input" value="${item.counted}" min="0">
                    </td>
                    <td class="diff-cell ${diffClass}">${diff}</td>
                    <td>${item.diffCost ?? 0}</td>
                </tr>
            `;
        }).join("");
        applyTabFilterAndSummary();
    }

    function applyTabFilterAndSummary() {
        const rows = Array.from(tableBody.querySelectorAll("tr"));
        const allItems = formState.items.filter(item => !item.markedForDelete);

        let totalOnHand = 0;
        let surplus = 0;
        let missing = 0;
        let totalDiff = 0;
        let matchedCount = 0;
        let unmatchedCount = 0;
        let notCountedCount = 0;

        rows.forEach((row, idx) => {
            const onHand = Number(row.querySelector(".on-hand")?.textContent || 0);
            const countedInput = row.querySelector(".count-input");
            const counted = Number(countedInput?.value || 0);
            const diff = counted - onHand;

            // sync back to state
            const item = allItems[idx];
            if (item) {
                item.counted = counted;
            }

            let visible = true;
            if (formState.activeTab === "matched") visible = diff === 0;
            if (formState.activeTab === "unmatched") visible = diff !== 0;
            if (formState.activeTab === "notcounted") visible = counted === 0;
            row.style.display = visible ? "table-row" : "none";

            if (counted === onHand) matchedCount++; else unmatchedCount++;
            if (counted === 0) notCountedCount++;

            if (visible) {
                totalOnHand += onHand;
                totalDiff += diff;
                if (diff > 0) surplus += diff;
                if (diff < 0) missing += diff;
            }

            const diffCell = row.querySelector(".diff-cell");
            if (diffCell) {
                diffCell.textContent = diff;
                diffCell.classList.remove("diff-positive", "diff-negative");
                if (diff > 0) diffCell.classList.add("diff-positive");
                if (diff < 0) diffCell.classList.add("diff-negative");
            }
        });

        // update tab counts
        tabs.forEach(tab => {
            const key = tab.dataset.tab;
            let count = allItems.length;
            if (key === "matched") count = matchedCount;
            if (key === "unmatched") count = unmatchedCount;
            if (key === "notcounted") count = notCountedCount;
            const label = tab.textContent.split("(")[0].trim();
            tab.textContent = `${label} (${count})`;
        });

        totalOnHandLabel.textContent = totalOnHand;
        const surplusEl = document.getElementById("surplusQty");
        const missingEl = document.getElementById("missingQty");
        const diffEl = document.getElementById("totalDiffQty");

        if (formState.activeTab === "unmatched") {
            if (diffBox) diffBox.style.display = "block";
            if (surplusEl) surplusEl.textContent = surplus;
            if (missingEl) missingEl.textContent = missing;
            if (diffEl) diffEl.textContent = totalDiff;
        } else {
            if (diffBox) diffBox.style.display = "none";
            if (surplusEl) surplusEl.textContent = 0;
            if (missingEl) missingEl.textContent = 0;
            if (diffEl) diffEl.textContent = 0;
        }
    }

    tableBody.addEventListener("input", (e) => {
        if (!e.target.classList.contains("count-input")) return;
        const row = e.target.closest("tr");
        const tempId = row.dataset.tempId;
        const item = formState.items.find(i => String(i.tempId) === String(tempId));
        if (!item) return;
        const newValue = parseInt(e.target.value, 10);
        item.counted = Number.isNaN(newValue) ? 0 : newValue;
        item.isDirty = true;
        applyTabFilterAndSummary();
    });

    tableBody.addEventListener("click", (e) => {
        if (e.target.dataset.action !== "remove") return;
        const row = e.target.closest("tr");
        const tempId = row.dataset.tempId;
        const item = formState.items.find(i => String(i.tempId) === String(tempId));
        if (!item) return;
        if (item.itemId) {
            item.markedForDelete = true;
        } else {
            formState.items = formState.items.filter(i => i.tempId !== item.tempId);
        }
        renderItems();
    });

    const fetchProducts = InventoryUtils.debounce(async (keyword) => {
        if (!keyword) {
            searchResults.classList.add("hidden");
            searchResults.innerHTML = "";
            return;
        }
        try {
            const res = await fetch(`/api/products/autocomplete?query=${encodeURIComponent(keyword)}&limit=10`);
            const payload = await res.json();
            const data = payload?.data ?? [];
            if (!data.length) {
                searchResults.innerHTML = `<div class="product-result-item">No products found</div>`;
                searchResults.classList.remove("hidden");
                return;
            }
            searchResults.innerHTML = data.map(item => {
                const payload = encodeURIComponent(JSON.stringify({
                    id: item.id,
                    productNumber: item.sku || item.barcode || item.id || "",
                    productName: item.name || item.displayName || "",
                    unit: item.unit || "",
                    onHand: item.onHand ?? 0
                }));
                return `
                <div class="product-result-item" data-product="${payload}">
                    <strong>${item.sku || item.barcode || item.id}</strong>
                    <span>${item.name || item.displayName || "-"}</span>
                </div>
            `;
            }).join("");
            searchResults.classList.remove("hidden");
        } catch (error) {
            searchResults.innerHTML = `<div class="product-result-item">${error.message}</div>`;
            searchResults.classList.remove("hidden");
        }
    }, 300);

    searchInput?.addEventListener("input", (e) => {
        fetchProducts(e.target.value.trim());
    });

    document.addEventListener("click", (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add("hidden");
        }
    });

    searchResults?.addEventListener("click", (e) => {
        const item = e.target.closest(".product-result-item");
        if (!item) return;
        try {
            const payload = item.dataset.product ? JSON.parse(decodeURIComponent(item.dataset.product)) : null;
            if (!payload) throw new Error("Invalid product payload");
            addProductToForm({
                id: payload.id,
                sku: payload.productNumber,
                barcode: payload.productNumber,
                name: payload.productName,
                displayName: payload.productName,
                unit: payload.unit,
                onHand: payload.onHand
            });
        } catch (err) {
            InventoryUtils.showToast(err.message || "Unable to add product");
        }
        searchResults.classList.add("hidden");
        searchInput.value = "";
        applyTabFilterAndSummary();
    });

    function addProductToForm(product) {
        if (!product?.id) {
            return;
        }
        if (formState.items.some(item => item.productId === product.id && !item.markedForDelete)) {
            InventoryUtils.showToast("Product already added");
            return;
        }
        formState.items.push({
            tempId: generateTempId(),
            productId: product.id,
            productNumber: product.sku || product.barcode || product.id,
            productName: product.name || product.displayName || "Unnamed product",
            unit: product.unit || "",
            onHand: product.onHand ?? 0,
            counted: product.onHand ?? 0,
            diffCost: 0,
            isDirty: true
        });
        renderItems();
    }
    async function loadExistingInventory() {
        if (!formState.inventoryId) return;
        try {
            const detail = await InventoryApi.detail(formState.inventoryId);
            creatorLabel.textContent = detail.creatorName || detail.creatorFullName || detail.createdByName || detail.creator || detail.createdBy || "-";
            createdAtLabel.textContent = InventoryUtils.formatDateTime(detail.createdAt);
            createdAtLabel.dataset.locked = "true";
            numberInput.value = detail.code;
            noteInput.value = detail.note || "";
            setStatusBadge(detail.status);
            formState.items = (detail.items ?? []).map(item => ({
                tempId: generateTempId(),
                itemId: item.id,
                productId: item.productId,
                productNumber: item.productNumber,
                productName: item.productName,
                unit: item.unit,
                onHand: item.onHand,
                counted: item.counted,
                diffCost: item.diffCost,
                originalCounted: item.counted
            }));
            renderItems();

            if (activityList) {
                activityList.innerHTML = `
                    <li>Created at ${InventoryUtils.formatDateTime(detail.createdAt)}</li>
                    ${detail.completedAt ? `<li>Completed at ${InventoryUtils.formatDateTime(detail.completedAt)}</li>` : ""}
                `;
            }
        } catch (error) {
            InventoryUtils.showToast(error.message);
        }
    }

    async function persistChanges(options = { silent: false }) {
        const code = numberInput.value.trim() || null;
        const note = noteInput.value.trim() || null;

        if (!formState.items.filter(item => !item.markedForDelete).length) {
            throw new Error("Add at least one product before saving");
        }

        if (formState.mode === "create" || !formState.inventoryId) {
            const payload = {
                code,
                note,
                items: formState.items.filter(item => !item.markedForDelete).map(item => ({
                    productId: item.productId,
                    productNumber: item.productNumber,
                    productName: item.productName,
                    unit: item.unit,
                    onHand: item.onHand,
                    counted: item.counted
                }))
            };
            const response = await InventoryApi.create(payload);
            if (!options.silent) {
                InventoryUtils.showToast("Inventory created");
                window.location.href = `/inventory/edit/${response.id}`;
            }
            return response;
        }

        await InventoryApi.update(formState.inventoryId, { note });

        for (const item of formState.items) {
            if (item.markedForDelete && item.itemId) {
                await InventoryApi.deleteItem(item.itemId);
            } else if (!item.itemId) {
                await InventoryApi.addItem(formState.inventoryId, {
                    productId: item.productId,
                    productNumber: item.productNumber,
                    productName: item.productName,
                    unit: item.unit,
                    onHand: item.onHand,
                    counted: item.counted
                });
            } else if (item.isDirty && item.originalCounted !== item.counted) {
                await InventoryApi.updateItemCount(formState.inventoryId, item.itemId, { counted: item.counted });
            }
        }

        if (!options.silent) {
            InventoryUtils.showToast("Inventory saved");
            await loadExistingInventory();
        }
        return { id: formState.inventoryId };
    }

    saveBtn?.addEventListener("click", async () => {
        saveBtn.classList.add("btn-loading");
        try {
            await persistChanges();
        } catch (error) {
            InventoryUtils.showToast(error.message);
        } finally {
            saveBtn.classList.remove("btn-loading");
        }
    });

    completeBtn?.addEventListener("click", async () => {
        completeBtn.classList.add("btn-loading");
        try {
            if (!formState.inventoryId) {
                const created = await persistChanges({ silent: true });
                await InventoryApi.complete(created.id);
                window.location.href = `/inventory/edit/${created.id}`;
                return;
            }
            await persistChanges({ silent: true });
            await InventoryApi.complete(formState.inventoryId);
            InventoryUtils.showToast("Inventory completed");
            await loadExistingInventory();
        } catch (error) {
            InventoryUtils.showToast(error.message);
        } finally {
            completeBtn.classList.remove("btn-loading");
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            formState.activeTab = tab.dataset.tab;
            applyTabFilterAndSummary();
        });
    });

    if (formState.mode === "edit" && layout.dataset.inventoryId) {
        loadExistingInventory().then(applyTabFilterAndSummary);
    } else {
        setStatusBadge("DRAFT");
        renderItems();
    }
})();

