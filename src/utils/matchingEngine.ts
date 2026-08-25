import {
  StudentProfile,
  Project,
  MatchExplanation,
  CandidateMatch,
  TeamGapAnalysis,
  TeamHealthScore,
  TeamHealthBreakdown,
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
 * Checks if a candidate's skill matches a project skill (exact or close keyword / synonym)
 */
export function matchesSkill(candidateSkill: string, targetSkill: string): boolean {
  if (!candidateSkill || !targetSkill) return false;
  const c = normalize(candidateSkill);
  const t = normalize(targetSkill);
  if (c === t) return true;
  if (c.includes(t) || t.includes(c)) return true;

  // TypeScript / JavaScript
  if ((c === "js" || c === "javascript") && (t === "typescript" || t === "ts")) return true;
  if ((t === "js" || t === "javascript") && (c === "typescript" || c === "ts")) return true;

  // UI / UX / Figma / Product Design
  const isC_Design = c.includes("ui") || c.includes("ux") || c.includes("figma") || c.includes("product design") || c.includes("design");
  const isT_Design = t.includes("ui") || t.includes("ux") || t.includes("figma") || t.includes("product design") || t.includes("design");
  if (isC_Design && isT_Design) return true;

  // Machine Learning / Deep Learning / PyTorch / TensorFlow / AI
  if ((c === "deep learning" || c === "machine learning" || c === "ml" || c === "ai") &&
      (t === "pytorch" || t === "tensorflow" || t === "deep learning" || t === "machine learning" || t === "ml")) return true;
  if ((t === "deep learning" || t === "machine learning" || t === "ml" || t === "ai") &&
      (c === "pytorch" || c === "tensorflow" || c === "deep learning" || c === "machine learning" || c === "ml")) return true;

  // NLP / Natural Language Processing
  if ((c === "nlp" || c.includes("natural language") || c.includes("llm")) &&
      (t === "nlp" || t.includes("natural language") || t.includes("llm"))) return true;

  // Computer Vision / CV / OpenCV / Image Processing
  if ((c === "cv" || c.includes("computer vision") || c.includes("opencv") || c.includes("image")) &&
      (t === "cv" || t.includes("computer vision") || t.includes("opencv") || t.includes("image"))) return true;

  // Cybersecurity / Security / Threat Detection / SIEM / Network Security
  const isC_Sec = c.includes("cyber") || c.includes("security") || c.includes("threat") || c.includes("siem");
  const isT_Sec = t.includes("cyber") || t.includes("security") || t.includes("threat") || t.includes("siem");
  if (isC_Sec && isT_Sec) return true;

  // Cloud / Backend / Infrastructure
  if ((c.includes("cloud") || c.includes("aws") || c.includes("gcp") || c.includes("azure") || c.includes("devops") || c.includes("docker") || c.includes("kubernetes")) &&
      (t.includes("cloud") || t.includes("aws") || t.includes("gcp") || t.includes("azure") || t.includes("devops") || t.includes("docker") || t.includes("kubernetes"))) return true;

  // PostgreSQL / SQL / Databases
  if ((c === "postgres" || c === "postgresql" || c === "sql") &&
      (t === "postgres" || t === "postgresql" || t === "sql")) return true;

  // Smart Contracts / Solidity / Web3 / Blockchain
  if ((c.includes("solidity") || c.includes("smart contract") || c.includes("blockchain") || c.includes("web3")) &&
      (t.includes("solidity") || t.includes("smart contract") || t.includes("blockchain") || t.includes("web3"))) return true;

  // Robotics / ROS / Embedded
  if ((c.includes("robotics") || c.includes("ros") || c.includes("embedded") || c.includes("hardware")) &&
      (t.includes("robotics") || t.includes("ros") || t.includes("embedded") || t.includes("hardware"))) return true;

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

  // ML / AI / Computer Vision / NLP variations (Engineer, Specialist, Lead, Researcher, Analyst)
  const isC_ML = cleanC.includes("ml") || cleanC.includes("ai") || cleanC.includes("machine learning") || cleanC.includes("computer vision") || cleanC.includes("nlp") || cleanC.includes("data scientist");
  const isT_ML = cleanT.includes("ml") || cleanT.includes("ai") || cleanT.includes("machine learning") || cleanT.includes("computer vision") || cleanT.includes("nlp") || cleanT.includes("data scientist");
  if (isC_ML && isT_ML) {
    // If both are ML/AI domain roles
    if (cleanC.includes("computer vision") && cleanT.includes("computer vision")) return true;
    if (cleanC.includes("nlp") && cleanT.includes("nlp")) return true;
    if (!cleanT.includes("computer vision") && !cleanT.includes("nlp")) return true;
    if (!cleanC.includes("computer vision") && !cleanC.includes("nlp")) return true;
    return true;
  }

  // Data Scientist / Data Analyst / Data Engineer
  if (cleanC.includes("data") && cleanT.includes("data")) return true;

  // Cybersecurity / Security variations (Analyst, Engineer, Auditor, Specialist)
  const isC_Sec = cleanC.includes("cyber") || cleanC.includes("security") || cleanC.includes("threat") || cleanC.includes("auditor");
  const isT_Sec = cleanT.includes("cyber") || cleanT.includes("security") || cleanT.includes("threat") || cleanT.includes("auditor");
  if (isC_Sec && isT_Sec) return true;

  // Full-Stack covers Frontend and Backend
  if (cleanC.includes("full stack") || cleanC.includes("full-stack")) {
    if (cleanT.includes("frontend") || cleanT.includes("backend") || cleanT.includes("developer") || cleanT.includes("engineer") || cleanT.includes("lead developer")) return true;
  }

  // Frontend variations
  if ((cleanC.includes("frontend") || cleanC.includes("front end") || cleanC.includes("web developer")) &&
      (cleanT.includes("frontend") || cleanT.includes("front end") || cleanT.includes("web developer"))) return true;

  // Backend / Cloud / DevOps variations
  if ((cleanC.includes("backend") || cleanC.includes("back end") || cleanC.includes("cloud") || cleanC.includes("devops") || cleanC.includes("infrastructure")) &&
      (cleanT.includes("backend") || cleanT.includes("back end") || cleanT.includes("cloud") || cleanT.includes("devops") || cleanT.includes("infrastructure"))) return true;

  // Designer variations (UI/UX, Product Designer)
  if ((cleanC.includes("ui") || cleanC.includes("ux") || cleanC.includes("design")) &&
      (cleanT.includes("ui") || cleanT.includes("ux") || cleanT.includes("design"))) return true;

  // Smart Contract / Web3 / Blockchain variations
  if ((cleanC.includes("smart contract") || cleanC.includes("web3") || cleanC.includes("solidity") || cleanC.includes("blockchain")) &&
      (cleanT.includes("smart contract") || cleanT.includes("web3") || cleanT.includes("blockchain") || cleanT.includes("solidity"))) return true;

  // Robotics / Embedded / IoT variations
  if ((cleanC.includes("robotics") || cleanC.includes("embedded") || cleanC.includes("hardware") || cleanC.includes("iot")) &&
      (cleanT.includes("robotics") || cleanT.includes("embedded") || cleanT.includes("hardware") || cleanT.includes("iot"))) return true;

  return false;
}

/**
 * Checks if a specific student possesses or covers a target skill
 */
export function studentCoversSkill(student: StudentProfile, targetSkill: string): boolean {
  if (student.skills.some((sk) => matchesSkill(sk, targetSkill))) return true;
  if (student.previousProjects.some((p) => p.tech.some((t) => matchesSkill(t, targetSkill)))) return true;
  return false;
}

/**
 * Checks if a specific student possesses or covers a target role
 */
export function studentCoversRole(student: StudentProfile, targetRole: string): boolean {
  if (student.preferredRoles.some((ro) => matchesRole(ro, targetRole))) return true;
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
    if (studentCoversSkill(student, reqSkill)) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  });

  const matchedPreferredSkills: string[] = [];
  project.preferredSkills.forEach((prefSkill) => {
    if (studentCoversSkill(student, prefSkill)) {
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
      (normInterest.includes("cyber") && projectDomainNorm.includes("cyber")) ||
      (normInterest.includes("security") && projectDomainNorm.includes("security")) ||
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
  let reqHours = project.weeklyCommitment || 0;
  if (!reqHours && project.availabilityRequirement) {
    const numMatch = project.availabilityRequirement.match(/(\d+)/);
    if (numMatch) {
      reqHours = parseInt(numMatch[1], 10);
    }
  }
  if (!reqHours) reqHours = 10;

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
 * Compares against actual skills and roles of ALL currently selected members
 */
export function calculateTeamGapAnalysis(
  project: Project,
  selectedStudents: StudentProfile[],
  allAvailableStudents: StudentProfile[]
): TeamGapAnalysis {
  // 1. Aggregate covered and missing project skills
  const coveredSkills: { skill: string; coveredBy: string[]; isRequired: boolean }[] = [];
  const missingSkills: { skill: string; isRequired: boolean }[] = [];

  // Check required skills against all selected members
  project.requiredSkills.forEach((reqSkill) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (studentCoversSkill(st, reqSkill)) {
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

  // Check preferred skills against all selected members
  project.preferredSkills.forEach((prefSkill) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (studentCoversSkill(st, prefSkill)) {
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

  // 2. Aggregate covered and missing project roles against all selected members
  const coveredRoles: { role: string; coveredBy: string[] }[] = [];
  const missingRoles: string[] = [];

  project.requiredRoles.forEach((reqRole) => {
    const matchingMembers: string[] = [];
    selectedStudents.forEach((st) => {
      if (studentCoversRole(st, reqRole)) {
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

  // 3. Calculate completeness score strictly from actual required skills, required roles, and team size
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

  // 4. Generate strategic AI Team Advisor summary:
  // ONLY recommends roles or skills that are genuinely missing from the selected team
  let recommendationSummary = "";
  const missingReqSkills = missingSkills.filter((s) => s.isRequired).map((s) => s.skill);

  if (selectedStudents.length === 0) {
    recommendationSummary = `Team roster is currently empty. Start by recruiting a lead ${project.requiredRoles[0] || "Engineer"} with core skills in ${project.requiredSkills.slice(0, 2).join(" and ")}.`;
  } else if (missingRoles.length === 0 && missingReqSkills.length === 0) {
    recommendationSummary =
      `All required roles (${coveredRoles.map((r) => r.role).join(", ")}) and technical skills are fully covered by your current roster! Ready for project kickoff.`;
  } else if (missingRoles.length === 0 && missingReqSkills.length > 0) {
    recommendationSummary =
      `All required roles (${coveredRoles.map((r) => r.role).join(", ")}) are covered by selected team members, but the squad still has open skill gaps in: ${missingReqSkills.join(", ")}.`;
  } else if (missingRoles.length > 0 && missingReqSkills.length === 0) {
    recommendationSummary =
      `All required technical skills are covered! To complete the squad structure, recruit for open role${missingRoles.length > 1 ? "s" : ""}: ${missingRoles.join(" or ")}.`;
  } else {
    const coveredNames = coveredSkills.filter((s) => s.isRequired).map((s) => s.skill).slice(0, 3).join(", ");
    recommendationSummary =
      `Your team covers ${coveredNames || "core areas"} (${coveredRoles.map((r) => r.role).join(", ") || "initial roles"}), but still needs a candidate for open role${missingRoles.length > 1 ? "s" : ""}: ${missingRoles.join(" / ")} and open skill${missingReqSkills.length > 1 ? "s" : ""}: ${missingReqSkills.slice(0, 2).join(" & ")}.`;
  }

  // 5. Find best next candidate recommendations to fill the ACTUAL gaps
  const unselectedCandidates = allAvailableStudents.filter(
    (st) => !selectedStudents.some((sel) => sel.id === st.id)
  );

  const bestNextCandidates = unselectedCandidates
    .map((candidate) => {
      const match = calculateStudentMatch(candidate, project);
      const fillsMissingSkills: string[] = [];
      const fillsMissingRoles: string[] = [];

      // ONLY check against actual missing skills (which are not covered by any selected team member)
      missingSkills.forEach((ms) => {
        if (studentCoversSkill(candidate, ms.skill)) {
          fillsMissingSkills.push(ms.skill);
        }
      });

      // ONLY check against actual missing roles (which are not covered by any selected team member)
      missingRoles.forEach((mr) => {
        if (studentCoversRole(candidate, mr)) {
          fillsMissingRoles.push(mr);
        }
      });

      // Impact score prioritizes filling genuinely missing skills and missing roles
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
        (missingSkills.length === 0 && missingRoles.length === 0 && item.matchScore >= 60)
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

/**
 * Returns a grounded explanation of why a missing role is required for the project
 */
export function getRoleRequirementReason(role: string, project: Project): string {
  const normRole = normalize(role);
  const normDomain = normalize(project.domain);

  if (normRole.includes("ui") || normRole.includes("ux") || normRole.includes("design")) {
    return `Needed to design intuitive user workflows, wireframes, and responsive component interfaces for ${project.title}.`;
  }
  if (normRole.includes("cyber") || normRole.includes("security") || normRole.includes("threat") || normRole.includes("analyst")) {
    return `Needed to lead threat modeling, intrusion telemetry, vulnerability assessment, and pipeline hardening.`;
  }
  if (normRole.includes("ml") || normRole.includes("ai") || normRole.includes("vision") || normRole.includes("nlp") || normRole.includes("data scientist")) {
    return `Needed to architect, train, fine-tune, and deploy predictive ML/AI pipelines powering core intelligence features.`;
  }
  if (normRole.includes("backend") || normRole.includes("cloud") || normRole.includes("devops") || normRole.includes("infrastructure")) {
    return `Needed to construct scalable REST/GraphQL APIs, database persistence, and robust cloud services.`;
  }
  if (normRole.includes("frontend") || normRole.includes("web developer") || normRole.includes("full stack")) {
    return `Needed to build interactive client-side components, state management, and seamless API integrations.`;
  }
  if (normRole.includes("smart contract") || normRole.includes("blockchain") || normRole.includes("web3") || normRole.includes("solidity")) {
    return `Needed to develop, deploy, and verify secure smart contracts and decentralized protocol interactions.`;
  }
  if (normRole.includes("robotics") || normRole.includes("embedded") || normRole.includes("hardware") || normRole.includes("iot")) {
    return `Needed for micro-controller firmware programming, sensor telemetry, and hardware integration.`;
  }
  if (normRole.includes("product") || normRole.includes("lead")) {
    return `Needed to orchestrate agile sprint milestones, feature scoping, and inter-functional team delivery.`;
  }

  return `Essential to fulfill the project's ${role} requirement and drive core milestone deliverables in ${project.domain}.`;
}

/**
 * Calculates Team Health Score (0-100) based on 5 weighted pillars:
 * - Skill Coverage: 35%
 * - Role Coverage: 20%
 * - Availability Compatibility: 15%
 * - Experience Balance: 15%
 * - Domain/Interest Alignment: 15%
 */
export function calculateTeamHealthScore(
  project: Project,
  selectedStudents: StudentProfile[],
  gapAnalysis: TeamGapAnalysis
): TeamHealthScore {
  if (selectedStudents.length === 0) {
    return {
      overallScore: 0,
      breakdown: {
        skillCoverage: 0,
        roleCoverage: 0,
        availabilityCompatibility: 0,
        experienceBalance: 0,
        domainAlignment: 0,
      },
      aiInsight: "Select team members to evaluate squad synergy, technical coverage, and operational balance.",
    };
  }

  // 1. Skill Coverage (35%)
  const totalReqSkills = project.requiredSkills.length || 1;
  const coveredReqSkills = gapAnalysis.coveredSkills.filter((s) => s.isRequired).length;
  const reqRatio = coveredReqSkills / totalReqSkills;
  let skillCoverage = 0;
  if (project.preferredSkills.length > 0) {
    const coveredPrefSkills = gapAnalysis.coveredSkills.filter((s) => !s.isRequired).length;
    const prefRatio = coveredPrefSkills / project.preferredSkills.length;
    skillCoverage = Math.round((reqRatio * 0.85 + prefRatio * 0.15) * 100);
  } else {
    skillCoverage = Math.round(reqRatio * 100);
  }
  skillCoverage = Math.min(100, Math.max(0, skillCoverage));

  // 2. Role Coverage (20%)
  const totalRoles = project.requiredRoles.length || 1;
  const coveredRoles = gapAnalysis.coveredRoles.length;
  const roleCoverage = Math.min(100, Math.max(0, Math.round((coveredRoles / totalRoles) * 100)));

  // 3. Availability Compatibility (15%)
  let reqHours = project.weeklyCommitment || 0;
  if (!reqHours && project.availabilityRequirement) {
    const numMatch = project.availabilityRequirement.match(/(\d+)/);
    if (numMatch) reqHours = parseInt(numMatch[1], 10);
  }
  if (!reqHours) reqHours = 10;

  const totalAvailScores = selectedStudents.map((st) => {
    const hours = st.weeklyAvailability || 0;
    if (hours >= reqHours) return 100;
    return Math.min(100, Math.max(0, Math.round((hours / reqHours) * 100)));
  });
  const availabilityCompatibility = Math.round(
    totalAvailScores.reduce((a, b) => a + b, 0) / selectedStudents.length
  );

  // 4. Experience Balance (15%)
  const targetExpVal =
    project.experienceRequired === "Any"
      ? 2
      : EXPERIENCE_HIERARCHY[project.experienceRequired] || 2;

  const expScores = selectedStudents.map((st) => {
    const sVal = EXPERIENCE_HIERARCHY[st.experienceLevel] || 2;
    if (sVal >= targetExpVal) return 100;
    if (sVal === targetExpVal - 1) return 75;
    return 50;
  });
  const experienceBalance = Math.round(
    expScores.reduce((a, b) => a + b, 0) / selectedStudents.length
  );

  // 5. Domain/Interest Alignment (15%)
  const projectDomainNorm = normalize(project.domain);
  const domainScores = selectedStudents.map((st) => {
    let domainPoints = 40;
    const matchingInterests = st.interests.filter((i) => {
      const nI = normalize(i);
      return (
        nI.includes(projectDomainNorm) ||
        projectDomainNorm.includes(nI) ||
        (nI.includes("ai") && projectDomainNorm.includes("ai")) ||
        (nI.includes("climate") && projectDomainNorm.includes("climate")) ||
        (nI.includes("health") && projectDomainNorm.includes("health")) ||
        (nI.includes("web3") && projectDomainNorm.includes("web3")) ||
        (nI.includes("cyber") && projectDomainNorm.includes("cyber")) ||
        (nI.includes("security") && projectDomainNorm.includes("security"))
      );
    });

    if (matchingInterests.length >= 2) {
      domainPoints = 100;
    } else if (matchingInterests.length === 1) {
      domainPoints = 85;
    } else if (normalize(st.department).includes(projectDomainNorm.split(/[\s+&]/)[0])) {
      domainPoints = 65;
    }
    return domainPoints;
  });
  const domainAlignment = Math.round(
    domainScores.reduce((a, b) => a + b, 0) / selectedStudents.length
  );

  // Calculate overall weighted score:
  // Skill Coverage: 35%, Role Coverage: 20%, Availability: 15%, Experience Balance: 15%, Domain Alignment: 15%
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillCoverage * 0.35 +
        roleCoverage * 0.20 +
        availabilityCompatibility * 0.15 +
        experienceBalance * 0.15 +
        domainAlignment * 0.15
      )
    )
  );

  // Generate crisp AI-generated insight
  let aiInsight = "";
  if (gapAnalysis.missingRoles.length > 0) {
    aiInsight = `Strong technical coverage, but the team would benefit from a dedicated ${gapAnalysis.missingRoles[0]}.`;
  } else if (gapAnalysis.missingSkills.length > 0) {
    const missingReq = gapAnalysis.missingSkills.find((s) => s.isRequired);
    if (missingReq) {
      aiInsight = `Core team roles are filled, but the squad lacks specialized expertise in ${missingReq.skill}.`;
    } else {
      aiInsight = `Solid role distribution; adding coverage for bonus skill ${gapAnalysis.missingSkills[0].skill} would elevate execution.`;
    }
  } else if (availabilityCompatibility < 80) {
    aiInsight = `Full skill and role coverage, but team weekly hours are slightly below the target project commitment.`;
  } else if (experienceBalance < 80) {
    aiInsight = `High enthusiasm across the team; onboarding an advanced mentor would accelerate roadmap execution.`;
  } else if (overallScore >= 90) {
    aiInsight = `Exceptional squad balance with complete skill coverage, filled roles, and aligned availability.`;
  } else {
    aiInsight = `Well-balanced multidisciplinary team with solid baseline alignment across all project requirements.`;
  }

  return {
    overallScore,
    breakdown: {
      skillCoverage,
      roleCoverage,
      availabilityCompatibility,
      experienceBalance,
      domainAlignment,
    },
    aiInsight,
  };
}

/**
 * Ranks candidates for a project based on calculated match scores or chosen criteria
 */
export function rankCandidates(
  candidates: StudentProfile[],
  project: Project,
  options: {
    sortBy?: "score" | "availability" | "experience";
    minMatchScore?: number;
    roleFilter?: string;
    deptFilter?: string;
  } = {}
): CandidateMatch[] {
  const { sortBy = "score", minMatchScore = 0, roleFilter, deptFilter } = options;

  return candidates
    .map((student) => ({
      student,
      match: calculateStudentMatch(student, project),
    }))
    .filter(({ student, match }) => {
      if (minMatchScore > 0 && match.overallScore < minMatchScore) return false;
      if (roleFilter && roleFilter !== "ALL") {
        const hasRole = student.preferredRoles.some((r) => matchesRole(r, roleFilter));
        if (!hasRole) return false;
      }
      if (deptFilter && deptFilter !== "ALL") {
        if (!student.department.includes(deptFilter)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return b.match.overallScore - a.match.overallScore;
      } else if (sortBy === "availability") {
        return b.student.weeklyAvailability - a.student.weeklyAvailability;
      } else {
        const expOrder: Record<ExperienceLevel, number> = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
        return expOrder[b.student.experienceLevel] - expOrder[a.student.experienceLevel];
      }
    });
}
