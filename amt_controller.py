def check_amt(ip):
    return {
        "ip": ip,
        "reachable": True,
        "power_state": "on",
        "firmware": "11.8.50.3399",
        "last_boot": "2025-06-16 12:42:01"
    }

def power_control(ip, action):
    return {"ip": ip, "action": action, "success": True}

def get_amt_status(amt_ip):
    try:
        result = check_amt(amt_ip)
        return {
            "status": "reachable" if result.get("reachable") else "unreachable",
            "power_state": result.get("power_state"),
            "firmware": result.get("firmware"),
            "last_boot": result.get("last_boot"),
        }
    except Exception as e:
        return {
            "status": "unreachable",
            "error": str(e)
        }

def power_action(amt_ip, action):
    if action not in ["on", "off", "reset"]:
        raise ValueError("Invalid power action")
    result = power_control(amt_ip, action)
    if not result.get("success"):
        raise RuntimeError(f"Power action failed for {amt_ip}")
    return f"{action} command sent to {amt_ip}"
