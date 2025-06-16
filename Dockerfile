FROM python:3.11-slim

ARG INSTALL_OC=false

# Install required packages
RUN apt-get update && \
    apt-get install -y curl unzip && \
    if [ "$INSTALL_OC" = "true" ]; then \
      curl -L https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz | \
      tar -xz -C /usr/local/bin oc && \
      chmod +x /usr/local/bin/oc ; \
    fi && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV KUBECONFIG=/kube/kubeconfig.yaml

EXPOSE 3000

CMD ["python", "main.py"]
