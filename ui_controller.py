from cluster_status import get_cluster_load
from amt_controller import check_amt

def format_resources(cpu_raw, mem_raw):
    try:
        cpu = round(float(cpu_raw), 2)
        mem = round(int(mem_raw) / (1024 ** 3), 2)
        return f"{cpu} cores", f"{mem} GiB"
    except:
        return "N/A", "N/A"

def gather_node_data(NODES):
    load = get_cluster_load()
    data = {}
    for node in NODES:
        cpu = load.get(node, {}).get("cpu", 0)
        memory = load.get(node, {}).get("memory", 0)
        cpu_fmt, mem_fmt = format_resources(cpu, memory)
        data[node] = {
            "cpu": cpu,
            "memory": memory,
            "cpu_formatted": cpu_fmt,
            "memory_formatted": mem_fmt,
            "ip": NODES[node]["ip"],
            "reachable": check_amt(NODES[node]["ip"])["reachable"]
        }
    return data
