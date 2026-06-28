/** Lightweight client-side ATS scorer for live preview feedback. */
export type ResumeContent = {
  personal?: { name?: string; email?: string; phone?: string; location?: string; website?: string };
  summary?: string;
  experience?: Array<{ company: string; role: string; start?: string; end?: string; bullets: string[] }>;
  education?: Array<{ school: string; degree: string; start?: string; end?: string }>;
  projects?: Array<{ name: string; description: string; tech?: string }>;
  skills?: string[];
  certifications?: string[];
  achievements?: string[];
  languages?: string[];
};

const ACTION_VERBS = [
  "led","built","designed","launched","shipped","improved","reduced","increased","drove","architected",
  "owned","developed","implemented","optimized","automated","mentored","delivered","scaled","created","analyzed",
  "engineered","managed","spearheaded","resolved","accelerated","negotiated",
];

export function scoreResume(c: ResumeContent, jobKeywords: string[] = []) {
  const exp = c.experience ?? [];
  const allBullets = exp.flatMap((e) => e.bullets ?? []);
  const text = JSON.stringify(c).toLowerCase();

  // Formatting (25)
  let formatting = 0;
  if (c.personal?.email) formatting += 6;
  if (c.personal?.phone) formatting += 5;
  if (c.summary && c.summary.length > 60) formatting += 7;
  if ((c.skills?.length ?? 0) >= 6) formatting += 7;

  // Action verbs (25)
  const verbHits = allBullets.filter((b) => ACTION_VERBS.some((v) => b.toLowerCase().startsWith(v))).length;
  const actionVerbs = allBullets.length ? Math.round((verbHits / allBullets.length) * 25) : 0;

  // Quantified achievements (25)
  const quant = allBullets.filter((b) => /\d+%|\d+\s?(users|customers|hours|reqs|ms|x|k|m|\$)/i.test(b) || /\$\d/.test(b) || /\d{2,}/.test(b)).length;
  const quantified = allBullets.length ? Math.round((quant / allBullets.length) * 25) : 0;

  // Keyword coverage (25)
  const kw = jobKeywords.length ? jobKeywords : (c.skills ?? []);
  const matched = kw.filter((k) => text.includes(k.toLowerCase()));
  const keywords = kw.length ? Math.round((matched.length / kw.length) * 25) : 15;

  const total = Math.min(100, formatting + actionVerbs + quantified + keywords);

  const missing = kw.filter((k) => !text.includes(k.toLowerCase()));
  const suggestions: string[] = [];
  if (!c.summary || c.summary.length < 60) suggestions.push("Add a professional summary (3–4 sentences) at the top.");
  if (verbHits < allBullets.length) suggestions.push("Start every bullet with a strong action verb (Led, Shipped, Built…).");
  if (quant < allBullets.length) suggestions.push("Quantify outcomes with numbers, %, $, or scale.");
  if (missing.length) suggestions.push(`Add missing keywords: ${missing.slice(0, 8).join(", ")}.`);
  if ((c.skills?.length ?? 0) < 6) suggestions.push("List at least 6 relevant skills.");

  return {
    total,
    breakdown: { formatting, actionVerbs, quantified, keywords },
    missingKeywords: missing,
    suggestions,
  };
}
