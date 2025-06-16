
import os
import requests
from requests.auth import HTTPDigestAuth

AMT_USER = os.getenv("AMT_USER", "admin")
AMT_PASS = os.getenv("AMT_PASS", "yourpassword")

POWER_ACTIONS = {
    "on": 2,
    "reset": 5,
    "off": 8
}

def power_action(ip, action):
    return power_control(ip, action)

def power_control(ip, action):
    if action not in POWER_ACTIONS:
        raise ValueError("Invalid power action")

    url = f"http://{ip}:16992/wsman"
    power_state = POWER_ACTIONS[action]

    body = f"""<?xml version="1.0" encoding="utf-8"?>
    <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
                xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
                xmlns:wsman="http://schemas.dmtf.org/wbem/wsman/1/wsman.xsd"
                xmlns:p="http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_PowerManagementService">
      <s:Header>
        <wsa:To>http://{ip}:16992/wsman/</wsa:To>
        <wsa:Action>http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_PowerManagementService/RequestPowerStateChange</wsa:Action>
        <wsman:ResourceURI>http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_PowerManagementService</wsman:ResourceURI>
        <wsa:MessageID>uuid:1</wsa:MessageID>
        <wsa:ReplyTo><wsa:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address></wsa:ReplyTo>
      </s:Header>
      <s:Body>
        <p:RequestPowerStateChange_INPUT>
          <p:PowerState>{power_state}</p:PowerState>
          <p:ManagedElement>
            <wsa:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:Address>
            <wsa:ReferenceParameters>
              <wsman:ResourceURI>http://schemas.dmtf.org/wbem/wscim/1/cim-schema/2/CIM_ComputerSystem</wsman:ResourceURI>
              <wsman:SelectorSet>
                <wsman:Selector Name="Name">ManagedSystem</wsman:Selector>
              </wsman:SelectorSet>
            </wsa:ReferenceParameters>
          </p:ManagedElement>
        </p:RequestPowerStateChange_INPUT>
      </s:Body>
    </s:Envelope>"""

    try:
        resp = requests.post(
            url,
            data=body,
            headers={"Content-Type": "application/soap+xml;charset=UTF-8"},
            auth=HTTPDigestAuth(AMT_USER, AMT_PASS),
            timeout=10
        )

        if resp.status_code != 200:
            raise RuntimeError(f"AMT failed: {resp.status_code} - {resp.text[:300]}")

        return {"success": True, "result": f"{action} command sent to {ip}"}

    except Exception as e:
        return {"error": str(e), "ip": ip, "action": action}


def get_amt_status(ip):
    try:
        url = f"http://{ip}:16992/"
        resp = requests.get(url, timeout=3)
        if resp.status_code != 200:
            raise RuntimeError(f"Unexpected status {resp.status_code}")

        return {
            "status": "reachable",
            "firmware": "11.8.50.3399",  # static, or extend with WSMan parsing
            "power_state": "on",         # optionally query real power state
            "last_boot": "N/A"
        }
    except Exception as e:
        return {
            "status": "unreachable",
            "error": str(e)
        }
