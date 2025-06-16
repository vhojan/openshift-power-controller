from flask import Flask, render_template, request, redirect
from datetime import datetime
from cluster_status import get_cluster_status  # Use your real logic

app = Flask(__name__)

# In-memory event log
event_log = []

@app.route('/')
def index():
    # Use real Prometheus/AMT data
    usage_data = get_cluster_status()
    return render_template('index.html', usage=usage_data, events=event_log)

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
