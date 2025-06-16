async function fetchStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const table = document.getElementById('node-table');
    table.innerHTML = '';

    data.forEach(node => {
        const statusText = node.amt_status?.status || "unreachable";
        const firmware = node.amt_status?.firmware || "—";
        const lastBoot = node.amt_status?.last_boot || "—";
        const powerState = node.amt_status?.power_state || "—";
        const amtClass = statusText === "reachable" ? "status-reachable" : "status-unreachable";

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${node.name}</td>
            <td class="${amtClass}">
                ${statusText}<br>
                <small>FW: ${firmware}</small><br>
                <small>Boot: ${lastBoot}</small><br>
                <small>State: ${powerState}</small>
            </td>
            <td>${node.cpu.toFixed(2)}</td>
            <td>${(node.memory / (1024 * 1024)).toFixed(2)} MB</td>
            <td>
                <button onclick="powerAction('${node.name}', 'on')">On</button>
                <button onclick="powerAction('${node.name}', 'off')">Off</button>
                <button onclick="powerAction('${node.name}', 'reset')">Reset</button>
            </td>`;
        table.appendChild(row);
    });
}

async function powerAction(node, action) {
    const res = await fetch(`/power/${node}/${action}`, { method: 'POST' });
    const result = await res.json();
    const log = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `[${time}] ${node}: ${action} → ${JSON.stringify(result)}<br>`;
    log.scrollTop = log.scrollHeight;
    fetchStatus(); // Refresh immediately after action
}

document.getElementById('darkModeToggle').addEventListener('change', function() {
    document.body.classList.toggle('dark', this.checked);
});

// Auto-refresh every 10 seconds
setInterval(fetchStatus, 10000);
fetchStatus(); // Initial load
