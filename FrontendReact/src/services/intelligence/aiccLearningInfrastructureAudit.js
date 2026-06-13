const AUDIT_LABELS = {
  FAILED: "FAILED",
  DEVELOPING: "DEVELOPING",
  PASSING: "PASSING",
  CERTIFIED: "CERTIFIED",
};

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasObjectContent(value) {
  return Object.keys(safeObject(value)).length > 0;
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getAuditLabel(score) {
  if (score >= 90) return AUDIT_LABELS.CERTIFIED;
  if (score >= 70) return AUDIT_LABELS.PASSING;
  if (score >= 40) return AUDIT_LABELS.DEVELOPING;
  return AUDIT_LABELS.FAILED;
}

function getCertificationLevel(score, availableCount) {
  if (score >= 90 && availableCount === 6) return "FULL";
  if (score >= 70 && availableCount >= 5) return "ADVANCED";
  if (score >= 40 && availableCount >= 3) return "PARTIAL";
  return "NONE";
}

function scoreComponent(available, passed, maxPoints) {
  if (!available) return 0;
  return passed ? maxPoints : Math.round(maxPoints * 0.5);
}

export function auditLearningInfrastructure(input = {}) {
  const safeInput = safeObject(input);
  const datasetCapture = safeObject(safeInput.datasetCapture);
  const datasetValidation = safeObject(safeInput.datasetValidation);
  const shadowReadiness = safeObject(safeInput.shadowReadiness);
  const queueCertification = safeObject(safeInput.queueCertification);
  const queueBuilder = safeObject(safeInput.queueBuilder);
  const trainingReadiness = safeObject(safeInput.trainingReadiness);

  const strengths = [];
  const weaknesses = [];
  const warnings = [];

  const datasetCaptureAvailable = hasObjectContent(datasetCapture);
  const validationAvailable = hasObjectContent(datasetValidation);
  const shadowReadinessAvailable = hasObjectContent(shadowReadiness);
  const queueCertificationAvailable = hasObjectContent(queueCertification);
  const queueBuilderAvailable = hasObjectContent(queueBuilder);
  const trainingReadinessAvailable = hasObjectContent(trainingReadiness);

  const componentStatuses = [
    {
      available: datasetCaptureAvailable,
      passed: Boolean(datasetCapture.id || datasetCapture.metadata),
      strength: "Dataset capture operational.",
      weakness: "Missing capture layer.",
      points: 15,
    },
    {
      available: validationAvailable,
      passed: datasetValidation.valid === true,
      strength: "Validation operational.",
      weakness: "Missing validation layer.",
      points: 15,
    },
    {
      available: shadowReadinessAvailable,
      passed: shadowReadiness.shadowTrainingReady === true,
      strength: "Shadow readiness operational.",
      weakness: "Missing readiness layer.",
      points: 15,
    },
    {
      available: queueCertificationAvailable,
      passed: queueCertification.certified === true,
      strength: "Queue certification operational.",
      weakness: "Missing queue certification layer.",
      points: 15,
    },
    {
      available: queueBuilderAvailable,
      passed: queueBuilder.queueReady === true,
      strength: "Queue architecture operational.",
      weakness: "Missing queue layer.",
      points: 15,
    },
    {
      available: trainingReadinessAvailable,
      passed: trainingReadiness.trainingReady === true,
      strength: "Training readiness operational.",
      weakness: "Missing training readiness.",
      points: 25,
    },
  ];

  const auditScore = clampScore(
    componentStatuses.reduce(
      (total, item) => total + scoreComponent(item.available, item.passed, item.points),
      0
    )
  );

  componentStatuses.forEach((item) => {
    if (item.available && item.passed) {
      strengths.push(item.strength);
      return;
    }

    weaknesses.push(item.weakness);
  });

  const availableCount = componentStatuses.filter((item) => item.available).length;

  if (availableCount < componentStatuses.length) {
    warnings.push("Missing components.");
  }

  if (auditScore < 90) {
    warnings.push("Low audit score.");
  }

  if (availableCount > 0 && availableCount < componentStatuses.length) {
    warnings.push("Partial infrastructure.");
  }

  const certificationLevel = getCertificationLevel(auditScore, availableCount);

  if (certificationLevel !== "FULL") {
    warnings.push("Incomplete certification.");
  }

  const auditPassed =
    datasetCaptureAvailable &&
    validationAvailable &&
    shadowReadinessAvailable &&
    queueCertificationAvailable &&
    queueBuilderAvailable &&
    trainingReadinessAvailable &&
    auditScore >= 90;

  return {
    auditPassed,
    auditScore,
    auditLabel: getAuditLabel(auditScore),
    datasetCaptureAvailable,
    validationAvailable,
    shadowReadinessAvailable,
    queueCertificationAvailable,
    queueBuilderAvailable,
    trainingReadinessAvailable,
    certificationLevel,
    strengths,
    weaknesses,
    warnings: [...new Set(warnings)],
  };
}
