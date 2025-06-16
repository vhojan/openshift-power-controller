
import requests
import os

PROMETHEUS_URL = "https://prometheus-k8s-openshift-monitoring.apps.osmt.johan.ml"
TOKEN_PATH = "/etc/power-controller/prometheus-token"

def get_cluster_metrics(node_name):
    try:
        with open(TOKEN_PATH, 'r') as f:
            token = f.read().strip()

        headers = {"Authorization": f"Bearer {token}"}
        cpu_query = f'sum(rate(container_cpu_usage_seconds_total{{instance="{node_name}"}}[1m]))'
        mem_query = f'sum(container_memory_working_set_bytes{{instance="{node_name}"}})'

        cpu_resp = requests.get(f"{PROMETHEUS_URL}/api/v1/query", headers=headers, params={"query": cpu_query}, verify=False).json()
        mem_resp = requests.get(f"{PROMETHEUS_URL}/api/v1/query", headers=headers, params={"query": mem_query}, verify=False).json()

        cpu_value = float(cpu_resp["data"]["result"][0]["value"][1]) if cpu_resp["data"]["result"] else 0
        mem_value = float(mem_resp["data"]["result"][0]["value"][1]) if mem_resp["data"]["result"] else 0

        return {"cpu": cpu_value, "memory": mem_value}
    except Exception:
        return {"cpu": 0, "memory": 0}
