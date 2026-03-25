/* ============================================================
   panel.js — Node preview panel
   ============================================================ */

let currentNodeId = null;
let currentSheetNames = [];

// ── Open panel ────────────────────────────────────────────────
window.openPanel = async function(nodeId) {
    currentNodeId = nodeId;

    const panel = document.getElementById('panel');
    panel.classList.remove('panel-hidden');
    document.getElementById('panel-title').textContent = '載入中…';
    document.getElementById('panel-meta').innerHTML = '';
    document.getElementById('panel-tabs').innerHTML = '';
    document.getElementById('panel-table').innerHTML = '';
    document.getElementById('panel-footer').textContent = '';

    try {
        const res = await fetch(`/api/node?id=${encodeURIComponent(nodeId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderPanel(data);
    } catch (err) {
        document.getElementById('panel-title').textContent = '載入失敗';
        console.error('Panel load error:', err);
    }
};

// ── Close panel ───────────────────────────────────────────────
window.closePanel = function() {
    document.getElementById('panel').classList.add('panel-hidden');
    currentNodeId = null;
};

// ── Render panel ──────────────────────────────────────────────
function renderPanel(data) {
    const { meta, sheet_names, active_sheet, preview, total_rows, limit } = data;
    currentSheetNames = sheet_names;

    // Title
    document.getElementById('panel-title').textContent = meta.title;

    // Meta block
    const tagsHtml = meta.tags.map(t =>
        `<span class="tag-badge" style="background:${window.getTagColor(t)}">${t}</span>`
    ).join('');

    const linksHtml = meta.links.length > 0
        ? `<div class="meta-links">
               <span class="meta-label">連結：</span>
               ${meta.links.map(l =>
                   `<a href="#" class="link-ref" data-target="${escHtml(l)}">${escHtml(l)}</a>`
               ).join('，')}
           </div>`
        : '';

    const descHtml = meta.description
        ? `<div class="meta-desc">${escHtml(meta.description)}</div>`
        : '';

    const metaEl = document.getElementById('panel-meta');
    metaEl.innerHTML = `
        ${tagsHtml ? `<div class="meta-tags">${tagsHtml}</div>` : ''}
        ${descHtml}
        ${linksHtml}
    `;

    // Link-ref click → focus node in graph
    metaEl.querySelectorAll('.link-ref').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            window.focusNodeByTitle(a.dataset.target);
        });
    });

    // Sheet tabs
    const tabsEl = document.getElementById('panel-tabs');
    if (sheet_names.length > 0) {
        tabsEl.innerHTML = sheet_names.map(name =>
            `<button class="tab-btn ${name === active_sheet ? 'active' : ''}" data-sheet="${escHtml(name)}">
                ${escHtml(name)}
            </button>`
        ).join('');

        tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => loadSheet(btn.dataset.sheet));
        });
    } else {
        tabsEl.innerHTML = '<span style="color:var(--text-muted);font-size:11px;padding:4px">（無內容工作表）</span>';
    }

    // Table
    if (active_sheet && preview[active_sheet]) {
        renderTable(preview[active_sheet]);
    } else {
        document.getElementById('panel-table').innerHTML = '';
    }

    // Footer
    renderFooter(total_rows, limit, active_sheet);
}

// ── Load a different sheet ────────────────────────────────────
async function loadSheet(sheetName) {
    if (!currentNodeId) return;

    // Update active tab UI immediately
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sheet === sheetName);
    });

    document.getElementById('panel-table').innerHTML = '<tr><td style="color:var(--text-muted)">載入中…</td></tr>';

    try {
        const res = await fetch(
            `/api/node?id=${encodeURIComponent(currentNodeId)}&sheet=${encodeURIComponent(sheetName)}&limit=100`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.preview[sheetName]) {
            renderTable(data.preview[sheetName]);
        } else {
            document.getElementById('panel-table').innerHTML = '';
        }
        renderFooter(data.total_rows, data.limit, sheetName);
    } catch (err) {
        document.getElementById('panel-table').innerHTML =
            `<tr><td style="color:var(--danger)">載入失敗: ${err.message}</td></tr>`;
    }
}

// ── Render table ──────────────────────────────────────────────
function renderTable(rows) {
    const table = document.getElementById('panel-table');

    if (!rows || rows.length === 0) {
        table.innerHTML = '<tr><td style="color:var(--text-muted);padding:12px">（此工作表為空）</td></tr>';
        return;
    }

    // First row as header
    const [headerRow, ...bodyRows] = rows;

    const theadCells = headerRow.map(h => `<th>${escHtml(h)}</th>`).join('');
    const tbodyRows = bodyRows.map(row => {
        const cells = row.map(c => `<td title="${escHtml(c)}">${escHtml(c)}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    table.innerHTML = `
        <thead><tr>${theadCells}</tr></thead>
        <tbody>${tbodyRows}</tbody>
    `;
}

// ── Footer ────────────────────────────────────────────────────
function renderFooter(totalRows, limit, sheetName) {
    const footer = document.getElementById('panel-footer');
    if (!sheetName) {
        footer.textContent = '';
        return;
    }
    if (totalRows > limit) {
        footer.textContent = `顯示前 ${limit} 列 / 共 ${totalRows} 列`;
    } else {
        footer.textContent = `共 ${totalRows} 列`;
    }
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
