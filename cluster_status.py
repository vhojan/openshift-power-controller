import requests
import time

PROMETHEUS_URL = "https://prometheus-k8s-openshift-monitoring.apps.osmt.johan.ml"
TOKEN_PATH = "/etc/power-controller/prometheus-token"

def get_bearer_token():
    with open(TOKEN_PATH, "r") as f:
        return f.read().strip()

def query_range(query, duration='1h', step='60s'):
    now = int(time.time())
    start = now - 3600  # last hour
    headers = {"Authorization": f"Bearer {get_bearer_token()}"}
    response = requests.get(
        f"{PROMETHEUS_URL}/api/v1/query_range",
        params={"query": query, "start": start, "end": now, "step": step},
        headers=headers,
        verify=False
    )
    return response.json()

def get_node_timeseries():
    cpu_query = 'rate(container_cpu_usage_seconds_total{job="kubelet", image!=""}[5m])'
    mem_query = 'container_memory_usage_bytes{job="kubelet", image!=""}'
    power_query = 'node_power_usage_watts'  # Simulated or available?

    cpu_data = query_range(f'sum({cpu_query}) by (node)')
    mem_data = query_range(f'sum({mem_query}) by (node)')
    power_data = query_range(f'sum({power_query}) by (node)')

    def parse(result):
        out = {}
        for item in result.get("data", {}).get("result", []):
            node = item["metric"]["node"]
            values = [float(v[1]) for v in item["values"]]
            out[node] = values
        return out

    return {
        "cpu": parse(cpu_data),
        "memory": parse(mem_data),
        "power": parse(power_data)
    }
