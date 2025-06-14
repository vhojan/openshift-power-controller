from flask import Flask, jsonify, request
from amt_controller import power_control, check_amt
from cluster_status import get_cluster_load

app = Flask(__name__)

NODES = {
    "osmt-node1": {"ip": "192.168.5.11"},
    "osmt-node2": {"ip": "192.168.5.12"},
    "osmt-node3": {"ip": "192.168.5.13"},
}

@app.route("/")
def index():
    return """
    <h1>OpenShift Power Controller</h1>
    <p>This is the backend API service.</p>
    <ul>
        <li><a href="/status">Check Cluster & AMT Status</a></li>
        <li><code>POST /power/&lt;node&gt;/&lt;on|off|reset&gt;</code> to control node power</li>
    </ul>
    """

@app.route("/status")
def status():
    return jsonify({
        "cluster_load": get_cluster_load(),
        "amt": {node: check_amt(data["ip"]) for node, data in NODES.items()}
    })

@app.route("/power/<node>/<action>", methods=["POST"])
def power(node, action):
    if node not in NODES or action not in ["on", "off", "reset"]:
        return jsonify({"error": "Invalid node or action"}), 400
    return jsonify(power_control(NODES[node]["ip"], action))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
