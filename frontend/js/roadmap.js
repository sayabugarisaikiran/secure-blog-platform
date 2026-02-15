// ============================================================
// DevOps Roadmap Data
// ============================================================

const ROADMAP_PHASES = [
    {
        id: 1,
        title: 'Application Code + Docker',
        status: 'completed',
        badge: '✅',
        description: '3-tier blog platform with Node.js backend, static frontend, PostgreSQL database, and Docker Compose orchestration.',
        tools: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Nginx'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform',
        docsUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform#-quick-start-local-development'
    },
    {
        id: 2,
        title: 'Terraform (Infrastructure as Code)',
        status: 'current',
        badge: '🏗️',
        description: 'Deploy the app to AWS with VPC, ECS Fargate, RDS Multi-AZ, ALB, ECR, and Secrets Manager using Terraform.',
        tools: ['Terraform', 'AWS VPC', 'ECS Fargate', 'RDS', 'ALB', 'ECR'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform/tree/main/terraform',
        docsUrl: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started'
    },
    {
        id: 3,
        title: 'Ansible (Configuration Management)',
        status: 'pending',
        badge: '⚙️',
        description: 'Automate configuration management with Ansible playbooks and dynamic inventory integration.',
        tools: ['Ansible', 'Dynamic Inventory', 'Playbooks'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform/tree/main/ansible',
        docsUrl: 'https://docs.ansible.com/ansible/latest/getting_started/index.html'
    },
    {
        id: 4,
        title: 'CI/CD Pipeline',
        status: 'pending',
        badge: '🔄',
        description: 'Build automated pipelines with GitHub Actions and Jenkins for testing, building, and deploying.',
        tools: ['GitHub Actions', 'Jenkins', 'Docker Build', 'ECR Push'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform/tree/main/.github/workflows',
        docsUrl: 'https://docs.github.com/en/actions'
    },
    {
        id: 5,
        title: 'AWS Security & Networking',
        status: 'pending',
        badge: '🛡️',
        description: 'Add production security with Route53, CloudFront CDN, WAF firewall, and ACM SSL certificates.',
        tools: ['Route53', 'CloudFront', 'WAF', 'ACM'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform',
        docsUrl: 'https://docs.aws.amazon.com/cloudfront/'
    },
    {
        id: 6,
        title: 'DevSecOps Integration',
        status: 'pending',
        badge: '🔐',
        description: 'Integrate security scanning tools: SonarQube (SAST), Trivy (container scan), Checkov (IaC scan), GitLeaks.',
        tools: ['SonarQube', 'Trivy', 'Checkov', 'GitLeaks', 'Snyk'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform',
        docsUrl: 'https://owasp.org/www-project-devsecops-guideline/'
    },
    {
        id: 7,
        title: 'Monitoring & Observability',
        status: 'pending',
        badge: '📊',
        description: 'Set up monitoring with Prometheus, Grafana dashboards, CloudWatch, and log aggregation.',
        tools: ['Prometheus', 'Grafana', 'CloudWatch', 'Loki'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform/tree/main/monitoring',
        docsUrl: 'https://prometheus.io/docs/introduction/overview/'
    },
    {
        id: 8,
        title: 'Advanced: Kubernetes (EKS)',
        status: 'pending',
        badge: '☸️',
        description: 'Migrate to Kubernetes with EKS, implement GitOps with ArgoCD, and package with Helm charts.',
        tools: ['EKS', 'Kubernetes', 'ArgoCD', 'Helm'],
        githubUrl: 'https://github.com/sayabugarisaikiran/secure-blog-platform/tree/main/k8s',
        docsUrl: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/'
    }
];

function renderRoadmap() {
    const container = document.getElementById('roadmapGrid');
    if (!container) return;

    const currentPhase = ROADMAP_PHASES.find(p => p.status === 'current');

    container.innerHTML = ROADMAP_PHASES.map(phase => `
    <div class="roadmap-phase ${phase.status}">
      <div class="phase-header">
        <span class="phase-badge">${phase.badge}</span>
        <h3 class="phase-title">Phase ${phase.id}: ${phase.title}</h3>
        <span class="phase-status ${phase.status}">${phase.status}</span>
      </div>
      <p class="phase-description">${phase.description}</p>
      <div class="phase-tools">
        ${phase.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
      </div>
      <div class="phase-links">
        ${phase.status === 'completed' ? `
          <a href="${phase.githubUrl}" target="_blank" class="phase-link">
            📁 View Code
          </a>
        ` : ''}
        ${phase.status === 'current' ? `
          <a href="${phase.docsUrl}" target="_blank" class="phase-link primary">
            📚 Start Learning
          </a>
          <a href="${phase.githubUrl}" target="_blank" class="phase-link">
            📁 GitHub Folder
          </a>
        ` : ''}
        ${phase.status === 'pending' ? `
          <a href="${phase.docsUrl}" target="_blank" class="phase-link">
            📚 Documentation
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');

    // Render next steps banner
    if (currentPhase) {
        const banner = document.getElementById('nextStepsBanner');
        if (banner) {
            banner.innerHTML = `
        <h3>🚀 Next Step: ${currentPhase.title}</h3>
        <p>${currentPhase.description}</p>
        <a href="${currentPhase.docsUrl}" target="_blank" class="btn btn-primary">
          Start Phase ${currentPhase.id}
        </a>
        <a href="${currentPhase.githubUrl}" target="_blank" class="btn btn-outline">
          View on GitHub
        </a>
      `;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderRoadmap);
