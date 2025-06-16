
from flask import Flask, render_template, jsonify, request
from amt_controller import get_amt_status, power_action
from cluster_status import get_cluster_metrics
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

NODES = [
    {"name": "osmt-node1", "openshift_ip": "192.168.4.181", "amt_ip": "192.168.5.11"},
    {"name": "osmt-node2", "openshift_ip": "192.168.4.193", "amt_ip": "192.168.5.12"},
    {"name": "osmt-node3", "openshift_ip": "192.168.4.80", "amt_ip": "192.168.5.13"},
]

@app.route("/")
def index():
    return render_template("index.html", nodes=NODES)

@app.route("/status")
def status():
    status_data = []
    for node in NODES:
        amt = get_amt_status(node["amt_ip"])
        usage = get_cluster_metrics(node["name"])
        status_data.append({
            "name": node["name"],
            "amt_status": amt,
            "cpu": usage.get("cpu"),
            "memory": usage.get("memory")
        })
    return jsonify(status_data)

@app.route("/power/<node>/<action>", methods=["POST"])
def power(node, action):
    target_node = next((n for n in NODES if n["name"] == node), None)
    if not target_node:
        return jsonify({"error": "Node not found"}), 404
    try:
        result = power_action(target_node["amt_ip"], action)
        return jsonify({"result": result})
    except Exception as e:
        logging.error(f"Error performing power action: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
