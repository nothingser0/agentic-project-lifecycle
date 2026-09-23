# Infrastructure as Code (IaC) Guide

**Purpose:** Manage infrastructure (servers, databases, networks) as version-controlled code, not manual clicks in AWS Console.

**When to use:** Medium+ projects with cloud deployment (AWS/GCP/Azure), Kubernetes clusters, or multi-environment setups (dev/staging/prod).

---

## Why IaC?

| Without IaC | With IaC |
|-------------|----------|
| Manual setup via console | `terraform apply` |
| "Works on my machine" config drift | Identical dev/staging/prod |
| No audit trail | Git history shows who changed what |
| Disaster recovery = panic + screenshots | `terraform apply` in new region |
| Can't replicate staging to debug | Spin up identical copy in 5 min |

---

## IaC Tool Selection

| Tool | Best For | Language | Provider Support |
|------|----------|----------|------------------|
| **Terraform** | Multi-cloud, mature ecosystem | HCL (HashiCorp Config Language) | AWS, GCP, Azure, 3000+ |
| **Pulumi** | TypeScript/Python developers | TypeScript, Python, Go, C# | AWS, GCP, Azure, Kubernetes |
| **AWS CDK** | AWS-only, TypeScript projects | TypeScript, Python, Java, C# | AWS only |
| **CloudFormation** | AWS-only, native integration | YAML/JSON | AWS only |
| **Bicep** | Azure-only | Bicep DSL | Azure only |
| **Ansible** | Configuration management (not provisioning) | YAML | Agentless SSH |

**Recommendation:**

- **Terraform** if: Multi-cloud, need mature modules, team already knows HCL
- **Pulumi** if: TypeScript project, want type-safety, prefer real code over DSL
- **AWS CDK** if: AWS-only, want CloudFormation benefits with TypeScript

---

## Terraform Basics

### Setup

**Install:**

```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /path/to/bin/

# Verify
terraform version
```

**Initialize project:**

```bash
mkdir infra
cd infra
terraform init
```

### Example: AWS VPC + EC2

**File structure:**

```
infra/
├── main.tf           # Resources
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── terraform.tfvars  # Variable values (gitignored if contains secrets)
└── .gitignore
```

**main.tf:**

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# Security Group
resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public.id
  
  vpc_security_group_ids = [aws_security_group.app.id]
  
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              EOF
  
  tags = {
    Name = "${var.project_name}-app"
  }
}
```

**variables.tf:**

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH"
  type        = string
  default     = "0.0.0.0/0" # CHANGE THIS in production
}
```

**outputs.tf:**

```hcl
output "instance_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.app.public_ip
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
```

**terraform.tfvars:**

```hcl
project_name      = "my-app"
aws_region        = "us-east-1"
ami_id            = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS
instance_type     = "t3.micro"
allowed_ssh_cidr  = "203.0.113.0/24" # Your office IP
```

**.gitignore:**

```
# Terraform state files (contain secrets)
*.tfstate
*.tfstate.*

# Variable files with secrets
terraform.tfvars
*.auto.tfvars

# Crash logs
crash.log

# Lock file (commit this)
# .terraform.lock.hcl

# Module cache
.terraform/
```

### Workflow

**1. Plan (preview changes):**

```bash
terraform plan

# Output:
# Terraform will perform the following actions:
#   + aws_vpc.main will be created
#   + aws_subnet.public will be created
#   + aws_security_group.app will be created
#   + aws_instance.app will be created
# Plan: 4 to add, 0 to change, 0 to destroy.
```

**2. Apply (execute):**

```bash
terraform apply

# Review plan, type "yes" to confirm
# Or auto-approve (CI/CD only):
terraform apply -auto-approve
```

**3. Outputs:**

```bash
terraform output
# instance_public_ip = "54.123.45.67"
# vpc_id = "vpc-0a1b2c3d4e5f6g7h8"

# Use in scripts:
IP=$(terraform output -raw instance_public_ip)
ssh ubuntu@$IP
```

**4. Destroy (tear down):**

```bash
terraform destroy

# Review plan, type "yes" to confirm
```

---

## State Management (CRITICAL)

### Remote State (S3 + DynamoDB)

**Why remote state?**

- Local `.tfstate` file contains secrets (DB passwords, API keys)
- Team collaboration needs shared state
- State locking prevents concurrent applies

**Setup (AWS):**

```bash
# Create S3 bucket for state
aws s3 mb s3://my-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket my-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

**Configure backend (main.tf):**

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

**Initialize:**

```bash
terraform init -migrate-state
# Migrates local state to S3
```

---

## Multi-Environment Setup

### Option 1: Workspaces

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select dev

# Apply (uses workspace-specific state)
terraform apply
```

**Reference workspace in code:**

```hcl
resource "aws_instance" "app" {
  instance_type = terraform.workspace == "prod" ? "t3.large" : "t3.micro"
  
  tags = {
    Name = "${var.project_name}-${terraform.workspace}"
  }
}
```

### Option 2: Separate Directories (Recommended)

```
infra/
├── modules/
│   ├── vpc/
│   ├── ec2/
│   └── rds/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       └── terraform.tfvars
```

**environments/dev/main.tf:**

```hcl
module "vpc" {
  source = "../../modules/vpc"
  
  cidr_block   = "10.0.0.0/16"
  project_name = "my-app"
  environment  = "dev"
}

module "ec2" {
  source = "../../modules/ec2"
  
  vpc_id        = module.vpc.vpc_id
  subnet_id     = module.vpc.public_subnet_id
  instance_type = "t3.micro"
}
```

**Deploy:**

```bash
cd environments/dev
terraform init
terraform apply

cd ../prod
terraform init
terraform apply
```

---

## Pulumi Example (TypeScript)

### Setup

```bash
npm install -g pulumi
pulumi login # Or: pulumi login --local for file-based state

mkdir infra-pulumi
cd infra-pulumi
pulumi new aws-typescript
```

### Code (index.ts)

```typescript
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

// VPC
const vpc = new aws.ec2.Vpc('my-vpc', {
  cidrBlock: '10.0.0.0/16',
  enableDnsHostnames: true,
  tags: { Name: 'my-app-vpc' },
});

// Subnet
const subnet = new aws.ec2.Subnet('public-subnet', {
  vpcId: vpc.id,
  cidrBlock: '10.0.1.0/24',
  mapPublicIpOnLaunch: true,
  availabilityZone: 'us-east-1a',
});

// Security Group
const securityGroup = new aws.ec2.SecurityGroup('app-sg', {
  vpcId: vpc.id,
  ingress: [
    { protocol: 'tcp', fromPort: 22, toPort: 22, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ['0.0.0.0/0'] },
  ],
  egress: [
    { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
  ],
});

// EC2 Instance
const instance = new aws.ec2.Instance('app-instance', {
  ami: 'ami-0c55b159cbfafe1f0', // Ubuntu 22.04
  instanceType: 't3.micro',
  subnetId: subnet.id,
  vpcSecurityGroupIds: [securityGroup.id],
  userData: `#!/bin/bash
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
  `,
  tags: { Name: 'my-app' },
});

// Exports
export const publicIp = instance.publicIp;
export const vpcId = vpc.id;
```

### Workflow

```bash
# Preview
pulumi preview

# Deploy
pulumi up

# Outputs
pulumi stack output publicIp

# Destroy
pulumi destroy
```

---

## Security Best Practices

### 1. Never Commit Secrets

**Bad:**

```hcl
resource "aws_db_instance" "main" {
  password = "supersecret123" # ❌ NEVER
}
```

**Good:**

```hcl
variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_db_instance" "main" {
  password = var.db_password
}
```

**Pass via environment variable:**

```bash
export TF_VAR_db_password="supersecret123"
terraform apply
```

### 2. Encrypt State Files

**S3 backend:**

```hcl
terraform {
  backend "s3" {
    bucket  = "my-terraform-state"
    encrypt = true # ✅ Server-side encryption
  }
}
```

### 3. Restrict State Access

**S3 bucket policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789:role/TerraformRole"
      },
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-terraform-state",
        "arn:aws:s3:::my-terraform-state/*"
      ]
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::my-terraform-state/*",
      "Condition": {
        "Bool": { "aws:SecureTransport": "false" }
      }
    }
  ]
}
```

### 4. Scan IaC for Security Issues

**Tools:**

```bash
# Checkov (supports Terraform, CloudFormation, Kubernetes)
pip install checkov
checkov -d infra/

# tfsec (Terraform-specific)
brew install tfsec
tfsec infra/

# Terrascan
brew install terrascan
terrascan scan -t terraform
```

**Example output:**

```
Check: CKV_AWS_23: "Ensure every security group rule has a description"
FAILED for resource: aws_security_group.app
File: /main.tf:25-35

Fix: Add 'description' field to ingress/egress rules
```

---

## CI/CD Integration

### GitHub Actions (Terraform)

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
      - 'infra/**'
  push:
    branches:
      - main
    paths:
      - 'infra/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.0
      
      - name: Terraform Format
        run: terraform fmt -check
      
      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        if: github.event_name == 'pull_request'
        run: terraform plan -no-color
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## Common Patterns

### Pattern 1: Reusable Modules

**modules/rds/main.tf:**

```hcl
variable "db_name" { type = string }
variable "db_username" { type = string }
variable "db_password" { type = string; sensitive = true }
variable "vpc_id" { type = string }

resource "aws_db_subnet_group" "main" {
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "main" {
  identifier = var.db_name
  engine     = "postgres"
  instance_class = "db.t3.micro"
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true
}

output "endpoint" {
  value = aws_db_instance.main.endpoint
}
```

**Use module:**

```hcl
module "database" {
  source = "./modules/rds"
  
  db_name     = "myapp"
  db_username = "admin"
  db_password = var.db_password
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

output "db_endpoint" {
  value = module.database.endpoint
}
```

### Pattern 2: Data Sources (Reference Existing Resources)

```hcl
# Reference existing VPC (not managed by Terraform)
data "aws_vpc" "existing" {
  tags = {
    Name = "legacy-vpc"
  }
}

# Use it
resource "aws_subnet" "new" {
  vpc_id = data.aws_vpc.existing.id
  cidr_block = "10.0.10.0/24"
}
```

### Pattern 3: Count for Multiple Resources

```hcl
variable "availability_zones" {
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "private-${var.availability_zones[count.index]}"
  }
}

# Reference: aws_subnet.private[0].id
```

---

## Data Residency & Multi-Region Compliance

**Applies to:** Large+ projects operating in multiple regions, or any tier where `docs/security/COMPLIANCE.md` names GDPR, HIPAA, PCI-DSS, or a similar regime with data-locality requirements.

**Direct link to the classifier — check this first, don't re-derive it independently:**
`modules/00-classifier.md`'s regulated-data follow-up and `tier_basis`/`tier_dispute`
fields in `CONTEXT.md` already establish, at project-classification time, whether this
project handles regulated data and whether a named compliance obligation applies (the
`compliance_override` case forces at least Enterprise tier). Before making any regional
provisioning decision, read `CONTEXT.md`'s `tier_basis` field: if it is
`compliance_override` or `product_criteria` with a regulated-data "yes," this Data
Residency section is **not optional background reading** — it is a required input to
every data-storage resource's Terraform/Pulumi declaration below, and the specific
regulation named at classification time (HIPAA/GDPR/PCI-DSS/etc.) determines which
residency rule applies. Do not let infrastructure provisioning proceed as an
independent DevOps judgment call disconnected from the compliance fact already
recorded by the classifier — a project correctly classified as Enterprise for HIPAA
reasons must not end up with infrastructure provisioned in a region that violates
data-residency requirements simply because the two decisions were made by different
people (or different sessions) without cross-referencing `CONTEXT.md`.

IaC makes region placement a config value, which means it is easy to get right — and easy to silently get wrong when a module's default region doesn't match where a given class of data is legally required to live. Don't treat `region = "us-east-1"` as a placeholder to fill in once; treat it as a compliance-relevant variable per resource.

**Rules:**

1. **Pin data-storage resources to their required region explicitly**, not inherited from a provider-level default. If GDPR applies, EU personal data's primary datastore (database, object storage, backups) must be declared in an EU region in the Terraform/Pulumi source itself — not assumed from wherever the rest of the stack happens to run.

```hcl
# Bad: inherits whatever region the provider block defaults to
resource "aws_db_instance" "users" {
  # region implicit from provider {}
}

# Good: region is explicit at the resource declaring where regulated data lives
provider "aws" {
  alias  = "eu"
  region = "eu-central-1"  # GDPR: EU personal data stays in EU
}

resource "aws_db_instance" "users" {
  provider = aws.eu
  # ...
}
```

2. **Cross-region replication and backups must be reviewed against the same requirement** — a backup job that silently replicates an EU database to a US region for disaster-recovery purposes can violate the same regulation the primary-region placement was trying to satisfy. State this explicitly in the ADR or `docs/security/COMPLIANCE.md`, don't leave it implicit in a backup script.

3. **Record the decision as an ADR** (`templates/specs/ADR_TEMPLATE.md`) when a region is chosen for compliance reasons, not just cost/latency — future infrastructure changes need to know *why* a region can't be swapped for a cheaper one.

4. **Add a Checkov/tfsec custom policy** (see Security Best Practices §4 above) that flags any datastore resource without an explicit, compliance-reviewed region, rather than relying on manual review to catch a default-region drift during a later refactor.

**This is deliberately conservative:** the guide does not attempt to give per-regulation legal rules (GDPR's exact adequacy-decision list, HIPAA's specific hosting requirements, etc.) — that determination belongs to the human compliance/legal reviewer required at Gate C per `engine/GATE-REGISTRY.md` Rule 6. This section only ensures the infrastructure code makes region placement an explicit, auditable decision instead of an inherited default, so that reviewer has something concrete to check.

---

## Integration with Project Lifecycle

**Update `modules/02b-planning-stack-setup.md` Phase 6:**

```markdown
### Q63a — Infrastructure Provisioning

> "Will infrastructure be provisioned manually or via IaC?"

Options:
- **IaC (Terraform/Pulumi/CDK)** — Recommended for Medium+
- **Manual (AWS Console)** — Only for Small tier or throwaway experiments
- **Existing infrastructure** — Brownfield, skip provisioning

If IaC:
- Q63a-i: Which tool? (Terraform / Pulumi / AWS CDK / CloudFormation)
- Q63a-ii: Remote state backend configured? (S3+DynamoDB / Pulumi Cloud / Terraform Cloud)
- Q63a-iii: Multi-environment strategy? (Workspaces / Separate directories)

**Output file:** `infra/README.md` with setup instructions, `infra/main.tf` or `infra/index.ts`
```

**Update `engine/GATE-REGISTRY.md`:**

```markdown
### gate:production-deploy

**Evidence:**
- UAT passed
- Security checklist passed
- **IaC validated (terraform validate / pulumi preview)** ← NEW
- **IaC security scan passed (checkov / tfsec)** ← NEW
- Infrastructure changes reviewed by senior engineer
- Rollback plan includes infrastructure rollback steps

**Blocker:** Cannot deploy infrastructure changes without:
- Remote state configured (no local .tfstate in production)
- State lock enabled (DynamoDB for Terraform, Pulumi Cloud for Pulumi)
- Secrets not hardcoded in IaC files
```

---

**Agent instruction:**

For Medium+ projects deploying to cloud (AWS/GCP/Azure):

1. Choose IaC tool (Terraform default, Pulumi if TypeScript project)
2. Set up remote state backend (S3+DynamoDB for Terraform)
3. Create multi-environment structure (dev/staging/prod separate dirs)
4. Write modules for reusable components (VPC, RDS, EC2)
5. Run security scan (checkov/tfsec) before apply
6. Document workflow in `infra/README.md`
7. Integrate IaC apply into CI/CD (plan on PR, apply on merge to main)

Do not manually create infrastructure in AWS Console for production — everything must be in code.
