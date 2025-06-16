def get_amt_status(amt_ip):
    result = check_amt(amt_ip)
    return "reachable" if result.get("reachable") else "unreachable"

def power_action(amt_ip, action):
    if action not in ["on", "off", "reset"]:
        raise ValueError("Invalid power action")
    result = power_control(amt_ip, action)
    if not result.get("success"):
        raise RuntimeError(f"Power action failed for {amt_ip}")
    return f"{action} command sent to {amt_ip}"
