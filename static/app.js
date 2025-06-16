const chartHistory = {};  // stores history for each node

function createMiniChart(canvasId, labels, data, color) {
    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: color,
                fill: false,
                tension: 0.2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

async function fetchStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const table = document.getElementById('node-table');
    table.innerHTML = '';

    data.forEach(node => {
        const now = new Date().toLocaleTimeString();
        if (!chartHistory[node.name]) {
            chartHistory[node.name] = {
                timestamps: [],
                cpu: [],
                mem: []
            };
        }

        // Add new point
        chartHistory[node.name].timestamps.push(now);
        chartHistory[node.name].cpu.push(node.cpu);
        chartHistory[node.name].mem.push(node.memory / (1024 * 1024));

        // Keep last 20 points
        if (chartHistory[node.name].cpu.length > 20) {
            chartHistory[node.name].timestamps.shift();
            chartHistory[node.name].cpu.shift();
            chartHistory[node.name].mem.shift();
        }

        const statusText = node.amt_status?.status || "unreachable";
        const firmware = node.amt_status?.firmware || "—";
        const lastBoot = node.amt_status?.last_boot || "—";
        const powerState = node.amt_status?.power_state || "—";
        const amtClass = statusText === "reachable" ? "status-reachable" : "status-unreachable";

        const row = document.createElement('tr');
        const cpuCanvasId = `${node.name}-cpu`;
        const memCanvasId = `${node.name}-mem`;

        row.innerHTML = `
            <td>${node.name}</td>
            <td class="${amtClass}">
                ${statusText}<br>
                <small>FW: ${firmware}</small><br>
                <small>Boot: ${lastBoot}</small><br>
                <small>State: ${powerState}</small>
            </td>
            <td>
                <canvas id="${cpuCanvasId}" width="100" height="40"></canvas>
            </td>
            <td>
                <canvas id="${memCanvasId}" width="100" height="40"></canvas>
            </td>
            <td>
                <button onclick="powerAction('${node.name}', 'on')">On</button>
                <button onclick="powerAction('${node.name}', 'off')">Off</button>
                <button onclick="powerAction('${node.name}', 'reset')">Reset</button>
            </td>`;
        table.appendChild(row);

setTimeout(() => {
    createMiniChart(cpuCanvasId, chartHistory[node.name].timestamps, chartHistory[node.name].cpu, 'orange');
    createMiniChart(memCanvasId, chartHistory[node.name].timestamps, chartHistory[node.name].mem, 'steelblue');
}, 100);
    });
}

async function powerAction(node, action) {
    const res = await fetch(`/power/${node}/${action}`, { method: 'POST' });
    const result = await res.json();
    const log = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `[${time}] ${node}: ${action} → ${JSON.stringify(result)}<br>`;
    log.scrollTop = log.scrollHeight;
    fetchStatus();
}

document.getElementById('darkModeToggle').addEventListener('change', function () {
    document.body.classList.toggle('dark', this.checked);
});

setInterval(fetchStatus, 10000);
fetchStatus();
