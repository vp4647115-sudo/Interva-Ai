/** Curated company + job-title taxonomy for the experience step autocomplete.
 * Fuzzy-matched with Fuse.js (same pattern as skills taxonomy). */
export const COMPANY_TAXONOMY: string[] = [
  // Big tech
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla", "Nvidia",
  "Adobe", "Salesforce", "Oracle", "IBM", "Intel", "Cisco", "Qualcomm", "Dell",
  "HP", "Samsung", "Sony", "Panasonic",
  // Product / SaaS
  "Atlassian", "Slack", "Zoom", "Shopify", "Stripe", "Square", "PayPal", "Visa",
  "Mastercard", "Twilio", "Datadog", "Snowflake", "Databricks", "MongoDB",
  "Elastic", "Confluent", "HashiCorp", "GitLab", "GitHub", "Figma", "Canva",
  "Notion", "Airtable", "Asana", "Monday.com", "Dropbox", "Box", "HubSpot",
  "Mailchimp", "Intercom", "Zendesk", "Freshworks", "Zoho",
  // Consulting / services
  "Accenture", "Deloitte", "PwC", "EY", "KPMG", "McKinsey & Company",
  "Boston Consulting Group", "Cognizant", "Capgemini", "Wipro", "Infosys",
  "TCS (Tata Consultancy Services)", "HCLTech", "Tech Mahindra", "LTIMindtree",
  // Fintech / banks
  "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Citibank", "HSBC",
  "Barclays", "Deutsche Bank", "Wells Fargo", "American Express", "Chime",
  "Revolut", "Nubank", "Razorpay", "PhonePe", "Paytm", "Coinbase", "Robinhood",
  // E-commerce / mobility
  "Flipkart", "Myntra", "Swiggy", "Zomato", "Uber", "Lyft", "DoorDash",
  "Instacart", "Airbnb", "Booking.com", "Expedia", "eBay", "Etsy", "Walmart",
  "Target", "Costco", "IKEA",
  // Media / telecom
  "Disney", "Warner Bros. Discovery", "Comcast", "Spotify", "YouTube",
  "TikTok", "Snap Inc.", "Pinterest", "X (Twitter)", "LinkedIn", "Reddit",
  "Discord", "Twitch", "AT&T", "Verizon", "T-Mobile", "Vodafone", "Airtel",
  "Jio",
  // AI / startups
  "OpenAI", "Anthropic", "DeepMind", "Hugging Face", "Scale AI", "Perplexity",
  "Mistral AI", "Cohere", "Stability AI", "Runway", "Jasper", "Writer",
  "Character.AI", "Inflection AI", "xAI",
  // Airlines / travel / other
  "Boeing", "Airbus", "Lockheed Martin", "Raytheon", "Siemens", "Philips",
  "Johnson & Johnson", "Pfizer", "Unilever", "Procter & Gamble", "Nestlé",
  "Coca-Cola", "PepsiCo", "Nike", "Adidas", "Zara", "H&M", "FedEx", "UPS",
  "DHL", "Maersk",
];

export const JOB_TITLE_TAXONOMY: string[] = [
  // Engineering
  "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
  "Principal Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Mobile Developer", "iOS Developer", "Android Developer",
  "React Developer", "React Native Developer", "Flutter Developer",
  "Web Developer", "WordPress Developer", "Game Developer", "Embedded Engineer",
  "Firmware Engineer", "DevOps Engineer", "Site Reliability Engineer (SRE)",
  "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer",
  "Security Engineer", "Network Engineer", "Systems Engineer",
  "QA Engineer", "Test Automation Engineer", "Automation Engineer",
  // Data / AI
  "Data Analyst", "Data Scientist", "Data Engineer", "Analytics Engineer",
  "Business Intelligence Analyst", "Machine Learning Engineer",
  "AI Engineer", "AI Researcher", "NLP Engineer", "Computer Vision Engineer",
  "MLOps Engineer", "Research Scientist", "Big Data Engineer",
  // Product / design
  "Product Manager", "Senior Product Manager", "Technical Product Manager",
  "Product Owner", "Program Manager", "Project Manager", "Scrum Master",
  "UI/UX Designer", "Product Designer", "UX Researcher", "Interaction Designer",
  "Graphic Designer", "Motion Designer", "Brand Designer", "Design Lead",
  // Leadership
  "Engineering Manager", "Director of Engineering", "VP of Engineering",
  "CTO", "CEO", "COO", "CFO", "CIO", "Head of Product", "Head of Design",
  "Head of Data", "Team Lead", "Tech Lead", "Architect",
  "Solutions Architect", "Cloud Architect", "Enterprise Architect",
  // Marketing / sales / ops
  "Digital Marketing Manager", "SEO Specialist", "Content Writer",
  "Content Strategist", "Social Media Manager", "Growth Manager",
  "Sales Executive", "Account Manager", "Business Development Manager",
  "Customer Success Manager", "Support Engineer", "Operations Manager",
  "Supply Chain Analyst", "HR Manager", "Technical Recruiter",
  "Financial Analyst", "Accountant", "Business Analyst",
  // Intern / entry
  "Intern", "Software Engineering Intern", "Data Science Intern",
  "Product Management Intern", "Graduate Trainee", "Junior Developer",
  "Associate Software Engineer", "Trainee",
];
