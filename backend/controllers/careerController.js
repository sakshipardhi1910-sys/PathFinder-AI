const careers = require("../../data/careers.json");
const { calculateSuccessScore, getRiskLevel } = require("../utils/scoreCalculator");
const { generateRoadmap } = require("../utils/roadmapGenerator");

const careerDetails = {
  Engineer: "Engineers solve technical problems and build products, systems, software, machines, and infrastructure.",
  Doctor: "Doctors diagnose and treat patients after medical education, clinical training, and internships.",
  Pharmacy: "Pharmacy careers focus on medicines, healthcare products, dosage, safety, and pharmaceutical research.",
  CA: "Chartered Accountants work in accounting, taxation, auditing, finance, and business compliance.",
  BBA: "BBA is a business degree path for management, marketing, entrepreneurship, and operations roles.",
  Banking: "Banking careers include finance operations, customer accounts, loans, risk, and bank exams.",
  UPSC: "UPSC is a civil services path for public administration, policy, governance, and leadership roles.",
  Teaching: "Teaching careers focus on explaining concepts, mentoring students, and building subject expertise.",
  Design: "Design careers combine creativity, visual thinking, user needs, portfolios, and practical projects."
};

const careerProfiles = {
  Engineer: { skills: ["Problem solving", "Mathematics", "Technical foundations"], eligibility: "Usually 12th with PCM; entrance requirements vary by institution.", category: "Technology" },
  Doctor: { skills: ["Biology", "Empathy", "Discipline"], eligibility: "Usually 12th with PCB and medical entrance qualification.", category: "Healthcare" },
  Pharmacy: { skills: ["Chemistry", "Attention to detail", "Scientific reasoning"], eligibility: "Usually 12th with PCB or PCM; programme rules vary.", category: "Healthcare" },
  CA: { skills: ["Accounting", "Numerical reasoning", "Accuracy"], eligibility: "Commerce foundation route and professional exam requirements apply.", category: "Finance" },
  BBA: { skills: ["Communication", "Leadership", "Business awareness"], eligibility: "12th pass; admissions may consider marks or entrance tests.", category: "Business" },
  Banking: { skills: ["Quantitative aptitude", "Customer communication", "Financial awareness"], eligibility: "Graduation is commonly required for banking roles and exams.", category: "Finance" },
  UPSC: { skills: ["Reading", "Analysis", "Writing"], eligibility: "A recognised graduation degree is generally required for the examination.", category: "Public service" },
  Teaching: { skills: ["Communication", "Subject knowledge", "Patience"], eligibility: "Graduation and teacher-training requirements vary by role and region.", category: "Education" },
  Design: { skills: ["Creativity", "Visual communication", "Portfolio building"], eligibility: "12th pass; many programmes assess aptitude or portfolio.", category: "Creative" }
};

function buildSkills(marks, interests) {
  const interestText = String(interests || "").toLowerCase();
  const academic = Math.round(marks);
  return {
    "Academic readiness": academic,
    "Problem solving": Math.min(96, Math.max(42, Math.round(marks * 0.82 + (interestText.includes("tech") || interestText.includes("math") ? 14 : 4)))),
    Communication: Math.min(94, Math.max(40, Math.round(marks * 0.7 + (interestText.includes("speak") || interestText.includes("write") || interestText.includes("art") ? 16 : 8)))),
    Creativity: Math.min(94, Math.max(38, Math.round(marks * 0.62 + (interestText.includes("design") || interestText.includes("art") || interestText.includes("creative") ? 20 : 10)))),
    "Financial planning": Math.min(92, Math.max(40, Math.round(marks * 0.58 + 18)))
  };
}

function analyzeCareer(req, res, next) {
  try {
    const { interest, marks, interests = "", budget } = req.body;

    if (!interest || marks === undefined || marks === "") {
      return res.status(400).json({
        error: true,
        message: "Please provide both interest and marks."
      });
    }

    const normalizedInterest = String(interest).trim().toLowerCase();
    const numericMarks = Number(marks);

    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        error: true,
        message: "Marks must be a number between 0 and 100."
      });
    }

    const suggestions = careers[normalizedInterest] || ["Teaching", "Design", "BBA"];
    const successScore = calculateSuccessScore(numericMarks);
    const riskLevel = getRiskLevel(numericMarks);
    const roadmap = generateRoadmap(suggestions[0]);
    const skills = buildSkills(numericMarks, interests);
    const readiness = Math.round((successScore * 0.68) + (Object.values(skills).reduce((total, score) => total + score, 0) / Object.keys(skills).length * 0.32));
    const details = suggestions.reduce((result, career) => {
      const profile = careerProfiles[career] || { skills: ["Research", "Practice", "Communication"], eligibility: "Check programme-specific eligibility.", category: "General" };
      result[career] = {
        overview: careerDetails[career] || "Explore this field through courses, projects, internships, and expert guidance.",
        eligibility: profile.eligibility,
        requiredSkills: profile.skills,
        category: profile.category,
        matchScore: Math.max(45, Math.min(98, readiness - suggestions.indexOf(career) * 7 + (String(interests).toLowerCase().includes(career.toLowerCase()) ? 5 : 0)))
      };
      return result;
    }, {});

    const improvementAreas = Object.entries(skills).filter(([, score]) => score < 65).map(([skill]) => skill);
    const strengths = Object.entries(skills).filter(([, score]) => score >= 65).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([skill]) => skill);
    const explanation = `Based on your ${normalizedInterest} stream${interests ? ` and interest in ${interests}` : ""}, ${suggestions[0]} is your strongest starting option. Your readiness is ${readiness}% with ${riskLevel.toLowerCase()} risk. Build the recommended skills, follow the roadmap, and compare course costs before deciding.`;

    console.log("Career analysis:", {
      interest: normalizedInterest,
      marks: numericMarks,
      suggestions,
      successScore,
      riskLevel
    });

    res.json({
      careerSuggestions: suggestions,
      successScore,
      readinessScore: readiness,
      riskLevel,
      roadmap,
      careerDetails: details,
      skills,
      strengths,
      improvementAreas: improvementAreas.length ? improvementAreas : ["Keep strengthening practical experience through projects and mentoring."],
      analytics: {
        careerComparison: suggestions.map((career) => ({ career, score: details[career].matchScore })),
        categoryDistribution: suggestions.map((career) => careerDetails[career] ? { category: details[career].category, value: details[career].matchScore } : null).filter(Boolean),
        progress: [Math.max(20, readiness - 28), Math.max(35, readiness - 16), readiness]
      },
      explanation
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeCareer };
