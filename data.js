// Single source of truth for both the normal site and the terminal site.
window.DATA = {
  name: "Vaisakh K",
  handle: "vaisakh",
  title: "Senior Software Engineer",
  tagline: "Front-end architect · React & TypeScript · Data-rich UIs",
  location: "Kozhikode, Kerala, India",
  email: "vaisakh.k591@gmail.com",
  github: "https://github.com/ckvaizz",
  linkedin: "https://www.linkedin.com/in/vaisakh-k-17906a200/",
  about: [
    "Dedicated and detail-oriented Senior Software Engineer with 4 years of professional experience specializing in React and TypeScript.",
    "A passionate front-end architect who excels at building scalable component libraries, data-rich visualization platforms, and enterprise-grade applications.",
    "Collaborative team player with hands-on experience mentoring junior developers, delivering complex UI features, and bridging design with technical execution. Brings additional depth with supporting knowledge in Node.js and MongoDB.",
  ],
  stats: [
    { value: "4+", label: "Years of experience" },
    { value: "React", label: "& TypeScript expert" },
    { value: "6", label: "Projects documented" },
  ],
  skills: {
    frontend: [
      "React.js & TypeScript (Expert)",
      "JavaScript (ES6+), HTML5, CSS3 / SCSS",
      "Component Library Development",
      "Data Visualization & Highcharts",
      "Dashboard Architecture & Theming",
      "Performance Optimization",
    ],
    backend: [
      "Node.js & Express (Working Knowledge)",
      "MongoDB (Working Knowledge)",
      "RESTful API Integration",
    ],
    practices: [
      "Git & Version Control",
      "Agile / Scrum Methodology",
      "Mentoring & Technical Leadership",
      "Cross-functional Team Collaboration",
    ],
  },
  experience: [
    {
      id: "dbiz-ai",
      company: "dbiz.ai",
      role: "Senior Software Engineer — UI Development",
      period: "Present",
      summary:
        "Currently working at dbiz.ai ('Impactful Experience @ Scale'), building data-rich front-end platforms. Worked on FactWeavers and OnePlace.",
      points: [
        "Architect complex, interactive data visualizations and reusable UI libraries.",
        "Mentor junior developers and drive code quality through reviews.",
        "Bridge design and engineering across cross-functional teams.",
      ],
      projects: ["factweavers", "oneplace"],
    },
    {
      id: "necttos",
      company: "Necttos Private Limited",
      role: "MERN Stack Developer",
      period: "1 month (part-time)",
      summary: "Short part-time stint working across the MERN stack.",
      points: [],
      projects: [],
    },
  ],
  projects: [
    {
      id: "factweavers",
      name: "FactWeavers",
      kind: "Professional · dbiz.ai",
      role: "Senior Software Engineer — UI Development",
      description:
        "A comprehensive data management and analytics platform that enables users to connect diverse data sources, build custom metrics, create rich visualizations, and assemble interactive dashboards. The platform features an AI-powered chat interface for conversational data analysis and visualization generation.",
      points: [
        "Architected and built complex interactive data visualizations using Highcharts, including custom chart types, drill-downs, and real-time data updates within a dynamic dashboard canvas.",
        "Developed a reusable embedding library enabling clients to embed dashboards and visualization widgets into external applications with minimal configuration.",
        "Designed and implemented a dashboard theming library, providing a flexible system for white-labeling and consistent visual customization across the platform.",
        "Mentored a junior React developer, guiding her through codebase onboarding, best practices, and progressively introducing her to feature ownership within the project.",
        "Maintained high code quality through thorough code reviews, component-driven development, and adherence to established design patterns.",
      ],
      tech: ["React", "TypeScript", "Highcharts", "Custom Component Libraries", "Dashboard Canvas", "REST APIs", "Git"],
    },
    {
      id: "oneplace",
      name: "OnePlace",
      kind: "Professional · dbiz.ai",
      role: "Software Engineer — Front-end Development",
      description:
        "An employee management system designed to monitor and streamline workforce operations, including login tracking, leave management, attendance, and employee activity reporting for HR and operations teams.",
      points: [
        "Designed and implemented the complete front-end UI for employee management, including login tracking modules, leave request workflows, and attendance reports.",
        "Built reusable React components for data tables, filter panels, and status indicators, ensuring consistency and scalability across the application.",
        "Integrated RESTful APIs to display real-time employee data and synchronize state across various modules of the system.",
        "Contributed to improving application performance through code-splitting, lazy loading, and component optimization strategies.",
      ],
      tech: ["React", "TypeScript", "REST API Integration", "Component Architecture", "Git"],
    },
    {
      id: "classroom-management",
      name: "Classroom Management System",
      kind: "Personal project",
      role: "Full-stack developer",
      description:
        "A fully functional full-stack classroom management system built with Node.js, Handlebars and MongoDB.",
      points: [
        "Backend supports student and tutor authentication, OTP verification, payment gateways (PayPal, Paytm and Razorpay), chat (Socket.IO) and video calling (using an external API).",
        "Supports daily tasks, assignments, assignment valuation and more.",
      ],
      tech: ["Node.js", "Handlebars", "MongoDB", "Socket.IO", "Razorpay", "PayPal", "Paytm"],
    },
    {
      id: "fimkin-travels",
      name: "Fimkin Travels",
      kind: "Freelance",
      role: "Full-stack developer",
      description: "A fully functional flight ticket booking web app built as a freelance project.",
      points: [
        "Built with React, Bootstrap, Material UI, SCSS and Google login on a Node.js, Express and MongoDB backend.",
        "Deployed on Firebase (front-end) and AWS (back-end).",
      ],
      tech: ["React", "Bootstrap", "Material UI", "SCSS", "Node.js", "Express", "MongoDB", "Firebase", "AWS"],
    },
    {
      id: "ecommerce-web-app",
      name: "E-Commerce Web App",
      kind: "Personal project",
      role: "Full-stack developer",
      description: "A full-stack e-commerce web app built with Node.js, Handlebars and MongoDB.",
      points: ["Backend supports user authentication, payment methods, product sales and more."],
      tech: ["Node.js", "Handlebars", "MongoDB"],
    },
    {
      id: "covid-status-app",
      name: "Covid Status Web App",
      kind: "Personal project",
      role: "Front-end developer",
      description: "A Covid statistics tracker that uses React, React Hooks and an external API.",
      points: ["Deployed on Firebase."],
      tech: ["React", "React Hooks", "External API", "Firebase"],
    },
  ],
  education: [
    {
      title: "BSc Computer Science (pursuing)",
      place: "Calicut University",
      period: "Degree pending completion",
    },
    {
      title: "Higher Secondary (12th) — Computer Science",
      place: "PVS HSS, Erazhikkal",
      period: "June 2019",
    },
  ],
  company: {
    name: "theblackit",
    url: "https://theblackit.com/",
    email: "hello@theblackit.com",
    tagline: "We build products that connect people.",
    blurb:
      "theblackit is a product company from Kerala that builds its own ideas into software. We're just getting started — and we're building it ourselves.",
    focus: [
      { title: "Community Products", text: "Apps that bring people together, rooted in real human needs." },
      { title: "Ideas We Ship", text: "Every product starts with a problem we care about. We build, launch and grow it ourselves." },
      { title: "Built to Scale", text: "Products engineered to grow from a few users to millions." },
    ],
    values: [
      { title: "Kerala-rooted", text: "Building from home." },
      { title: "Community-first", text: "People before metrics." },
      { title: "Built to last", text: "Quality in every pixel." },
      { title: "Open to the world", text: "Inclusive by design." },
    ],
    products: [
      {
        id: "natil-evidayaa",
        name: "Natil Evidayaa (നാട്ടിൽ എവിടെയാ?)",
        status: "Launching soon",
        text: "Our first community app — find Keralites near you anywhere in the world, with discovery, chat and emergency support features.",
      },
    ],
  },
};
