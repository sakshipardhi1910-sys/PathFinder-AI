function getAssistantGuidance(req, res, next) {
  try {
    const { question = "", profile = {} } = req.body;
    const q = String(question).trim().toLowerCase();
    const { careerSuggestions = [], careerDetails = {}, roadmap = [], improvementAreas = [], strengths = [], finance = {} } = profile;
    const topCareer = careerSuggestions[0] || "your leading career option";
    const topDetails = careerDetails[topCareer] || {};
    let answer;
    if (q.includes("budget") || q.includes("fee") || q.includes("afford")) answer = finance.financialGap ? `Your current plan has a ${Number(finance.financialGap).toLocaleString("en-IN")} INR gap. Compare the lower-cost alternatives, then check the eligibility details of the scholarships shown on your dashboard.` : `Your submitted budget covers the estimated fee for ${topCareer}. Keep a separate allowance for admissions, materials, and living costs where relevant.`;
    else if (q.includes("skill") || q.includes("improve")) answer = `For ${topCareer}, prioritise ${improvementAreas.join(", ") || "consistent practice"}. Your current strengths include ${strengths.join(", ") || "your academic foundation"}. Build evidence through one small project or practice routine each week.`;
    else if (q.includes("roadmap") || q.includes("next") || q.includes("start")) answer = `Start with ${roadmap[0] || "the fundamentals"}, then progress through ${roadmap.slice(1).join(" → ") || "structured practice"}. The important next action is a focused first milestone, not trying to do every step at once.`;
    else answer = `${topCareer} is your strongest current match. ${topDetails.eligibility || "Check programme eligibility before applying."} Ask me specifically about budget, skills, or your next roadmap step for a more focused answer.`;
    res.json({ success: true, mode: "rule-based", answer, disclosure: "No external AI provider is configured; this guidance is generated from your PathFinder profile and project rules." });
  } catch (error) { next(error); }
}
module.exports = { getAssistantGuidance };
