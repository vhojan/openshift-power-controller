
async function fetchStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    const table = document.getElementById('node-table');
    table.innerHTML = '';
    data.forEach(node => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${node.name}</td>
            <td>${node.amt_status}</td>
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
    document.getElementById('log').innerText = `${node}: ${action} - ${JSON.stringify(result)}`;
    fetchStatus();
}

setInterval(fetchStatus, 10000);
fetchStatus();
