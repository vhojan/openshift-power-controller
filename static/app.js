from flask import Flask, render_template, request, redirect
from datetime import datetime

app = Flask(__name__)

# Simulated node list
NODES = ['osmt-node1', 'osmt-node2', 'osmt-node3']

# In-memory event log
event_log = []

@app.route('/')
def index():
    usage_data = {
        node: {
            'cpu': round(1.0 + i * 0.5, 2),
            'memory': round(16 + i * 10, 2)
        }
        for i, node in enumerate(['osmt-node1', 'osmt-node2', 'osmt-node3'])
    }
    return render_template('index.html', usage=usage_data, nodes=usage_data.keys(), events=event_log)

@app.route('/power', methods=['POST'])
def power():
    node = request.form.get('node')
    action = request.form.get('action')

    # Simulated result
    result = f"{action.upper()} sent to {node}"

    # Append to event log
    event_log.append({
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'node': node,
        'action': action,
        'result': result
    })

    print(result)
    return redirect('/')
