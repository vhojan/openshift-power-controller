
async function fetchStatus() {
    const res = await fetch("/status");
    const data = await res.json();
    return data;
}

function updateLog(message) {
    const logDiv = document.getElementById("log");
    logDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}\n` + logDiv.textContent;
}

function createChart(canvasId, label, used, total) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Used', 'Available'],
            datasets: [{
                label: label,
                data: [used, total - used],
                fill: false,
                borderColor: label === 'CPU' ? 'blue' : 'green',
                tension: 0.1
            }]
        },
        options: {
            plugins: { legend: { display: false }},
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function sendPowerCommand(node, action) {
    updateLog(`Sending ${action} to ${node}...`);
    const res = await fetch(`/power/${node}/${action}`, { method: "POST" });
    const result = await res.json();
    updateLog(`Response from ${node}: ${JSON.stringify(result)}`);
}

function renderTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    Object.keys(data.cluster_load).forEach((node, index) => {
        const cpuUsed = parseFloat(data.cluster_load[node].cpu);
        const memUsed = parseInt(data.cluster_load[node].memory);
        const memTotal = 68719476736;  // Assume 64GB per node

        const tr = document.createElement("tr");

        const amtStatus = data.amt[node]?.reachable ? "✅" : "❌";

        tr.innerHTML = `
            <td>${node}</td>
            <td>${amtStatus}</td>
            <td><canvas id="cpuChart${index}"></canvas></td>
            <td><canvas id="memChart${index}"></canvas></td>
            <td>
                <button onclick="sendPowerCommand('${node}', 'on')">Power On</button>
                <button onclick="sendPowerCommand('${node}', 'off')">Power Off</button>
                <button onclick="sendPowerCommand('${node}', 'reset')">Reset</button>
            </td>
        `;

        tableBody.appendChild(tr);

        createChart(`cpuChart${index}`, "CPU", cpuUsed, 6);  // 6 cores
        createChart(`memChart${index}`, "Memory", memUsed, memTotal);
    });
}

async function init() {
    const data = await fetchStatus();
    renderTable(data);
}

init();
setInterval(init, 10000); // auto-refresh every 10 seconds
