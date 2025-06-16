
def get_amt_status(amt_ip):
    # Placeholder: simulate reachable/unreachable check
    import random
    return "reachable" if random.choice([True, False]) else "unreachable"

def power_action(amt_ip, action):
    # Placeholder for actual AMT power control logic
    if action not in ["on", "off", "reset"]:
        raise ValueError("Invalid power action")
    return f"{action} command sent to {amt_ip}"
