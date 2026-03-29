export interface Category {
  name: string;
  subcategories?: string[];
}

export const NEWS_CATEGORIES: Record<string, Category[]> = {
  core: [
    { name: "Politics" },
    { name: "Business / Economy" },
    { name: "Technology" },
    { name: "Science" },
    { name: "Health / Medicine" },
    { name: "Education" },
    { name: "Environment" },
    { name: "Law / Crime" },
    { name: "World / International Affairs" },
    { name: "National News" },
    { name: "Local / Regional News" }
  ],
  financial: [
    { name: "Stock Market" },
    { name: "Cryptocurrency" },
    { name: "Banking & Finance" },
    { name: "Startups & Venture Capital" },
    { name: "Real Estate" },
    { name: "Personal Finance" }
  ],
  technology: [
    { name: "Artificial Intelligence" },
    { name: "Gadgets / Consumer Electronics" },
    { name: "Cybersecurity" },
    { name: "Software & Apps" },
    { name: "Space Tech" },
    { name: "Internet / Social Media" }
  ],
  science: [
    { name: "Physics" },
    { name: "Biology" },
    { name: "Chemistry" },
    { name: "Astronomy / Space" },
    { name: "Climate Science" },
    { name: "Research & Innovations" }
  ],
  lifestyle: [
    { name: "Lifestyle" },
    { name: "Culture" },
    { name: "Fashion" },
    { name: "Food & Dining" },
    { name: "Travel & Tourism" },
    { name: "Relationships" },
    { name: "Personal Development" }
  ],
  entertainment: [
    { name: "Movies" },
    { name: "TV Shows / OTT" },
    { name: "Music" },
    { name: "Celebrities" },
    { name: "Gaming" },
    { name: "Pop Culture" }
  ],
  sports: [
    { name: "Football (Soccer)" },
    { name: "Cricket" },
    { name: "Basketball" },
    { name: "Tennis" },
    { name: "Olympics" },
    { name: "Esports" },
    { name: "Other Sports" }
  ],
  opinion: [
    { name: "Opinion Pieces" },
    { name: "Editorials" },
    { name: "Columns" },
    { name: "Analysis" },
    { name: "Interviews" }
  ],
  specialized: [
    { name: "Defense / Military" },
    { name: "Geopolitics" },
    { name: "Energy (Oil, Gas, Renewable)" },
    { name: "Agriculture" },
    { name: "Transportation / Automotive" },
    { name: "Infrastructure" },
    { name: "Religion / Spirituality" },
    { name: "Weather" },
    { name: "Disasters / Emergencies" }
  ],
  emerging: [
    { name: "AI & Automation" },
    { name: "Creator Economy" },
    { name: "Startups" },
    { name: "Web3 / Blockchain" },
    { name: "Climate Tech" },
    { name: "Digital Policy & Regulation" }
  ],
  formatBased: [
    { name: "Breaking News" },
    { name: "Live Updates" },
    { name: "Investigative Reports" },
    { name: "Features / Long-form" },
    { name: "Explainers" },
    { name: "Fact-Check" }
  ]
};

// Flattened list of core categories for quick UI access
export const CORE_CATEGORIES = [
  "For You",
  "Trending",
  ...NEWS_CATEGORIES.core.map(c => c.name)
];
