const scholarships = require("../../data/scholarships.json");

const courseFees = {
  engineer: 300000,
  engineering: 300000,
  doctor: 800000,
  medical: 800000,
  pharmacy: 250000,
  ca: 150000,
  bba: 180000,
  banking: 120000,
  upsc: 100000,
  teaching: 160000,
  design: 220000
};

function getAffordability(budget, fees) {
  if (budget < fees) return "Not Affordable";
  return "Affordable";
}

function analyzeFinance(req, res, next) {
  try {
    const { budget, course, interest = "", marks, familyIncome, educationLevel = "" } = req.body;

    if (budget === undefined || budget === "" || !course) {
      return res.status(400).json({
        error: true,
        message: "Please provide both budget and course."
      });
    }

    const numericBudget = Number(budget);
    const normalizedCourse = String(course).trim().toLowerCase();

    if (Number.isNaN(numericBudget) || numericBudget < 0) {
      return res.status(400).json({
        error: true,
        message: "Budget must be a positive number."
      });
    }

    const estimatedFees = courseFees[normalizedCourse] || 200000;
    const affordability = getAffordability(numericBudget, estimatedFees);
    const financialGap = Math.max(0, estimatedFees - numericBudget);
    const numericMarks = marks === undefined || marks === "" ? null : Number(marks);
    const numericIncome = familyIncome === undefined || familyIncome === "" ? null : Number(familyIncome);
    if ((numericMarks !== null && (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100)) || (numericIncome !== null && (Number.isNaN(numericIncome) || numericIncome < 0))) {
      return res.status(400).json({ error: true, message: "Marks and family income must be valid positive values." });
    }
    const matchingScholarships = scholarships.filter((scholarship) => {
      const text = `${scholarship.eligibility} ${scholarship.name}`.toLowerCase();
      const meritMatch = text.includes("academic") && (numericMarks === null || numericMarks >= 70);
      const incomeMatch = text.includes("limited family income") && (numericIncome === null || numericIncome <= 500000);
      const stemMatch = String(interest).toLowerCase() === "science" && text.includes("stem");
      return meritMatch || incomeMatch || stemMatch;
    });
    const alternatives = Object.entries(courseFees)
      .filter(([name, fee]) => fee <= numericBudget && name !== normalizedCourse)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([courseName, fee]) => ({ course: courseName.toUpperCase(), estimatedFees: fee }));

    console.log("Finance analysis:", {
      budget: numericBudget,
      course: normalizedCourse,
      estimatedFees,
      affordability
    });

    res.json({
      affordability,
      estimatedFees,
      financialGap,
      budgetCoverage: estimatedFees ? Math.min(100, Math.round((numericBudget / estimatedFees) * 100)) : 100,
      affordableAlternatives: alternatives,
      scholarshipSuggestions: matchingScholarships.map((scholarship) => ({
        ...scholarship,
        applicationUrl: scholarship.applicationUrl || null,
        dataNote: scholarship.applicationUrl ? "Application link supplied in project data." : "No official application link is available in the supplied scholarship data.",
        profileContext: educationLevel ? `Matched against your ${educationLevel} profile and supplied criteria.` : "Matched against supplied profile criteria."
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeFinance };
