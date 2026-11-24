const roadmaps = {
  Engineer: ["12th PCM", "Entrance Exam", "College", "Build Technical Skills"],
  Doctor: ["12th PCB", "NEET", "MBBS", "Internship"],
  Pharmacy: ["12th PCB or PCM", "Pharmacy Entrance", "B.Pharm", "Clinical or Industry Skills"],
  CA: ["Commerce Foundation", "CA Foundation", "CA Intermediate", "Articleship"],
  BBA: ["Commerce Basics", "BBA Admission", "Business Projects", "Internship"],
  Banking: ["Commerce Basics", "Graduation", "Bank Exam Preparation", "Interview Practice"],
  UPSC: ["Choose Graduation Subject", "NCERT Basics", "UPSC Syllabus", "Mock Tests"],
  Teaching: ["Choose Subject", "Graduation", "B.Ed or Teacher Training", "Teaching Practice"],
  Design: ["Build Portfolio", "Design Entrance", "Design Degree", "Client Projects"]
};

function generateRoadmap(career) {
  return roadmaps[career] || ["Choose a field", "Learn basics", "Build projects", "Apply for opportunities"];
}

module.exports = { generateRoadmap };
