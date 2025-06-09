import requests

PROMETHEUS_URL = "https://prometheus-k8s-openshift-monitoring.apps.osmt.johan.ml"
TOKEN_PATH = "/etc/power-controller/prometheus-token"  # Ensure this file is mounted in the container

def get_bearer_token():
    with open(TOKEN_PATH, "r") as f:
        return f.read().strip()

def query_prometheus(query):
    headers = {
        "Authorization": f"Bearer {get_bearer_token()}"
    }
    response = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={"query": query}, headers=headers, verify=False)
    return response.json()

def get_cluster_load():
    cpu_query = 'sum(rate(container_cpu_usage_seconds_total{job="kubelet", image!=""}[5m])) by (node)'
    mem_query = 'sum(container_memory_usage_bytes{job="kubelet", image!=""}) by (node)'

    cpu_data = query_prometheus(cpu_query)
    mem_data = query_prometheus(mem_query)

    result = {}
    for item in cpu_data.get("data", {}).get("result", []):
        node = item["metric"]["node"]
        result[node] = {"cpu": item["value"][1]}

    for item in mem_data.get("data", {}).get("result", []):
        node = item["metric"]["node"]
        if node in result:
            result[node]["memory"] = item["value"][1]

    return result
