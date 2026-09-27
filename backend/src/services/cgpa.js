function gradeToPoints(grade) {
  if (typeof grade === 'number') {
    return grade;
  }

  if (typeof grade !== 'string') {
    return 0;
  }

  const normalized = grade.trim().toUpperCase();
  const mapping = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D': 1.0,
    'F': 0.0,
  };

  return mapping[normalized] ?? 0;
}

function calculateCGPA(subjects = []) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { cgpa: 0, totalCredits: 0, totalPoints: 0 };
  }

  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((subject) => {
    const credits = Number(subject.credits || 0);
    const gradePoint = Number(subject.gradePoint ?? gradeToPoints(subject.grade));

    if (!Number.isFinite(credits) || credits <= 0) {
      return;
    }

    totalCredits += credits;
    totalPoints += credits * gradePoint;
  });

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    cgpa: Number(cgpa.toFixed(2)),
    totalCredits,
    totalPoints: Number(totalPoints.toFixed(2)),
  };
}

function predictCGPA({ currentCGPA, completedCredits, targetCGPA, upcomingCredits }) {
  const current = Number(currentCGPA) || 0;
  const completed = Number(completedCredits) || 0;
  const target = Number(targetCGPA) || 0;
  const upcoming = Number(upcomingCredits) || 0;

  if (upcoming <= 0) {
    return {
      requiredGPA: 0,
      achievable: false,
      message: 'Please enter upcoming credits.',
    };
  }

  const numerator = target * (completed + upcoming) - current * completed;
  const requiredGPA = numerator / upcoming;
  const achievable = requiredGPA >= 0 && requiredGPA <= 4;

  return {
    requiredGPA: Number(requiredGPA.toFixed(2)),
    achievable,
    message: achievable
      ? `You need an average of ${requiredGPA.toFixed(2)}/4.0 across ${upcoming} credits to reach ${target.toFixed(2)} CGPA.`
      : `It is not possible to reach ${target.toFixed(2)} CGPA with a required GPA of ${requiredGPA.toFixed(2)}/4.0 in the upcoming credits.`,
  };
}

module.exports = {
  calculateCGPA,
  predictCGPA,
  gradeToPoints,
};
