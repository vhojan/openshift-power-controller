import time, requests

PROMETHEUS_URL = "https://prometheus-k8s-openshift-monitoring.apps.osmt.johan.ml"
TOKEN_PATH = "/etc/power-controller/prometheus-token"

def get_bearer_token():
    with open(TOKEN_PATH) as f:
        return f.read().strip()

def query_range(query, step="60s", duration_s=3600):
    now = int(time.time())
    start = now - duration_s
    headers = {"Authorization": f"Bearer {get_bearer_token()}"}
    resp = requests.get(
        f"{PROMETHEUS_URL}/api/v1/query_range",
        params={"query": query, "start": start, "end": now, "step": step},
        headers=headers,
        verify=False
    )
    resp.raise_for_status()
    return resp.json()

def _parse_ts(result):
    out = {}
    for item in result.get("data", {}).get("result", []):
        node = item["metric"].get("node")
        if not node:
            continue
        # convert all samples to float
        values = [float(v[1]) for v in item["values"]]
        out[node] = values
    return out

def get_node_timeseries():
    cpu_q   = 'sum(rate(container_cpu_usage_seconds_total{job="kubelet",image!=""}[5m])) by (node)'
    mem_q   = 'sum(container_memory_usage_bytes{job="kubelet",image!=""}) by (node)'
    power_q = 'sum(node_power_usage_watts) by (node)'  # adjust to your metric

    cpu_data   = query_range(cpu_q)
    mem_data   = query_range(mem_q)
    power_data = query_range(power_q)

    return {
        "cpu":   _parse_ts(cpu_data),
        "memory": _parse_ts(mem_data),
        "power": _parse_ts(power_data),
    }
