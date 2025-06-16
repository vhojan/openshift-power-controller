from flask import Flask, jsonify, request, render_template
from cluster_status import get_cluster_load, get_node_timeseries
from amt_controller import check_amt, power_control

app = Flask(__name__, template_folder="templates", static_folder="static")

# Define your nodes and their AMT IPs here
NODES = {
    "osmt-node1": {"ip": "192.168.5.11"},
    "osmt-node2": {"ip": "192.168.5.12"},
    "osmt-node3": {"ip": "192.168.5.13"},
}

@app.route("/")
def index():
    # Just render the dashboard shell; data is loaded via JS
    return render_template("index.html")

@app.route("/status")
def status():
    # 1) instant snapshot (if you still need it)
    cluster = get_cluster_load()

    # 2) full-hour timeseries for graphs
    ts = get_node_timeseries()

    # 3) AMT reachability
    amt = { node: {"reachable": check_amt(info["ip"])} 
            for node, info in NODES.items() }

    return jsonify({
      "amt":       amt,
      "cluster":   cluster,
      "timeseries": ts
    })

@app.route("/power/<node>/<action>", methods=["POST"])
def power(node, action):
    if node not in NODES or action not in ("on", "off", "reset"):
        return jsonify({"error": "Invalid node or action"}), 400

    result = power_control(NODES[node]["ip"], action)
    return jsonify(result), 200

if __name__ == "__main__":
    # Expose on all interfaces, port 3000
    app.run(host="0.0.0.0", port=3000)
