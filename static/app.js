async function fetchStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const container = document.getElementById('nodes');
    container.innerHTML = '';

    for (const node in data.cluster_load) {
        const cpu = parseFloat(data.cluster_load[node].cpu);
        const mem = parseInt(data.cluster_load[node].memory);
        const cpuMax = 16000;
        const memMax = 64 * 1024 * 1024 * 1024;

        const div = document.createElement('div');
        div.innerHTML = `
            <h2>${node}</h2>
            <canvas id="cpu-${node}"></canvas>
            <canvas id="mem-${node}"></canvas>
            <button onclick="sendAction('${node}', 'on')">Power On</button>
            <button onclick="sendAction('${node}', 'off')">Power Off</button>
            <button onclick="sendAction('${node}', 'reset')">Reset</button>
            <div id="log-${node}"></div>
        `;
        container.appendChild(div);

        new Chart(document.getElementById(`cpu-${node}`), {
            type: 'bar',
            data: {
                labels: ['CPU (millicores)'],
                datasets: [{
                    label: 'Used',
                    data: [cpu],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }, {
                    label: 'Free',
                    data: [cpuMax - cpu],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: cpuMax } } }
        });

        new Chart(document.getElementById(`mem-${node}`), {
            type: 'bar',
            data: {
                labels: ['Memory (bytes)'],
                datasets: [{
                    label: 'Used',
                    data: [mem],
                    backgroundColor: 'rgba(255, 205, 86, 0.6)'
                }, {
                    label: 'Free',
                    data: [memMax - mem],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: memMax } } }
        });
    }
}

async function sendAction(node, action) {
    const logDiv = document.getElementById(`log-${node}`);
    try {
        const res = await fetch(`/power/${node}/${action}`, { method: 'POST' });
        const result = await res.json();
        logDiv.innerText = `${new Date().toLocaleTimeString()} - ${action.toUpperCase()}: ${JSON.stringify(result)}`;
    } catch (e) {
        logDiv.innerText = `${new Date().toLocaleTimeString()} - ERROR: ${e.message}`;
    }
}

fetchStatus();
setInterval(fetchStatus, 10000);
