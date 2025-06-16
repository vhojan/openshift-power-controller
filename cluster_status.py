import os
from kubernetes import client, config
from prometheus_api_client import PrometheusConnect
import datetime

def get_cluster_load():
    try:
        config.load_kube_config(os.getenv("KUBECONFIG", "/kube/kubeconfig.yaml"))
        v1 = client.CoreV1Api()
        prom = PrometheusConnect(url="https://prometheus-k8s-openshift-monitoring.apps.osmt.johan.ml", disable_ssl=True)
        with open("/etc/power-controller/prometheus-token") as f:
            prom.set_bearer_token(f.read().strip())
        end = datetime.datetime.now()
        start = end - datetime.timedelta(minutes=5)

        result = {}
        for node in v1.list_node().items:
            name = node.metadata.name
            cpu_query = f"instance:node_cpu:rate:sum{{instance='{name}'}}"
            mem_query = f"node_memory_MemTotal_bytes{{instance='{name}'}} - node_memory_MemAvailable_bytes{{instance='{name}'}}"

            cpu = prom.get_current_metric_value(cpu_query)
            mem = prom.get_current_metric_value(mem_query)

            result[name] = {
                "cpu": float(cpu[0]['value'][1]) if cpu else None,
                "memory": float(mem[0]['value'][1]) if mem else None
            }

        return result
    except Exception as e:
        return {"error": str(e)}