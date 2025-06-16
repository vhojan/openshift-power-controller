
async function fetchStatus() {
    const response = await fetch('/status');
    const data = await response.json();

    const tableBody = document.getElementById("node-table-body");
    tableBody.innerHTML = "";

    Object.keys(data.amt).forEach((node, index) => {
        const cpuUsed = parseFloat(data.cluster_load[node].cpu);
        const cpuTotal = 11500; // Max capacity in millicores
        const memUsed = parseFloat(data.cluster_load[node].memory);
        const memTotal = 64 * 1024 * 1024 * 1024; // Max capacity in bytes

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${node}</td>
            <td><canvas id="cpuChart-${index}"></canvas></td>
            <td><canvas id="memChart-${index}"></canvas></td>
            <td>
                <button onclick="sendPower('${node}', 'on')">Power On</button>
                <button onclick="sendPower('${node}', 'off')">Power Off</button>
                <button onclick="sendPower('${node}', 'reset')">Reset</button>
            </td>
        `;
        tableBody.appendChild(row);

        renderLineChart(`cpuChart-${index}`, "CPU (millicores)", [cpuUsed, cpuTotal], ["Used", "Total"]);
        renderLineChart(`memChart-${index}`, "Memory (GB)", [memUsed / 1024 / 1024 / 1024, memTotal / 1024 / 1024 / 1024], ["Used", "Total"]);
    });
}

function renderLineChart(canvasId, label, data, labels) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                fill: false,
                borderColor: 'blue',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function sendPower(node, action) {
    const response = await fetch(`/power/${node}/${action}`, { method: "POST" });
    const result = await response.json();
    const log = document.getElementById("log");
    log.innerText = `${new Date().toLocaleString()} - ${node} ${action}: ${JSON.stringify(result)}\n` + log.innerText;
}

fetchStatus();
setInterval(fetchStatus, 10000);
