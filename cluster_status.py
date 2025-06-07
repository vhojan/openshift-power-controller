from kubernetes import client, config

def get_cluster_load():
    try:
        config.load_kube_config()  # Use in-cluster config if needed
        v1 = client.CoreV1Api()
        nodes = v1.list_node().items
        status = {}
        for node in nodes:
            name = node.metadata.name
            cpu = node.status.allocatable.get("cpu")
            mem = node.status.allocatable.get("memory")
            status[name] = {"cpu": cpu, "memory": mem}
        return status
    except Exception as e:
        return {"error": str(e)}
