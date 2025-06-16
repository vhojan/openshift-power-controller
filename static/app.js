
const chartHistory = {};

function createMiniChart(canvasId, labels, data, color) {
    new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: color,
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
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
        const name = node.name;
        if (!chartHistory[name]) {
            chartHistory[name] = {
                timestamps: [],
                cpu: [],
                mem: [],
                power: []
            };
        }

        chartHistory[name].timestamps.push(now);
        chartHistory[name].cpu.push(node.cpu);
        chartHistory[name].mem.push(node.memory / (1024 * 1024));
        chartHistory[name].power.push(Math.random() * 50 + 50);  // Placeholder

        if (chartHistory[name].cpu.length > 20) {
            ['timestamps', 'cpu', 'mem', 'power'].forEach(key => chartHistory[name][key].shift());
        }

        const amt = node.amt_status || {};
        const statusText = amt.status || "unreachable";
        const firmware = amt.firmware || "—";
        const lastBoot = amt.last_boot || "—";
        const powerState = amt.power_state || "off";
        const amtClass = statusText === "reachable" ? "status-reachable" : "status-unreachable";

        const row = document.createElement('tr');
        const cpuCanvasId = `${name}-cpu`;
        const memCanvasId = `${name}-mem`;
        const pwrCanvasId = `${name}-pwr`;

        row.innerHTML = `
            <td>${name}</td>
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
                <div style="font-size: 10px;"><canvas id="${pwrCanvasId}" width="100" height="20"></canvas></div>
            </td>
            <td>
                <button onclick="powerAction('${name}', 'on')">On</button>
                <button onclick="powerAction('${name}', 'off')">Off</button>
                <button onclick="powerAction('${name}', 'reset')">Reset</button>
                <div id="${name}-state" style="font-size: 10px; color: gray; margin-top: 4px;"></div>
            </td>`;
        table.appendChild(row);

        const chartColor = powerState === "on" ? 'orange' : 'gray';
        const memColor = powerState === "on" ? 'steelblue' : 'lightgray';
        const pwrColor = powerState === "on" ? 'green' : 'red';

        setTimeout(() => {
            createMiniChart(cpuCanvasId, chartHistory[name].timestamps, chartHistory[name].cpu, chartColor);
            createMiniChart(memCanvasId, chartHistory[name].timestamps, chartHistory[name].mem, memColor);
            createMiniChart(pwrCanvasId, chartHistory[name].timestamps, chartHistory[name].power, pwrColor);
        }, 100);
    });
}

async function powerAction(node, action) {
    const stateDiv = document.getElementById(`${node}-state`);
    stateDiv.innerText = '⏳ Applying...';
    const res = await fetch(`/power/${node}/${action}`, { method: 'POST' });
    const result = await res.json();
    const log = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `[${time}] ${node}: ${action} → ${JSON.stringify(result)}<br>`;
    log.scrollTop = log.scrollHeight;
    stateDiv.innerText = '✅ Done';
    setTimeout(() => { stateDiv.innerText = ''; }, 3000);
    fetchStatus();
}

document.getElementById('darkModeToggle').addEventListener('change', function () {
    document.body.classList.toggle('dark', this.checked);
});

setInterval(fetchStatus, 10000);
fetchStatus();
