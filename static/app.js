from flask import Flask, render_template, request, redirect
from datetime import datetime

app = Flask(__name__)

# Static list of nodes
NODES = ['osmt-node1', 'osmt-node2', 'osmt-node3']

# In-memory event log
event_log = []

@app.route('/')
def index():
    usage_data = {
        'osmt-node1': {'cpu': 2.57, 'memory': 15.98},
        'osmt-node2': {'cpu': 2.24, 'memory': 38.53},
        'osmt-node3': {'cpu': 1.29, 'memory': 27.87}
    }
    return render_template('index.html', usage=usage_data, nodes=NODES, events=event_log)

@app.route('/power', methods=['POST'])
def power():
    node = request.form.get('node')
    action = request.form.get('action')

    result = f"{action.upper()} command sent to {node}"
    event_log.append({
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'node': node,
        'action': action,
        'result': result
    })

    return redirect('/')
