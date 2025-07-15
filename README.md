# ProductTree Documentation

A modern, responsive documentation website built with AstroJS for Hallcrest Engineering's product support documentation.

[![Build and Deploy](https://github.com/jkulba/ProductTree/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/jkulba/ProductTree/actions/workflows/build-and-deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/Astro-5.0+-purple.svg)](https://astro.build/)

**Last Deployed:** 2025-01-15 22:52:00 UTC

## 🚀 Features

- **Modern Tech Stack**: Built with AstroJS 5.0, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first design that works on all devices
- **Full-Text Search**: Powered by Fuse.js for fast, accurate search results
- **SEO Optimized**: Proper meta tags, structured data, and performance optimization
- **Markdown Support**: Rich markdown rendering with syntax highlighting
- **Interactive Navigation**: Collapsible sidebar with smooth animations
- **Container Ready**: OCI container with NGINX for production deployment
- **CI/CD Pipeline**: Automated building, testing, and deployment with GitHub Actions

## 📖 Documentation Structure

The documentation is organized into three main applications, each with standardized categories:

```
src/content/docs/
├── application-one/          # Modern web application
│   ├── development.md        # Development setup and guides
│   ├── automation.md         # CI/CD and automation workflows
│   └── support.md           # Support and troubleshooting
├── application-two/          # Microservices platform
│   ├── development.md        # Microservices development
│   ├── automation.md         # Container orchestration
│   └── support.md           # Distributed system support
└── application-three/        # Mobile-first application
    ├── development.md        # React Native development
    ├── automation.md         # Mobile CI/CD pipelines
    └── support.md           # Mobile app support
```

## 🛠 Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/jkulba/ProductTree.git
   cd ProductTree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:4321
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Astro and TypeScript checks |
| `npm run type-check` | Run TypeScript type checking only |

### Development Workflow

1. **Create new documentation**: Add markdown files to `src/content/docs/`
2. **Update content schema**: Modify `src/content/config.ts` if needed
3. **Customize styling**: Edit Tailwind classes in components
4. **Test changes**: Use `npm run dev` for live preview
5. **Build and verify**: Run `npm run build` and `npm run preview`

## 🏗 Architecture

### Tech Stack

- **Framework**: [AstroJS 5.0](https://astro.build/) - Modern static site generator
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) - Utility-first CSS framework
- **Typography**: [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin) - Beautiful typographic defaults
- **Search**: [Fuse.js 7.0](https://fusejs.io/) - Lightweight fuzzy-search library
- **Icons**: Heroicons via Tailwind CSS
- **Fonts**: Inter from Google Fonts

### Project Structure

```
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── Header.astro     # Site header with navigation
│   │   ├── SearchBox.astro  # Search functionality
│   │   └── Sidebar.astro    # Navigation sidebar
│   ├── content/
│   │   ├── config.ts        # Content schema definition
│   │   └── docs/            # Documentation markdown files
│   ├── layouts/
│   │   ├── BaseLayout.astro # Base HTML layout
│   │   └── DocsLayout.astro # Documentation page layout
│   └── pages/
│       ├── index.astro      # Homepage
│       ├── [...slug].astro  # Dynamic documentation pages
│       └── search-index.json.ts # Search index API
├── public/                  # Static assets
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── Containerfile           # Container image definition
├── nginx.conf              # NGINX configuration
└── package.json            # Dependencies and scripts
```

### Content Management

Documentation is managed through Astro's content collections:

- **Schema validation**: TypeScript schemas ensure content consistency
- **Frontmatter**: Metadata including title, description, tags, and dates
- **Automatic routing**: File-based routing generates URLs automatically
- **Type safety**: Full TypeScript support for content queries

## 🔍 Search Functionality

The search system uses Fuse.js for fast, client-side search:

- **Full-text search**: Searches titles, descriptions, and content
- **Fuzzy matching**: Handles typos and partial matches
- **Real-time results**: Updates as you type
- **Keyboard navigation**: Arrow keys and Enter support
- **Mobile friendly**: Touch-optimized interface

### Search Index

The search index is generated at build time and includes:
- Document titles and descriptions
- Full content text
- Application and category metadata
- Tags and last updated timestamps

## 🚀 Deployment

### Container Deployment

The application is containerized using Podman/Docker:

```bash
# Build container image
podman build -t product-docs .

# Run container
podman run -p 8080:8080 product-docs
```

### Production Environment

- **Web Server**: NGINX with optimized configuration
- **Performance**: Gzip compression, caching headers, and CDN-ready
- **Security**: Security headers, rate limiting, and non-root user
- **Health Checks**: Built-in health endpoint at `/health`
- **Monitoring**: Access and error logs for observability

### GitHub Actions CI/CD

The repository includes a complete CI/CD pipeline:

1. **Build and Test**: Install dependencies, type-check, and build
2. **Security Scanning**: npm audit and CodeQL analysis
3. **Container Build**: Multi-platform container images
4. **Container Security**: Trivy vulnerability scanning
5. **Deployment**: Automated deployment to staging and production
6. **Notifications**: Slack notifications for deployment status

## 🔧 Configuration

### Environment Variables

The application supports the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_SITE_URL` | Base URL for the site | `https://docs.hallcrest.engineering` |
| `NODE_ENV` | Environment mode | `production` |

### Astro Configuration

Key configuration options in `astro.config.mjs`:

- **Integrations**: Tailwind CSS, MDX, and Sitemap
- **Markdown**: Syntax highlighting with GitHub Dark theme
- **Build**: Static output with directory-based URLs
- **Site**: Base URL for canonical links and sitemap

### Tailwind Configuration

Custom Tailwind configuration includes:

- **Typography Plugin**: Enhanced prose styling
- **Custom Colors**: Primary color palette
- **Extended Utilities**: Additional spacing and typography scales

## 🤝 Contributing

We welcome contributions to improve the documentation:

### Adding New Documentation

1. Create a new markdown file in the appropriate application directory
2. Add proper frontmatter with required fields:
   ```yaml
   ---
   title: "Your Page Title"
   description: "Brief description"
   app: "Application Name"
   category: "development" | "automation" | "support"
   order: 1
   lastUpdated: 2025-01-15
   tags: ["tag1", "tag2"]
   ---
   ```
3. Write content using standard markdown
4. Test locally with `npm run dev`
5. Submit a pull request

### Content Guidelines

- Use clear, descriptive headings
- Include code examples where appropriate
- Add tags for better searchability
- Update the `lastUpdated` field when making changes
- Follow the established structure and tone

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure responsive design
- Test on multiple devices and browsers
- Maintain accessibility standards

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json .astro
npm install
npm run build
```

**Search Not Working**
- Verify search index is generated: check `/search-index.json`
- Ensure Fuse.js is loaded properly in browser dev tools
- Check for JavaScript errors in browser console

**Styling Issues**
- Verify Tailwind CSS is compiled correctly
- Check for conflicting CSS rules
- Ensure proper Tailwind configuration

### Getting Help

- **Documentation Issues**: Open an issue on GitHub
- **Technical Support**: Contact support@hallcrest.engineering
- **Feature Requests**: Submit via GitHub issues with enhancement label

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [AstroJS](https://astro.build/) - Amazing static site generator
- [Tailwind CSS](https://tailwindcss.com/) - Fantastic utility-first CSS framework
- [Fuse.js](https://fusejs.io/) - Powerful fuzzy search library
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: January 15, 2025
- **Node.js**: 18+
- **Browser Support**: Modern browsers (ES2020+)

---

**Hallcrest Engineering** | [Website](https://hallcrest.engineering) | [Support](mailto:support@hallcrest.engineering)
