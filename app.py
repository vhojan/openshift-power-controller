from flask import Flask, jsonify, send_from_directory
from datetime import datetime
from cluster_status import get_node_timeseries

app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/status')
def status():
    timeseries = get_node_timeseries()
    amt = {
        node: {"reachable": True}
        for node in timeseries['cpu'].keys()
    }
    return jsonify({
        "amt": amt,
        "timeseries": timeseries
    })

@app.route('/power/<node>/<action>', methods=['POST'])
def power(node, action):
    print(f"{action.upper()} sent to {node}")
    return '', 204
