
async function fetchStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const table = document.getElementById('node-table');
    table.innerHTML = '';
    data.forEach(node => {
        const row = document.createElement('tr');
        const amtClass = node.amt_status === 'reachable' ? 'status-reachable' : 'status-unreachable';
        row.innerHTML = `
    <td>${node.name}</td>
    <td class="${amtClass}">
        ${node.amt_status}<br>
        <small>FW: ${node.firmware || '—'}</small><br>
        <small>Boot: ${node.last_boot || '—'}</small><br>
        <small>State: ${node.power_state || '—'}</small>
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
    fetchStatus();
}

setInterval(fetchStatus, 10000);
fetchStatus();

document.getElementById('darkModeToggle').addEventListener('change', function() {
    document.body.classList.toggle('dark', this.checked);
});
