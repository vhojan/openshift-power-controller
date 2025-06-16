from cluster_status import get_cluster_load
from amt_controller import check_amt

def gather_node_data(NODES):
    cluster = get_cluster_load()
    result = []
    for name, meta in NODES.items():
        node_data = {
            "name": name,
            "ip": meta["ip"],
            "amt": check_amt(meta["ip"]),
            "cpu": None,
            "cpu_total": 6,
            "mem": None,
            "mem_total": 64 * 1024 * 1024 * 1024
        }
        if cluster.get(name):
            node_data["cpu"] = round(float(cluster[name]["cpu"]), 2)
            node_data["mem"] = float(cluster[name]["memory"])
        result.append(node_data)
    return result