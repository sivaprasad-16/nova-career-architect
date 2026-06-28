import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getProvider() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function complete(system: string, prompt: string) {
  const provider = getProvider();
  const { text } = await generateText({
    model: provider(MODEL),
    system,
    prompt,
  });
  return text.trim();
}

/* ---------- Resume AI ---------- */

const SummaryInput = z.object({
  role: z.string().min(1),
  years: z.string().optional().default(""),
  skills: z.string().optional().default(""),
  highlights: z.string().optional().default(""),
});

export const generateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SummaryInput.parse(input))
  .handler(async ({ data }) => {
    const text = await complete(
      "You write concise, high-impact resume professional summaries. 3-4 sentences. No fluff. No first person.",
      `Write a professional summary for a ${data.role}. Years of experience: ${data.years || "n/a"}. Top skills: ${data.skills || "n/a"}. Notable highlights: ${data.highlights || "n/a"}.`,
    );
    return { text };
  });

const BulletsInput = z.object({
  role: z.string().min(1),
  company: z.string().optional().default(""),
  context: z.string().optional().default(""),
});

export const generateBullets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BulletsInput.parse(input))
  .handler(async ({ data }) => {
    const text = await complete(
      "You write ATS-friendly resume bullet points. Each bullet starts with a strong action verb, includes a measurable result, and is under 22 words. Return exactly 5 bullets, one per line, no numbering or dashes.",
      `Role: ${data.role}. Company: ${data.company}. Context: ${data.context}`,
    );
    const bullets = text.split(/\n+/).map((l) => l.replace(/^[-•\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5);
    return { bullets };
  });

const RewriteInput = z.object({ text: z.string().min(1) });

export const rewriteBullet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RewriteInput.parse(input))
  .handler(async ({ data }) => {
    const text = await complete(
      "Rewrite the user's resume bullet to be ATS-friendly: start with a strong action verb, add a measurable outcome if missing, keep under 22 words. Return only the rewritten bullet.",
      data.text,
    );
    return { text };
  });

/* ---------- Cover letter ---------- */

const CoverInput = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  tone: z.enum(["professional", "friendly", "enthusiastic", "confident"]).default("professional"),
  background: z.string().optional().default(""),
});

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CoverInput.parse(input))
  .handler(async ({ data }) => {
    const text = await complete(
      `You write tailored cover letters in a ${data.tone} tone. Structure: 4 short paragraphs — hook, why-them, why-you-with-proof, close with CTA. Plain text, no salutation placeholders like [Name].`,
      `Company: ${data.company}\nRole: ${data.role}\nCandidate background: ${data.background || "Not provided"}`,
    );
    return { text };
  });

/* ---------- Career match ---------- */

const MatchInput = z.object({
  resume: z.string().min(20),
  targetRole: z.string().min(1),
});

export const analyzeCareerMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data }) => {
    const text = await complete(
      `You are a career coach. Return STRICT JSON with keys: matchScore (0-100), strengths (string[]), missingSkills (string[]), nextSteps (string[]), salaryRange (string). No prose, no code fences.`,
      `Target role: ${data.targetRole}\n\nResume:\n${data.resume.slice(0, 4000)}`,
    );
    try {
      const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { matchScore: 0, strengths: [], missingSkills: [], nextSteps: [text], salaryRange: "—" };
    }
  });
