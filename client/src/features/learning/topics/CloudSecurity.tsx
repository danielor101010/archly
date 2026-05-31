import { Section, Callout, CodeBlock, TradeoffTable } from './components'

export const CloudSecurity = () => (
  <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-3">Cloud Security & IAM</h1>
      <p className="text-zinc-400 leading-relaxed">
        Cloud security is not a feature you bolt on — it's an architectural discipline you build in from the start. The most devastating breaches in cloud history weren't AWS failures: they were misconfigured S3 buckets, over-permissive IAM roles, and hardcoded credentials committed to GitHub. This topic teaches you to think like both a builder and an attacker.
      </p>
    </div>

    <Section title="Zero Trust Architecture">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Traditional security assumed a perimeter: "inside the network = trusted, outside = untrusted." Zero trust discards that model entirely.
      </p>
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
        <strong className="text-white">Zero trust principle:</strong> Never trust, always verify. Every request must be authenticated and authorized regardless of network origin. An EC2 instance in your VPC is not trusted by default — it needs an IAM role to call AWS APIs.
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Identity-based access:</strong> Access decisions based on who you are (IAM role, user identity), not where you are (IP address, VPC).</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Least privilege:</strong> Every identity gets only the minimum permissions to do its job. A Lambda that reads from one S3 bucket should not have <code className="text-zinc-300">s3:*</code> permissions.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Assume breach:</strong> Design systems assuming an attacker is already inside. Use separate IAM roles per service so compromising one service doesn't grant access to everything.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">mTLS:</strong> Mutual TLS authenticates both client and server. Each service has a certificate. Used in service meshes (Istio, AWS App Mesh) to enforce zero-trust between microservices.</span></li>
      </ul>
    </Section>

    <Section title="IAM — Identity and Access Management">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        IAM is the security control plane for AWS. Every API call in AWS is authenticated (who is calling) and authorized (are they allowed to) via IAM.
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Users:</strong> Human identities with long-term credentials (passwords + access keys). Should use MFA. Avoid creating users for applications — use roles.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Roles:</strong> Assumed temporarily by services, EC2 instances, Lambda functions, or users from other accounts. Credentials are short-lived (1 hour default, max 12 hours). The correct identity type for applications.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Policies:</strong> JSON documents that define permissions. Attached to users, groups, or roles. Specify: Effect (Allow/Deny), Action (s3:GetObject), Resource (arn:aws:s3:::my-bucket/*).</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Service roles:</strong> IAM roles assumed by AWS services on your behalf. Your Lambda function's execution role determines what AWS APIs it can call. Your EC2 instance profile controls what the code running on it can access.</span></li>
      </ul>
      <CodeBlock>{`# Least-privilege Lambda execution role example:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-specific-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
# NOT: "Action": "s3:*", "Resource": "*"  ← Never do this`}</CodeBlock>
      <Callout type="insight">
        IAM policy evaluation order: Explicit Deny beats everything. Then: identity-based policies + resource-based policies. If no Allow matches, implicit deny. Cross-account: both the calling account's identity policy AND the target account's resource policy must allow the action.
      </Callout>
    </Section>

    <Section title="Cross-Account Access">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Large organizations use separate AWS accounts per environment (prod, staging, dev) or per business unit. Cross-account access is done via role assumption:
      </p>
      <CodeBlock>{`# Scenario: dev account needs to read from prod S3 bucket
# Step 1: prod account creates a role with trust policy:
{
  "Principal": { "AWS": "arn:aws:iam::DEV_ACCOUNT_ID:role/cicd-role" },
  "Action": "sts:AssumeRole"
}

# Step 2: dev account's role assumes the prod role:
aws sts assume-role \
  --role-arn arn:aws:iam::PROD_ACCOUNT_ID:role/readonly-role \
  --role-session-name "deploy-session"
# Returns temporary credentials valid for 1 hour`}</CodeBlock>
    </Section>

    <Section title="Secrets Management">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Hardcoded secrets are the #1 cause of credential leaks. The attack is simple: attacker finds your GitHub repo, runs <code className="text-zinc-300">grep -r "AWS_SECRET"</code>, finds access keys committed years ago, and your account is owned.
      </p>
      <TradeoffTable rows={[
        { name: 'AWS Secrets Manager', pro: 'Automatic rotation, audit trail, fine-grained IAM, cross-account', con: '$0.40/secret/month + $0.05/10k API calls', use: 'Database passwords, API keys, OAuth tokens — anything requiring rotation' },
        { name: 'SSM Parameter Store', pro: 'Free (Standard tier), simple key-value, good for config', con: 'No automatic rotation built-in, 10 TPS limit (Standard)', use: 'App config values, non-sensitive parameters, feature flags' },
        { name: 'IAM Roles (best)', pro: 'Zero credentials to manage — automatic short-lived tokens', con: 'Only works within AWS ecosystem', use: 'EC2, Lambda, ECS accessing AWS services — always prefer over any static credential' },
      ]} />
      <Callout type="failure">
        Never store secrets in: environment variables baked into Docker images, application code, <code>appsettings.json</code> committed to git, CloudFormation templates in plaintext, or EC2 user data scripts. All of these are either versioned forever or visible to anyone with describe permissions. The correct pattern: retrieve secrets at runtime from Secrets Manager or SSM Parameter Store.
      </Callout>
    </Section>

    <Section title="Encryption At Rest and In Transit">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Encryption protects data from unauthorized access — both while stored and while moving across networks.
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm mb-4">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">KMS (Key Management Service):</strong> AWS-managed encryption keys. S3, EBS, RDS, DynamoDB all integrate with KMS. Two types: AWS-managed keys (free, less control) and customer-managed keys (CMK, $1/month, full control over key policy and rotation).</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">EBS encryption:</strong> Encrypt at volume creation. Minimal performance overhead (hardware AES). Snapshots inherit encryption. Enable default encryption in your account — it costs nothing and protects against physical disk theft.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">TLS in transit:</strong> All data moving over the internet and between services should use TLS 1.2+. ACM (AWS Certificate Manager) provides free, auto-renewing TLS certificates for your ALBs and CloudFront distributions.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Certificate management:</strong> Never manage TLS certificates manually. ACM auto-renews before expiry. Expiring certificates are a leading cause of production outages — set ACM and forget.</span></li>
      </ul>
    </Section>

    <Section title="VPC Security Patterns">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Network-level security is defence-in-depth — even if an IAM policy is misconfigured, a private subnet provides a second layer.
      </p>
      <ul className="space-y-3 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Private subnets:</strong> Databases and internal services belong in private subnets with no internet route. Security groups further restrict which services can connect.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">Bastion hosts (legacy):</strong> A single EC2 instance in a public subnet that you SSH into, then SSH from there to private instances. A chokepoint for auditing. Problem: it's a SPOF and requires you to manage SSH keys.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">SSM Session Manager (modern):</strong> Access private EC2 instances without SSH, without public IPs, without open port 22. Sessions are proxied through AWS Systems Manager. Fully audited in CloudTrail. No key management. This is the AWS-recommended approach.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">VPC Flow Logs:</strong> Capture metadata about all IP traffic in your VPC. Store in S3 or CloudWatch. Essential for security investigations: "what talked to this IP at 3am?"</span></li>
      </ul>
      <Callout type="insight">
        "How would you access a private EC2 instance securely?" is a common interview question. The modern answer is SSM Session Manager — no bastion, no open SSH port, no key management, full audit trail. Mention this and you'll stand out from candidates who only know bastion hosts.
      </Callout>
    </Section>

    <Section title="Compliance Basics">
      <p className="text-zinc-400 text-sm mb-3 leading-relaxed">
        Cloud compliance frameworks define security controls that your architecture must satisfy:
      </p>
      <ul className="space-y-2 text-zinc-400 text-sm">
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">SOC 2:</strong> American standard. Five Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy. AWS itself is SOC 2 certified. You need separate certification for your application layer.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">GDPR data residency:</strong> EU personal data must remain in the EU (or a country with adequate protection). Enforce via AWS Region restriction using SCPs: <code className="text-zinc-300">aws:RequestedRegion</code> condition to deny resources outside eu-west-1, eu-central-1, etc.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">AWS Config:</strong> Continuous compliance monitoring. Define rules (e.g. "all EBS volumes must be encrypted", "no security groups with 0.0.0.0/0 on port 22"). Alerts when real infrastructure drifts from your compliance rules.</span></li>
        <li className="flex gap-2"><span className="text-indigo-400">→</span><span><strong className="text-white">GuardDuty:</strong> ML-based threat detection. Analyses CloudTrail, VPC Flow Logs, DNS logs for anomalies. Detects: compromised credentials (API calls from unusual geography), cryptomining, port scanning, data exfiltration attempts.</span></li>
      </ul>
    </Section>

    <Section title="Interview Questions">
      <div className="space-y-3">
        {[
          { q: "A developer accidentally committed AWS access keys to a public GitHub repo. What do you do?", a: "Immediately: rotate/delete the exposed keys in IAM console (attacker bots scan GitHub in minutes). Check CloudTrail for API calls made with those keys in the last 24 hours. Revoke any sessions using those keys. Scan for any resources created by attacker. Long-term: require IAM roles for all services, enable git-secrets pre-commit hook, use GitHub secret scanning." },
          { q: "How do you implement least privilege for a microservices architecture?", a: "One IAM role per service. Each role has only the permissions that specific service needs. Use IAM condition keys to further restrict (e.g. kms:ViaService to ensure KMS is only called through a specific service, not directly). Use AWS Organizations SCPs to enforce guardrails at the account level. Audit permissions quarterly with IAM Access Analyzer." },
          { q: "How would you design a system where EU user data never leaves the EU?", a: "Deploy in eu-west-1 (Ireland) and/or eu-central-1 (Frankfurt). Use SCP to deny creating resources in non-EU regions. Use DynamoDB Global Tables configured to EU regions only. Ensure backups (S3, RDS snapshots) replicate only within EU. Log with CloudTrail to EU bucket. Data classification tags on all resources containing personal data." },
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
