function capitalizeSentence(sentence) {
  const trimmed = String(sentence || "").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function checkSpeech(req, res, next) {
  try {
    const { sentence } = req.body;

    if (!sentence || !String(sentence).trim()) {
      return res.status(400).json({
        error: true,
        message: "Please provide a sentence."
      });
    }

    let correctedSentence = capitalizeSentence(sentence)
      .replace(/\bi am\b/gi, "I am")
      .replace(/\bi\b/g, "I")
      .replace(/\s+/g, " ");

    if (!/[.!?]$/.test(correctedSentence)) {
      correctedSentence += ".";
    }

    const betterSentence = correctedSentence
      .replace(/\bwant to\b/gi, "would like to")
      .replace(/\bgood\b/gi, "excellent")
      .replace(/\blearn\b/gi, "improve my understanding of");

    const confidenceScore = Math.min(95, Math.max(70, 100 - Math.abs(String(sentence).length - correctedSentence.length) * 2));

    console.log("English practice:", {
      original: sentence,
      correctedSentence,
      confidenceScore
    });

    res.json({
      correctedSentence,
      betterSentence,
      confidenceScore
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { checkSpeech };

