import subprocess, shlex

def check_amt(ip, timeout=5):
    """
    Return True if the node's AMT interface responds (e.g., via ping or WS-MAN).
    Here we just stub a ping check.
    """
    try:
        cmd = f"ping -c1 -W{timeout} {ip}"
        subprocess.run(shlex.split(cmd), check=True, stdout=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False

def power_control(ip, action):
    """
    Dispatch power command via amttool or ipmitool.
    This is a stub returning success. Replace with real logic.
    """
    # Example with amttool:
    # cmd = f"amttool {ip} power {action}"
    # subprocess.run(shlex.split(cmd), check=True)
    return {"status": "sent", "node": ip, "action": action}
