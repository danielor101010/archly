import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const IaC = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Infrastructure as Code</h1>
      <p className="text-zinc-400 leading-relaxed">
        Infrastructure as Code (IaC) means defining your infrastructure — servers, networks, databases, IAM roles — in version-controlled files instead of clicking through a console. It transforms infrastructure from a fragile manual process into a repeatable, reviewable, and auditable software engineering practice.
      </p>
    </div>

    <Section title="Why IaC Exists — The Problem It Solves">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Before IaC, infrastructure was managed by logging into servers and making changes. This created several catastrophic failure modes:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Config drift:</strong> Production and staging diverge over time as people make one-off changes. "Works on staging, broken in prod" becomes the norm.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Snowflake servers:</strong> Unique, hand-crafted servers that nobody can reproduce. If it dies, you can't bring it back. "Don't restart the database server — nobody knows what's on it."</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">No audit trail:</strong> Who changed the security group at 2am last Tuesday? Nobody knows. No git blame for infra.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Slow provisioning:</strong> Standing up a new environment takes days of clicking. With IaC it takes minutes.</span></li>
      </ul>
      <Callout type="insight">
        The mental model shift with IaC: treat infrastructure like application code. It lives in git, goes through PR review, has CI/CD pipelines, and gets tested. The console becomes a read-only view, never a place to make changes.
      </Callout>
    </Section>

    <Section title="Terraform Core Concepts">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Terraform is the dominant open-source IaC tool, supporting AWS, GCP, Azure, and 1,000+ providers via a plugin system. It uses HashiCorp Configuration Language (HCL).
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Providers:</strong> Plugins that interface with cloud APIs. <code className="text-zinc-300">aws</code>, <code className="text-zinc-300">google</code>, <code className="text-zinc-300">azurerm</code>, <code className="text-zinc-300">kubernetes</code>. Each has its own resource types and data sources.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Resources:</strong> Declarative infrastructure units. <code className="text-zinc-300">aws_instance</code>, <code className="text-zinc-300">aws_s3_bucket</code>, <code className="text-zinc-300">aws_security_group</code>. You declare desired state; Terraform figures out the API calls.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">State file:</strong> Terraform tracks what it created in a <code className="text-zinc-300">terraform.tfstate</code> file. This is the source of truth for what exists. Critical: if state is lost or corrupted, Terraform loses track of your real infrastructure.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Plan/Apply/Destroy:</strong> The core workflow. <code className="text-zinc-300">plan</code> shows what will change (diff against state), <code className="text-zinc-300">apply</code> executes it, <code className="text-zinc-300">destroy</code> tears everything down.</span></li>
      </ul>
      <CodeBlock>{`# Example: S3 bucket with versioning
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "data" {
  bucket = "my-company-data-\${var.environment}"
  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Terraform plan output:
# + aws_s3_bucket.data will be created
# + aws_s3_bucket_versioning.data will be created
# Plan: 2 to add, 0 to change, 0 to destroy.`}</CodeBlock>
    </Section>

    <Section title="Terraform vs CloudFormation vs CDK">
      <TradeoffTable rows={[
        { name: 'Terraform', pro: 'Multi-cloud, huge module registry, mature ecosystem, readable HCL', con: 'State management complexity, not AWS-native', use: 'Multi-cloud orgs, teams comfortable with HCL' },
        { name: 'CloudFormation', pro: 'AWS-native, tight IAM integration, no state management needed', con: 'AWS-only, verbose YAML/JSON, slower deploys', use: 'AWS-only shops, when native integration matters (StackSets, Drift detection)' },
        { name: 'AWS CDK', pro: 'Real programming language (TypeScript/Python), type safety, loops/conditionals', con: 'Compiles to CloudFormation (inherits its limitations), learning curve', use: 'Developer-centric orgs, complex dynamic infra' },
        { name: 'Pulumi', pro: 'Real languages like CDK, multi-cloud, no separate state server', con: 'Smaller community than Terraform', use: 'Developer-first teams who want TypeScript for infra' },
      ]} />
    </Section>

    <Section title="State Management — The Critical Part">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        By default, Terraform writes state locally. This breaks for teams. Remote state backends solve this:
      </p>
      <CodeBlock>{`# Remote state in S3 + DynamoDB (AWS standard pattern)
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/vpc/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"  # State locking
    encrypt        = true
  }
}

# DynamoDB table provides mutex locking:
# - Only one terraform apply runs at a time
# - Prevents concurrent state corruption
# - Lock attribute: LockID (primary key)`}</CodeBlock>
      <ul className="space-y-2 text-zinc-400 text-sm mt-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">State locking:</strong> Without locking, two engineers running <code className="text-zinc-300">terraform apply</code> simultaneously corrupt the state file. DynamoDB provides a distributed lock — second apply waits or fails.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">State isolation:</strong> Use separate state files per environment (prod, staging, dev) and per component (vpc, databases, app). Avoids a mistake in one component affecting another.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Never edit state manually:</strong> Use <code className="text-zinc-300">terraform state mv</code>, <code className="text-zinc-300">terraform import</code>, <code className="text-zinc-300">terraform state rm</code> for surgery. Editing the JSON directly almost always makes things worse.</span></li>
      </ul>
      <Callout type="failure">
        Deleting or corrupting the state file doesn't delete your infrastructure — it just means Terraform no longer knows it exists. Your next <code>terraform apply</code> will try to recreate everything, often failing with "resource already exists" errors. Recovery is painful: use <code>terraform import</code> to re-associate state with existing resources one by one.
      </Callout>
    </Section>

    <Section title="Drift Detection and Idempotency">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        <strong className="text-white">Drift</strong> is when real infrastructure diverges from your IaC definition — usually because someone made a manual change in the console.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Terraform:</strong> <code className="text-zinc-300">terraform plan</code> implicitly detects drift (refreshes state against real infra). Use <code className="text-zinc-300">-refresh-only</code> flag to detect without applying.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">CloudFormation:</strong> Built-in Drift Detection feature. Compares template against live stack resources. Shows changed properties.</span></li>
        <li className="flex gap-2"><span className="text-green-400">✓</span><span><strong className="text-white">Prevention:</strong> Service Control Policies (SCPs) in AWS Organisations can deny console changes in prod. Only allow infra changes via CI/CD pipelines that run Terraform.</span></li>
      </ul>
      <p className="text-zinc-400 text-sm leading-relaxed">
        <strong className="text-white">Idempotency</strong>: Running the same Terraform code twice should produce the same result. Terraform's declarative model guarantees this — it will create, update, or do nothing depending on current state. Write your own provisioners and scripts to also be idempotent (<code className="text-zinc-300">creates</code> argument in local-exec provisioners).
      </p>
    </Section>

    <Section title="Module Patterns and Tagging Strategy">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        <strong className="text-white">Modules</strong> are reusable packages of Terraform resources. Like functions in programming:
      </p>
      <CodeBlock>{`# Module usage: reusable VPC module
module "prod_vpc" {
  source      = "./modules/vpc"
  environment = "prod"
  cidr_block  = "10.0.0.0/16"
  az_count    = 3
}

module "staging_vpc" {
  source      = "./modules/vpc"
  environment = "staging"
  cidr_block  = "10.1.0.0/16"
  az_count    = 2
}

# Tagging strategy — enforce via locals:
locals {
  common_tags = {
    Environment = var.environment
    Team        = var.team
    CostCenter  = var.cost_center
    ManagedBy   = "terraform"
    Repository  = "github.com/myorg/infrastructure"
  }
}

resource "aws_instance" "app" {
  # ...
  tags = merge(local.common_tags, { Name = "app-server" })
}`}</CodeBlock>
      <Callout type="insight">
        Enforce tagging from day one. Tags are how you: (1) allocate cloud costs per team/project, (2) find all resources belonging to a service, (3) automate cleanup of dev environments. Retrofitting tags to 500 resources is a painful multi-week project.
      </Callout>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "What happens if two engineers run terraform apply at the same time?", a: "With local state: state file corruption — both writes race, you end up with inconsistent state. With remote state (S3 + DynamoDB): the second apply fails with a state lock error and must wait for the first to complete. Always use remote state with locking in teams." },
          { q: "An engineer made a manual change to a security group in the AWS console. How do you detect and remediate this?", a: "terraform plan will show the drift (it refreshes state against live infra). It will show the proposed change to revert to the IaC-defined state. Running terraform apply will bring it back into compliance. Prevent recurrence with SCPs that deny console changes in production." },
          { q: "How do you promote infrastructure changes from dev → staging → prod safely?", a: "Separate state backends per environment. CI/CD pipeline: PR → terraform plan on staging (reviewed as PR comment) → merge triggers apply on staging → manual approval gate → apply on prod. Never run terraform apply locally in production." },
        ].map(({ q, a }) => (
          <div key={q} className="bg-card border border-white/8 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-2">{q}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </Section>
  </div>
)
