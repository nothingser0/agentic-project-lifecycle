# Kubernetes Deployment Guide

**When to use:** Large+ projects requiring container orchestration, auto-scaling, and zero-downtime deployments.

**Prerequisites:**
- Docker containerized application
- Container registry (Docker Hub, GitHub Container Registry, AWS ECR, GCP Artifact Registry)
- Basic K8s knowledge (Pod, Deployment, Service concepts)

---

## Contents

- [When to Use Kubernetes](#when-to-use-kubernetes)
- [K8s Deployment Workflow](#k8s-deployment-workflow)
- [Manifests Structure](#manifests-structure)
- [Deployment Strategies](#deployment-strategies)
- [Health Checks](#health-checks)
- [Auto-scaling](#auto-scaling)
- [Zero-Downtime Deployment](#zero-downtime-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Cost Optimization](#cost-optimization)
- [Security Best Practices](#security-best-practices)
- [Rollback Procedure](#rollback-procedure)

---

## When to Use Kubernetes

### Use K8s When:

- **Scale:** 10+ microservices OR 100+ concurrent users with auto-scaling needs
- **High availability:** Multi-region, zero-downtime requirement
- **Complex orchestration:** Background jobs, cron tasks, queue workers
- **Team size:** 5+ engineers (DevOps overhead justified)

### Don't Use K8s When:

- **Small/Medium projects:** Vercel/Netlify/Fly.io simpler
- **Monolith:** Single container runs fine on Fargate/Cloud Run
- **No DevOps:** K8s requires dedicated infrastructure knowledge
- **Tight budget:** Managed K8s starts at $70+/month (GKE/EKS/AKS control plane)

---

## K8s Deployment Workflow

### Phase 1: Containerize Application

**1. Write Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

**2. Build and push image**

```bash
docker build -t myapp:v1.0 .
docker tag myapp:v1.0 ghcr.io/username/myapp:v1.0
docker push ghcr.io/username/myapp:v1.0
```

---

### Phase 2: Write K8s Manifests

Create `k8s/` directory:

```
k8s/
├── namespace.yaml
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── configmap.yaml
├── secret.yaml
└── hpa.yaml  # Horizontal Pod Autoscaler
```

---

## Manifests Structure

### 1. Namespace

**File:** `k8s/namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp-production
```

---

### 2. Deployment

**File:** `k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: myapp-production
  labels:
    app: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      serviceAccountName: myapp-sa
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: myapp
        image: ghcr.io/username/myapp:v1.0
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop: ["ALL"]
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Key settings:**
- `replicas: 3` → 3 pods for HA
- `RollingUpdate` → zero-downtime deployment
- `resources` → prevent pod from consuming all node resources
- `livenessProbe` → restart unhealthy pod
- `readinessProbe` → don't send traffic to pod until ready

---

### 3. Service

**File:** `k8s/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
  namespace: myapp-production
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

**Service types:**
- `ClusterIP` → internal only (default)
- `NodePort` → expose on node IP (testing)
- `LoadBalancer` → cloud load balancer (AWS ELB, GCP LB)

---

### 4. Ingress

**File:** `k8s/ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp-production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.com
    secretName: myapp-tls
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

**Prerequisites:**
- Ingress controller installed (nginx-ingress, traefik)
- Cert-manager for automatic HTTPS

---

### 5. ConfigMap

**File:** `k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
  namespace: myapp-production
data:
  API_URL: "https://api.myapp.com"
  FEATURE_FLAG_X: "true"
```

---

### 6. Secret

**File:** `k8s/secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
  namespace: myapp-production
type: Opaque
data:
  database-url: <base64-encoded-value>
```

**Generate base64:**

```bash
echo -n "postgresql://user:pass@host:5432/db" | base64
```

**Better: Use external secret manager:**
- AWS Secrets Manager + External Secrets Operator
- GCP Secret Manager + Workload Identity
- HashiCorp Vault

---

### 7. Horizontal Pod Autoscaler (HPA)

**File:** `k8s/hpa.yaml`

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  namespace: myapp-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Behavior:**
- Scale up when CPU > 70% or memory > 80%
- Scale down when CPU < 70% and memory < 80%
- Min 3 pods, max 10 pods

---

## Deployment Strategies

### 1. Rolling Update (Default)

**When:** Most deployments (zero-downtime, gradual rollout)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1  # Max 1 pod down during update
    maxSurge: 1        # Max 1 extra pod during update
```

**Process:**
1. Create 1 new pod (v2)
2. Wait until ready
3. Terminate 1 old pod (v1)
4. Repeat until all pods updated

---

### 2. Blue-Green Deployment

**When:** Instant rollback required, no gradual rollout

**Setup:**
- Deploy v2 as separate deployment (`myapp-v2`)
- Switch Service selector from `app: myapp-v1` to `app: myapp-v2`
- Keep v1 running for instant rollback

```bash
# Deploy v2
kubectl apply -f k8s/deployment-v2.yaml

# Switch traffic (update Service selector)
kubectl patch service myapp-service -p '{"spec":{"selector":{"version":"v2"}}}'

# Rollback if needed
kubectl patch service myapp-service -p '{"spec":{"selector":{"version":"v1"}}}'
```

---

### 3. Canary Deployment

**When:** High-risk changes, gradual traffic shift

**Setup:**
- Deploy v2 with 1 replica
- Use Ingress weighted routing OR Istio traffic split
- Monitor error rate
- Gradually increase v2 replicas

**Example (Istio):**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
  - myapp.com
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: myapp-v1
      weight: 90
    - destination:
        host: myapp-v2
      weight: 10
```

---

## Health Checks

### Liveness Probe

**Purpose:** Restart unhealthy pod

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Behavior:**
- Wait 30s before first check
- Check every 10s
- Fail if response > 5s
- Restart after 3 consecutive failures

---

### Readiness Probe

**Purpose:** Don't send traffic until pod ready

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Difference:**
- Liveness → restart pod
- Readiness → remove pod from Service load balancer

---

### Health Check Endpoint

**Implementation (Node.js/Express):**

```javascript
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check external dependencies (optional)
    // await redis.ping();
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});
```

**Rules:**
- Return 200 if healthy, 503 if unhealthy
- Check critical dependencies (database, cache)
- Don't check external APIs (makes liveness probe flaky)

---

## Auto-scaling

### Horizontal Pod Autoscaler (HPA)

Scale pods based on CPU/memory/custom metrics.

**Prerequisites:**
- Metrics Server installed (`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`)
- Resource requests defined in Deployment

**Example:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Test auto-scaling:**

```bash
# Generate load
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://myapp-service; done"

# Watch HPA
kubectl get hpa myapp-hpa --watch
```

---

### Vertical Pod Autoscaler (VPA)

Adjust resource requests/limits automatically.

**When to use:** Unpredictable resource usage

**Setup:**

```bash
# Install VPA
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh
```

**Apply VPA:**

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Auto"
```

---

## Zero-Downtime Deployment

### Checklist

- [ ] `strategy: RollingUpdate` configured
- [ ] `maxUnavailable: 1` set
- [ ] Readiness probe configured
- [ ] Health check endpoint returns 200 when ready
- [ ] Database migrations run before deployment (not during)
- [ ] Feature flags used for breaking API changes

---

### Pre-Deployment Checklist

```bash
# 1. Run database migrations
kubectl exec -it myapp-pod -- npm run migrate

# 2. Verify staging deployment
kubectl rollout status deployment/myapp -n myapp-staging

# 3. Check health endpoint
curl https://staging.myapp.com/health

# 4. Deploy to production
kubectl apply -f k8s/

# 5. Watch rollout
kubectl rollout status deployment/myapp -n myapp-production

# 6. Verify pods running
kubectl get pods -n myapp-production

# 7. Check logs
kubectl logs -f deployment/myapp -n myapp-production
```

---

## Monitoring & Logging

### Prometheus + Grafana

**Install Prometheus Operator:**

```bash
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
```

**ServiceMonitor:**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp
  namespace: myapp-production
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
    interval: 30s
```

---

### Logging (Fluent Bit + Elasticsearch)

**Install Fluent Bit:**

```bash
helm repo add fluent https://fluent.github.io/helm-charts
helm install fluent-bit fluent/fluent-bit
```

**View logs:**

```bash
# Real-time logs
kubectl logs -f deployment/myapp -n myapp-production

# Last 100 lines
kubectl logs --tail=100 deployment/myapp -n myapp-production

# Filter by pod
kubectl logs myapp-abc123-xyz -n myapp-production
```

---

## Cost Optimization

### 1. Right-size Resources

**Before:**

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1000m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

**After (optimized):**

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Savings:** 75% reduction in resource allocation

---

### 2. Use Spot Instances (AWS) / Preemptible VMs (GCP)

**AWS EKS:**

```yaml
# NodeGroup with Spot instances
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: myapp-cluster
nodeGroups:
- name: spot-workers
  instancesDistribution:
    instanceTypes:
    - t3.medium
    - t3a.medium
    onDemandBaseCapacity: 0
    onDemandPercentageAboveBaseCapacity: 0
    spotInstancePools: 2
```

**Savings:** 60-70% vs on-demand

---

### 3. Cluster Autoscaler

Scale nodes based on pod demand.

```bash
# Install Cluster Autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

---

## Security Best Practices

### 1. Use Non-Root User

```dockerfile
# Dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

---

### 2. Least-Privilege ServiceAccount & Token Isolation

Never run production pods using the namespace's default ServiceAccount with automounted tokens. Compromised application pods can use the mounted token to query the Kubernetes API.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp-sa
  namespace: myapp-production
automountServiceAccountToken: false  # Do NOT mount K8s API credentials into app container
```

---

### 3. Container Image Vulnerability Scanning (CI/CD)

Scan images with Trivy before pushing or deploying:

```bash
# Scan container image for HIGH and CRITICAL vulnerabilities
trivy image --severity HIGH,CRITICAL --exit-code 1 ghcr.io/username/myapp:v1.0
```

---

### 4. Network Policies

Restrict pod-to-pod traffic.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: myapp-netpol
  namespace: myapp-production
spec:
  podSelector:
    matchLabels:
      app: myapp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
```

---

### 3. Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp-production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

---

### 4. Secret Management

**Option 1: External Secrets Operator**

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: myapp-secrets
  data:
  - secretKey: database-url
    remoteRef:
      key: myapp/production/database-url
```

---

## Rollback Procedure

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/myapp -n myapp-production

# Rollback to previous revision
kubectl rollout undo deployment/myapp -n myapp-production

# Rollback to specific revision
kubectl rollout undo deployment/myapp --to-revision=2 -n myapp-production

# Watch rollback
kubectl rollout status deployment/myapp -n myapp-production
```

---

### Rollback Timeline

| Priority | Time Limit | Action |
|----------|------------|--------|
| P0 (critical) | 5 minutes | Immediate rollback |
| P1 (high) | 15 minutes | Investigate → rollback if no quick fix |
| P2 (medium) | 1 hour | Fix forward OR rollback |
| P3 (low) | Next deploy | Fix forward |

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n myapp-production

# Describe pod
kubectl describe pod myapp-abc123-xyz -n myapp-production

# Check logs
kubectl logs myapp-abc123-xyz -n myapp-production

# Common issues:
# - ImagePullBackOff: image not found or auth issue
# - CrashLoopBackOff: application crashes on startup
# - Pending: insufficient resources
```

---

### Service Not Reachable

```bash
# Check service endpoints
kubectl get endpoints myapp-service -n myapp-production

# If no endpoints:
# - Check pod labels match Service selector
# - Check readiness probe passing

# Test service from another pod
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://myapp-service
```

---

### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n myapp-production

# Increase memory limits
kubectl set resources deployment myapp --limits=memory=1Gi -n myapp-production
```

---

## Reference

- **Official K8s Docs:** https://kubernetes.io/docs/
- **Best Practices:** https://kubernetes.io/docs/concepts/configuration/overview/
- **Security:** https://kubernetes.io/docs/concepts/security/pod-security-standards/

---

**Related Guides:**
- `DEVOPS_DEPLOYMENT_GUIDE.md` — Overview of deployment strategies
- `ROLLBACK_DEPLOYMENT_GUIDE.md` — Rollback procedures
- `OBSERVABILITY_GUIDE.md` — Monitoring and alerting
- `SECURITY_HARDENING_GUIDE.md` — Security checklist
