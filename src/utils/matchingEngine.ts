import {
  StudentProfile,
  Project,
  MatchExplanation,
  CandidateMatch,
  TeamGapAnalysis,
  ExperienceLevel,
} from "../types";

const EXPERIENCE_HIERARCHY: Record<ExperienceLevel, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

/**
 * Normalizes text for matching comparison
 */
export function normalize(str: string): string {
  return (str || "").toLowerCase().trim();
}

/**
 * Checks if a candidate's skill matches a project skill (exact or close keyword)
 */
export function matchesSkill(candidateSkill: string, targetSkill: string): boolean {
  if (!candidateSkill || !targetSkill) return false;
  const c = normalize(candidateSkill);
  const t = normalize(targetSkill);
  if (c === t) return true;
  if (c.includes(t) || t.includes(c)) return true;

  // Specific aliases and synonyms
  if ((c === "js" || c === "javascript") && t === "typescript") return true;
  if ((t === "js" || t === "javascript") && c === "typescript") return true;
  if (c === "ui/ux" && (t === "ui/ux design" || t === "figma" || t === "product design")) return true;
  if (c === "figma" && (t === "ui/ux design" || t === "ui/ux")) return true;
  if (t === "figma" && (c === "ui/ux design" || c === "ui/ux")) return true;
  if (c === "deep learning" && (t === "pytorch" || t === "machine learning" || t === "tensorflow")) return true;
  if (t === "deep learning" && (c === "pytorch" || c === "machine learning" || c === "tensorflow")) return true;
  if (c === "ml" && t === "machine learning") return true;
  if (t === "ml" && c === "machine learning") return true;
  if (c === "nlp" && t === "natural language processing") return true;
  if (t === "nlp" && c === "natural language processing") return true;
  if (c === "cv" && t === "computer vision") return true;
  if (t === "cv" && c === "computer vision") return true;
  if (c === "postgres" && t === "postgresql") return true;
  if (c === "postgresql" && t === "postgres") return true;
  return false;
}

/**
 * Checks if a candidate's role matches a project required role
 */
export function matchesRole(candidateRole: string, targetRole: string): boolean {
  if (!candidateRole || !targetRole) return false;
  const c = normalize(candidateRole);
  const t = normalize(targetRole);
  if (c === t) return true;

  const cleanC = c.replace(/[\/\-_]/g, " ").replace(/\s+/g, " ");
  const cleanT = t.replace(/[\/\-_]/g, " ").replace(/\s+/g, " ");
  if (cleanC === cleanT) return true;
  if (cleanC.includes(cleanT) || cleanT.includes(cleanC)) return true;

  // ML / AI Engineer variations
  const isC_ML = (cleanC.includes("ml") || cleanC.includes("ai") || cleanC.includes("machine learning") || cleanC.includes("computer vision") || cleanC.includes("nlp")) && (cleanC.includes("engineer") || cleanC.includes("lead") || cleanC.includes("developer"));
  const isT_ML = (cleanT.includes("ml") || cleanT.includes("ai") || cleanT.includes("machine learning") || cleanT.includes("computer vision") || cleanT.includes("nlp")) && (cleanT.includes("engineer") || cleanT.includes("lead") || cleanT.includes("developer"));
  if (isC_ML && isT_ML) return true;

  // Data Scientist matches Data Analyst / Data Engineer
  if (cleanC.includes("data") && cleanT.includes("data")) return true;

  // Full-Stack covers Frontend and Backend
  if (cleanC.includes("full stack") || cleanC.includes("full-stack")) {
    if (cleanT.includes("frontend") || cleanT.includes("backend") || cleanT.includes("developer") || cleanT.includes("engineer") || cleanT.includes("lead developer")) return true;
  }

  // Frontend variations
  if ((cleanC.includes("frontend") || cleanC.includes("front end") || cleanC.includes("web developer")) && (cleanT.includes("frontend") || cleanT.includes("front end"))) return true;

  // Backend variations
  if ((cleanC.includes("backend") || cleanC.includes("back end") || cleanC.includes("cloud architect") || cleanC.includes("infrastructure")) && (cleanT.includes("backend") || cleanT.includes("back end"))) return true;

  // Designer variations
  if ((cleanC.includes("ui") || cleanC.includes("ux") || cleanC.includes("design")) && (cleanT.includes("ui") || cleanT.includes("ux") || cleanT.includes("design"))) return true;

  // Smart Contract / Web3 variations
  if ((cleanC.includes("smart contract") || cleanC.includes("web3") || cleanC.includes("solidity") || cleanC.includes("blockchain")) && (cleanT.includes("smart contract") || cleanT.includes("web3") || cleanT.includes("blockchain"))) return true;

  // Robotics / Embedded variations
  if ((cleanC.includes("robotics") || cleanC.includes("embedded") || cleanC.includes("hardware")) && (cleanT.includes("robotics") || cleanT.includes("embedded") || cleanT.includes("hardware"))) return true;

  return false;
}

/**
 * Computes explainable match score between a StudentProfile and a Project
 * Weights strictly adhere to:
 * - Skills: 40%
 * - Interest/Domain: 20%
 * - Availability: 15%
 * - Experience: 15%
 * - Role Complementarity: 10%
 */
export function calculateStudentMatch(
  student: StudentProfile,
  project: Project
): MatchExplanation {
  const positiveReasons: string[] = [];
  const warningReasons: string[] = [];

  // ==========================================
  // 1. Skill Compatibility (Weight: 40%)
  // ==========================================
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  project.requiredSkills.forEach((reqSkill) => {
    const found = student.skills.find((s) => matchesSkill(s, reqSkill));
    if (found) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  });

  const matchedPreferredSkills: string[] = [];
  project.preferredSkills.forEach((prefSkill) => {
    const found = student.skills.find((s) => matchesSkill(s, prefSkill));
    if (found) {
      matchedPreferredSkills.push(prefSkill);
    }
  });

  // Calculate skill score
  const totalReq = project.requiredSkills.length || 1;
  const reqRatio = matchedRequiredSkills.length / totalReq;

  let skillScore: number;
  if (project.preferredSkills.length > 0) {
    const prefRatio = matchedPreferredSkills.length / project.preferredSkills.length;
    skillScore = Math.round((reqRatio * 0.8 + prefRatio * 0.2) * 100);
  } else {
    skillScore = Math.round(reqRatio * 100);
  }
  skillScore = Math.min(100, Math.max(0, skillScore));

  // Explanations: Truthful generation based strictly on candidate's actual skills
  if (matchedRequiredSkills.length > 0) {
    positiveReasons.push(
      `✓ Verified required skill${matchedRequiredSkills.length > 1 ? "s" : ""}: ${matchedRequiredSkills.join(", ")}`
    );
  }
  if (matchedPreferredSkills.length > 0) {
    positiveReasons.push(
      `✓ Preferred bonus skill${matchedPreferredSkills.length > 1 ? "s" : ""}: ${matchedPreferredSkills.join(", ")}`
    );
  }
  if (missingRequiredSkills.length > 0) {
    warningReasons.push(
      `⚠ Missing required skill${missingRequiredSkills.length > 1 ? "s" : ""}: ${missingRequiredSkills.join(", ")}`
    );
  }

  // ==========================================
  // 2. Interest / Domain Compatibility (Weight: 20%)
  // ==========================================
  const projectDomainNorm = normalize(project.domain);
  const sharedInterests: string[] = [];

  student.interests.forEach((interest) => {
    const normInterest = normalize(interest);
    if (
      normInterest.includes(projectDomainNorm) ||
      projectDomainNorm.includes(normInterest) ||
      (normInterest.includes("ai") && projectDomainNorm.includes("ai")) ||
      (normInterest.includes("climate") && projectDomainNorm.includes("climate")) ||
      (normInterest.includes("health") && projectDomainNorm.includes("health")) ||
      (normInterest.includes("web3") && projectDomainNorm.includes("web3")) ||
      (normInterest.includes("fintech") && projectDomainNorm.includes("fintech")) ||
      (normInterest.includes("robotics") && projectDomainNorm.includes("robotics")) ||
      (normInterest.includes("imaging") && projectDomainNorm.includes("healthcare")) ||
      (normInterest.includes("bioinformatics") && projectDomainNorm.includes("healthcare")) ||
      (normInterest.includes("sustainability") && projectDomainNorm.includes("climate")) ||
      (normInterest.includes("crypto") && projectDomainNorm.includes("web3"))
    ) {
      sharedInterests.push(interest);
    }
  });

  let interestScore = 0;
  if (sharedInterests.length >= 2) {
    interestScore = 100;
    positiveReasons.push(
      `✓ Direct domain alignment: Interests in ${sharedInterests.slice(0, 2).join(" & ")} align with ${project.domain}`
    );
  } else if (sharedInterests.length === 1) {
    interestScore = 85;
    positiveReasons.push(
      `✓ Domain passion: Interest in "${sharedInterests[0]}" aligns with project domain (${project.domain})`
    );
  } else {
    // Check department relevance
    const deptNorm = normalize(student.department);
    const domainKeyword = projectDomainNorm.split(/[\s+&]/)[0];
    if (domainKeyword && deptNorm.includes(domainKeyword)) {
      interestScore = 60;
      positiveReasons.push(`✓ Academic background (${student.department}) relates to project domain`);
    } else {
      interestScore = 30;
      warningReasons.push(
        `⚠ General interest profile; no specialized track listed in ${project.domain}`
      );
    }
  }

  // ==========================================
  // 3. Availability Compatibility (Weight: 15%)
  // ==========================================
  const reqHours = project.weeklyCommitment || 10;
  const studentHours = student.weeklyAvailability || 0;
  let availabilityScore = 0;
  let availabilityComparison = "";

  if (studentHours >= reqHours) {
    availabilityScore = 100;
    const surplus = studentHours - reqHours;
    if (surplus === 0) {
      positiveReasons.push(
        `✓ Availability (${studentHours} hrs/wk) exactly matches required commitment (${reqHours} hrs/wk)`
      );
      availabilityComparison = `${studentHours}h / ${reqHours}h (Meets goal)`;
    } else {
      positiveReasons.push(
        `✓ Availability (${studentHours} hrs/wk) exceeds required ${reqHours} hrs/wk (+${surplus}h surplus)`
      );
      availabilityComparison = `${studentHours}h / ${reqHours}h (+${surplus}h surplus)`;
    }
  } else {
    // Proportional calculation for lower availability
    const ratio = studentHours / reqHours;
    availabilityScore = Math.min(100, Math.max(0, Math.round(ratio * 100)));
    const shortfall = reqHours - studentHours;

    if (ratio >= 0.8) {
      positiveReasons.push(
        `✓ Availability (${studentHours} hrs/wk) is close to commitment target (${reqHours} hrs/wk)`
      );
      availabilityComparison = `${studentHours}h / ${reqHours}h (-${shortfall}h gap)`;
    } else {
      warningReasons.push(
        `⚠ Available ${studentHours} hrs/wk (project requires ${reqHours} hrs/wk, -${shortfall}h shortfall)`
      );
      availabilityComparison = `${studentHours}h / ${reqHours}h (-${shortfall}h shortfall)`;
    }
  }

  // ==========================================
  // 4. Experience Level Compatibility (Weight: 15%)
  // ==========================================
  let experienceScore = 0;
  const projectExpVal =
    project.experienceRequired === "Any"
      ? 2
      : EXPERIENCE_HIERARCHY[project.experienceRequired] || 2;
  const studentExpVal = EXPERIENCE_HIERARCHY[student.experienceLevel] || 2;

  if (studentExpVal >= projectExpVal) {
    experienceScore = 100;
    positiveReasons.push(
      `✓ Experience level (${student.experienceLevel}) meets or exceeds project requirement (${project.experienceRequired})`
    );
  } else if (studentExpVal === projectExpVal - 1) {
    experienceScore = 70;
    warningReasons.push(
      `⚠ Project seeks ${project.experienceRequired} experience, candidate is ${student.experienceLevel}`
    );
  } else if (studentExpVal === projectExpVal - 2) {
    experienceScore = 40;
    warningReasons.push(
      `⚠ Experience gap: Project seeks ${project.experienceRequired}, candidate is ${student.experienceLevel}`
    );
  } else {
    experienceScore = 20;
    warningReasons.push(
      `⚠ Significant experience difference (${student.experienceLevel} vs required ${project.experienceRequired})`
    );
  }

  // Inspect student's previous projects strictly from their real portfolio
  const relevantProjects = student.previousProjects.filter((p) =>
    p.tech.some((t) =>
      project.requiredSkills.some((rs) => matchesSkill(t, rs)) ||
      project.preferredSkills.some((ps) => matchesSkill(t, ps))
    )
  );
  if (relevantProjects.length > 0) {
    positiveReasons.push(
      `✓ Shipped relevant past project: "${relevantProjects[0].title}"`
    );
  }

  // ==========================================
  // 5. Role Complementarity (Weight: 10%)
  // ==========================================
  let roleScore = 0;
  let roleFit = student.preferredRoles[0] || "General Contributor";

  const matchingRole = project.requiredRoles.find((reqRole) =>
    student.preferredRoles.some((pr) => matchesRole(pr, reqRole))
  );

  if (matchingRole) {
    roleScore = 100;
    roleFit = matchingRole;
    positiveReasons.push(`✓ Preferred role "${matchingRole}" fulfills open project role requirement`);
  } else {
    // Partial role match check
    const partialRole = project.requiredRoles.find((reqRole) =>
      student.preferredRoles.some((pr) =>
        normalize(pr).includes(normalize(reqRole)) ||
        normalize(reqRole).includes(normalize(pr))
      )
    );
    if (partialRole) {
      roleScore = 75;
      roleFit = partialRole;
      positiveReasons.push(`✓ Candidate skills complement desired role: ${partialRole}`);
    } else {
      roleScore = 30;
      warningReasons.push(
        `⚠ Preferred roles (${student.preferredRoles.join(", ")}) differ from project targets (${project.requiredRoles.join(", ")})`
      );
    }
  }

  // ==========================================
  // Final Overall Deterministic Weighted Score
  // Skills: 40%, Interest: 20%, Availability: 15%, Experience: 15%, Role: 10%
  // ==========================================
  const rawWeightedScore =
    skillScore * 0.40 +
    interestScore * 0.20 +
    availabilityScore * 0.15 +
    experienceScore * 0.15 +
    roleScore * 0.10;

  const overallScore = Math.min(100, Math.max(0, Math.round(rawWeightedScore)));

  return {
    overallScore,
    breakdown: {
      skillScore,
      interestScore,
      availabilityScore,
      experienceScore,
      roleScore,
    },
    positiveReasons: positiveReasons.slice(0, 5),
    warningReasons: warningReasons.slice(0, 3),
    matchingSkills: Array.from(new Set([...matchedRequiredSkills, ...matchedPreferredSkills])),
    missingRequiredSkills,
    matchingPreferredSkills: matchedPreferredSkills,
    sharedInterests,
    roleFit,
    availabilityComparison,
  };
}

/**
 * Calculates Team Gap Analysis for a project given currently selected members
 */
export function calculateTeamGapAnalysis(
  project: Project,
  selectedStudents: StudentProfile[],
  allAvailableStudents: StudentProfile[]
): TeamGapAnalysis {
  // Aggregate covered and missing project skills
  const coveredSkills: { skill: string; coveredBy: string[]; isRequired: boolean }[] = [];
  const missingSkills: { skill: string; isRequired: boolean }[] = [];

  project.requiredSkills.forEach((reqSkill) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (st.skills.some((sk) => matchesSkill(sk, reqSkill))) {
        matchingMembers.push(st.name);
      }
    });

    if (matchingMembers.length > 0) {
      coveredSkills.push({
        skill: reqSkill,
        coveredBy: Array.from(new Set(matchingMembers)),
        isRequired: true,
      });
    } else {
      missingSkills.push({ skill: reqSkill, isRequired: true });
    }
  });

  project.preferredSkills.forEach((prefSkill) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (st.skills.some((sk) => matchesSkill(sk, prefSkill))) {
        matchingMembers.push(st.name);
      }
    });

    if (matchingMembers.length > 0) {
      coveredSkills.push({
        skill: prefSkill,
        coveredBy: Array.from(new Set(matchingMembers)),
        isRequired: false,
      });
    } else {
      missingSkills.push({ skill: prefSkill, isRequired: false });
    }
  });

  // Aggregate covered and missing project roles
  const coveredRoles: { role: string; coveredBy: string[] }[] = [];
  const missingRoles: string[] = [];

  project.requiredRoles.forEach((reqRole) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (st.preferredRoles.some((ro) => matchesRole(ro, reqRole))) {
        matchingMembers.push(st.name);
      }
    });

    if (matchingMembers.length > 0) {
      coveredRoles.push({
        role: reqRole,
        coveredBy: Array.from(new Set(matchingMembers)),
      });
    } else {
      missingRoles.push(reqRole);
    }
  });

  // Calculate completeness score strictly from actual required skills, required roles, and team size
  const totalRequiredSkills = project.requiredSkills.length || 1;
  const coveredReqSkills = coveredSkills.filter((s) => s.isRequired).length;
  const skillRatio = Math.min(1, coveredReqSkills / totalRequiredSkills);

  const totalRoles = project.requiredRoles.length || 1;
  const coveredRolesCount = coveredRoles.length;
  const roleRatio = Math.min(1, coveredRolesCount / totalRoles);

  const targetSize = project.requiredTeamSize || 4;
  const sizeRatio = Math.min(1, selectedStudents.length / targetSize);

  // Weighted Team Coverage: Skills 50%, Roles 35%, Size 15%
  const completenessScore = Math.min(
    100,
    Math.round((skillRatio * 0.50 + roleRatio * 0.35 + sizeRatio * 0.15) * 100)
  );

  // Generate strategic summary: NEVER recommends a role or skill that is already covered
  let recommendationSummary = "";
  const missingReqSkills = missingSkills.filter((s) => s.isRequired).map((s) => s.skill);

  if (selectedStudents.length === 0) {
    recommendationSummary = `Team roster is currently empty. Start by recruiting a lead ${project.requiredRoles[0] || "Engineer"} with core skills in ${project.requiredSkills.slice(0, 2).join(" and ")}.`;
  } else if (missingRoles.length === 0 && missingReqSkills.length === 0) {
    recommendationSummary =
      `All required roles (${coveredRoles.map((r) => r.role).join(", ")}) and technical skills are fully covered by your current roster! Ready for project kickoff.`;
  } else if (missingRoles.length === 0 && missingReqSkills.length > 0) {
    recommendationSummary =
      `All required roles are filled by selected team members, but the squad still has open technical skill gaps: ${missingReqSkills.join(", ")}.`;
  } else if (missingRoles.length > 0 && missingReqSkills.length === 0) {
    recommendationSummary =
      `Required technical skills are covered, but your team still requires a dedicated ${missingRoles.join(" or ")} to complete target role distribution.`;
  } else {
    const coveredNames = coveredSkills.filter((s) => s.isRequired).map((s) => s.skill).slice(0, 3).join(", ");
    recommendationSummary =
      `Your team covers ${coveredNames || "core areas"} (${coveredRoles.map((r) => r.role).join(", ") || "initial roles"}), but still lacks ${missingReqSkills.slice(0, 2).join(" & ") || "required skills"} and needs a candidate for ${missingRoles.join(" / ")}.`;
  }

  // Find best next candidate recommendations to fill the ACTUAL gaps
  const unselectedCandidates = allAvailableStudents.filter(
    (st) => !selectedStudents.some((sel) => sel.id === st.id)
  );

  const bestNextCandidates = unselectedCandidates
    .map((candidate) => {
      const match = calculateStudentMatch(candidate, project);
      const fillsMissingSkills: string[] = [];
      const fillsMissingRoles: string[] = [];

      // Only check against actual missing skills
      missingSkills.forEach((ms) => {
        if (candidate.skills.some((sk) => matchesSkill(sk, ms.skill))) {
          fillsMissingSkills.push(ms.skill);
        }
      });

      // Only check against actual missing roles
      missingRoles.forEach((mr) => {
        if (candidate.preferredRoles.some((ro) => matchesRole(ro, mr))) {
          fillsMissingRoles.push(mr);
        }
      });

      // Impact score prioritizes filling missing skills and missing roles
      const gapImpact = fillsMissingSkills.length * 35 + fillsMissingRoles.length * 40;
      const impactScore = Math.min(100, Math.round(gapImpact + match.overallScore * 0.25));

      return {
        student: candidate,
        fillsMissingSkills,
        fillsMissingRoles,
        impactScore,
        matchScore: match.overallScore,
      };
    })
    .filter(
      (item) =>
        item.fillsMissingSkills.length > 0 ||
        item.fillsMissingRoles.length > 0 ||
        item.matchScore >= 70
    )
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  return {
    teamSize: selectedStudents.length,
    targetTeamSize: targetSize,
    coveredSkills,
    missingSkills,
    coveredRoles,
    missingRoles,
    completenessScore,
    recommendationSummary,
    bestNextCandidates,
  };
}
