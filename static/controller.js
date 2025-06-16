
async function loadStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    for (const node in data.cluster_load) {
        const row = document.createElement('tr');
        const cpu = parseFloat(data.cluster_load[node].cpu).toFixed(2);
        const mem = (parseFloat(data.cluster_load[node].memory) / (1024**3)).toFixed(2);

        row.innerHTML = `
            <td>${node}</td>
            <td>${cpu} cores</td>
            <td>${mem} GiB</td>
            <td>
                <button onclick="sendPower('${node}', 'off')">Off</button>
                <button onclick="sendPower('${node}', 'on')">On</button>
                <button onclick="sendPower('${node}', 'reset')">Reset</button>
            </td>
            <td><canvas id="chart-${node}" width="200" height="100"></canvas></td>
        `;
        tbody.appendChild(row);
        const ctx = document.getElementById(`chart-${node}`).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Used', 'Total'],
                datasets: [{
                    label: 'CPU',
                    data: [cpu, 11.5],
                    fill: true,
                    borderColor: 'orange',
                    tension: 0.4
                }, {
                    label: 'Memory',
                    data: [mem, 64],
                    fill: true,
                    borderColor: 'blue',
                    tension: 0.4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

async function sendPower(node, action) {
    const log = document.getElementById('statusLog');
    log.innerHTML += `[${new Date().toLocaleTimeString()}] Sending ${action} to ${node}...<br>`;
    const res = await fetch(`/power/${node}/${action}`, { method: 'POST' });
    const result = await res.json();
    log.innerHTML += `[${new Date().toLocaleTimeString()}] Response from ${node}: ${JSON.stringify(result)}<br>`;
    log.scrollTop = log.scrollHeight;
}

setInterval(loadStatus, 10000);
window.onload = loadStatus;
