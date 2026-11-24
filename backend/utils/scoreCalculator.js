function calculateSuccessScore(marks) {
  const scoreBands = [
    { min: 85, max: 100, scoreMin: 85, scoreMax: 95 },
    { min: 70, max: 84, scoreMin: 65, scoreMax: 80 },
    { min: 50, max: 69, scoreMin: 50, scoreMax: 65 },
    { min: 0, max: 49, scoreMin: 35, scoreMax: 49 }
  ];

  const band = scoreBands.find((item) => marks >= item.min && marks <= item.max);
  if (!band) return 0;

  const markRange = band.max - band.min || 1;
  const scoreRange = band.scoreMax - band.scoreMin;
  return Math.round(band.scoreMin + ((marks - band.min) / markRange) * scoreRange);
}

function getRiskLevel(marks) {
  if (marks >= 85) return "Low";
  if (marks >= 70) return "Medium";
  return "High";
}

module.exports = {
  calculateSuccessScore,
  getRiskLevel
};
