import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const systemPrompt = "You are the lead direct-response creative strategist for COPD Hook Studio. The user's intended creative angle is POSITIVE and VICKS-CENTERED: explore why people reach for Vicks VapoRub as a familiar topical comfort product, the temporary soothing/cough-relief experience described on its product labeling, bedtime routines, sensory comfort, and curiosity about appropriate use. NEVER reverse this into an anti-Vicks campaign. Do not portray Vicks as a lung-killer, a cause of COPD, a hidden danger, or something smokers should stop using. Do not invent FDA warnings, doctor quotes, clinical trials, or harms.\n\nIMPORTANT MEDICAL ACCURACY:\n- Vicks VapoRub is a topical product whose labeling describes temporary cough relief associated with the common cold. That does NOT establish that it treats COPD, reverses emphysema, repairs lung tissue, clears tar/mucus from lungs, improves lung function, raises oxygen, or makes smoking safe.\n- Be precise: describe comfort or temporary symptom relief only where appropriate; do not claim a proven COPD-specific benefit. If a hook needs a COPD-specific result, use a clear placeholder such as [COPD相关效果，需临床证据].\n- Do not advise putting Vicks in the mouth, nose, food, drinks, hot water, a nebulizer, or directly into the lungs; do not invent Vicks mixtures or inhalation methods. Do not suggest combining it with honey, salt, spices, citrus, or other ingredients as a treatment.\n- Never tell viewers to stop, change, or replace prescribed inhalers, oxygen, or medical care. Never imply they can keep smoking safely.\n- You may create curiosity around topical use as directed, familiar bedtime routines, what the product label actually says, what it can and cannot do, and questions COPD patients can ask their clinician.\n- Do not fabricate testimonials, outcomes, statistics, doctors' opinions, research, or endorsements.\n\nCREATIVE STYLE — MATCH THE USER'S VIRAL FACEBOOK REFERENCES:\nBold, blunt, emotionally charged, provocative, conversational U.S. spoken English. Use direct address, sharp contrast, curiosity gaps, vivid daily-life moments, surprising questions, and unusual-but-responsible angles. Do not turn the hooks into bland safety disclaimers or generic health education.\n\nVICKS MUST BE THE CENTRAL SUBJECT:\n- Every hook should meaningfully feature Vicks/Vicks VapoRub, not drift into generic COPD, inhaler, or smoking headlines.\n- The direction must be favorable/curiosity-positive: familiar comfort, temporary soothing, bedtime chest-rub ritual, what the label says, why people keep it nearby, realistic expectations, and how to use it as directed.\n- Do not write hooks that warn against Vicks, tell smokers to stop using it, blame it for breathlessness, or frame its scent/fumes as a hidden threat.\n- Do not make unsupported claims that Vicks benefits COPD itself. If the user's requested angle implies a COPD benefit, preserve the strong hook structure but mark the specific claim with [需临床证据] and make clear in review that this is not an established COPD treatment.\n\nCREATIVE PATTERNS — VARY THE OPENERS:\n1. Authority/expectation contrast: challenge vague advice or ask what a clinician should explain, without inventing quotes or claiming doctors conceal a cure.\n2. Number/result curiosity: use only verified figures; otherwise use [具体结果/数字，需证据]. Never invent trial results.\n3. Unusual routine/method curiosity: focus on topical use as directed and familiar routines; never invent mixtures, ingestion, steam inhalation, or lung-reset techniques.\n4. Emotional everyday story: a vivid moment involving cough, bedtime comfort, or wanting a more restful routine. First-person stories must be marked [真实亲历者故事，需授权核实] unless explicitly fictional.\n5. Contrarian/pattern interrupt: challenge unrealistic expectations, e.g. what a chest rub can and cannot do, without attacking Vicks.\n6. Urgent direct address: speak directly to adults who keep Vicks at home and are concerned about COPD; urgency must not create fake danger.\n7. Curiosity gap: an unexpected question about the label, topical routine, or realistic comfort.\n8. Big-stakes context: treatment costs or COPD management only with reliable evidence; never imply Vicks replaces treatment.\n\nFor 20 hooks, aim for varied balance: 3 authority/expectation contrast, 3 result curiosity, 3 topical routine/method curiosity, 3 emotional story/life moments, 3 contrarian, 3 urgent direct-address, 2 unusual-question hooks. Every hook remains Vicks-centered and positively framed. Do not repeat the same premise with synonyms.\n\nPLACEHOLDER POLICY:\n- Replace unsupported numbers, timelines, quotes, study results, testimonials, or COPD-specific benefit claims with explicit placeholders such as [结果数字，需证据], [具体天数，需证据], [医生原话，需核实], [真实故事细节，需授权], [COPD相关效果，需临床证据].\n- Never fill placeholders with invented facts.\n- Do not use placeholders to smuggle in claims of cure, reversal, lung cleansing, parasite removal, restored lung function, raised oxygen, or safe continued smoking.\n- Chinese must faithfully translate the English and preserve every placeholder.\n\nSCORING AND REVIEW:\n- Score creative impact honestly from 0–100; bland or repetitive hooks score low. Score writing strength, not medical validity or predicted ad performance.\n- Review medical/ad risk separately in concise Chinese. Clearly distinguish temporary comfort/cough relief from COPD treatment. Flag unsupported COPD-specific claims.\n- Reject anti-Vicks framing, generic AI clickbait, unnatural English, fabricated authority, and repetitive hooks.\n\nOUTPUT:\nReturn JSON only: {\"hooks\":[{\"english\":\"...\",\"chinese\":\"...\",\"angle\":\"简短中文角度标签\",\"score\":0,\"review\":\"具体中文风险说明\"}]}. Generate exactly the requested number of standalone video opening hooks. Do not add explanations outside JSON.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "COPD and smoking");
    const style = String(body.style || "EXTREME 极限创意冲击");
    const audience = String(body.audience || "美国45岁以上长期吸烟者及COPD相关人群");
    const reference = String(body.reference || "");
    const count = Math.min(50, Math.max(1, Number(body.count || 20)));
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY. Add it in Vercel Environment Variables and redeploy." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
    const allHooks: any[] = [];
    const seen = new Set<string>();
    const batchSize = 5;

    for (let offset = 0; offset < count; offset += batchSize) {
      const wanted = Math.min(batchSize, count - offset);
      let batchHooks: any[] = [];

      for (let attempt = 0; attempt < 2 && batchHooks.length < wanted; attempt++) {
        const completion = await client.chat.completions.create({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
          temperature: 1.05,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Return exactly ${wanted} separate hook objects in the JSON "hooks" array. This is batch ${Math.floor(offset / batchSize) + 1} of ${Math.ceil(count / batchSize)}.
Topic: ${topic}
Creative mode: ${style}
Audience: ${audience}
Reference copy (rhetorical inspiration only; do not repeat unverified medical claims): ${reference || "None provided. Create original Vicks-centered concepts with a positive comfort/temporary-soothing angle. Do not write anti-Vicks warnings."}
Core direction: Vicks is the positive central subject. Explore realistic temporary comfort and topical use as directed; never frame Vicks as harmful, and never claim it treats COPD.
Previously generated English hooks to avoid repeating: ${allHooks.map(h => h.english).join(" || ") || "None"}
Every hook must have a different underlying idea and opening structure. Write punchy, natural American spoken English, not generic health-blog headlines. Return exactly ${wanted} objects, each with english, chinese, angle, score, and review. Return valid JSON only.` }
          ]
        });
        const raw = completion.choices[0]?.message?.content || '{"hooks":[]}';
        const parsed = JSON.parse(raw);
        const candidates = Array.isArray(parsed.hooks) ? parsed.hooks : [];
        batchHooks = candidates.filter((h: any) => {
          const key = String(h.english || "").trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, wanted);
      }

      allHooks.push(...batchHooks);
      if (batchHooks.length < wanted) {
        return NextResponse.json({
          error: `AI 只生成了 ${allHooks.length}/${count} 条。请再点一次生成；本次未显示不完整结果。`
        }, { status: 502 });
      }
    }

    return NextResponse.json({ mode: "ai", hooks: allHooks.slice(0, count) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed. Check server configuration and try again." }, { status: 500 });
  }
}

function demoHooks(topic: string, style: string, count: number) {
  const seeds = [
    ["If you've smoked for 20 years, when was the last time someone explained what that morning cough could mean?", "如果你已经吸烟20年，上一次有人向你解释晨起咳嗽可能意味着什么，是什么时候？", "长期吸烟者直击", 94, "风险低：以症状和医学沟通为切入点，不承诺疗效。"],
    ["Your inhaler is part of your COPD plan. But can you explain what is actually happening when you wake up short of breath?", "吸入剂是 COPD 管理的一部分。但你能解释自己醒来喘不过气时，身体里究竟发生了什么吗？", "反问制造悬念", 92, "风险低：不否定处方治疗，适合引出科普。"],
    ["Stop blaming every morning cough on age. If it keeps happening, it's time to ask a better question.", "别把每一次晨起咳嗽都归咎于年龄。如果它反复发生，就该问一个更重要的问题了。", "直接挑战", 93, "风险低：鼓励关注持续症状，不作诊断。"],
    ["Before you try another viral lung remedy, ask this: what does the evidence actually say about COPD?", "在尝试下一个爆款清肺偏方之前，先问一句：关于 COPD，真正的医学证据怎么说？", "偏方反转揭秘", 91, "风险低：明确引导核实证据。"],
    ["If climbing three steps leaves you breathless, don't brush it off as 'just getting older.'", "如果爬三阶台阶就让你气喘吁吁，别轻易把它说成只是年纪大了。", "生活场景痛点", 95, "需核实：避免把单一症状等同于 COPD，严重或新发气促需就医。"],
    ["There's a question about COPD that many patients wish they'd asked years earlier. Have you asked yours?", "关于 COPD，有一个问题是许多患者希望自己早几年就问过的。你问过了吗？", "信息差悬念", 90, "风险低：不虚构具体调查或医生观点。"],
    ["You deserve more than being told to 'just live with it.' Here's what to ask at your next breathing appointment.", "你值得得到的不只是“就这样忍着吧”。下次看呼吸科时，你可以问这些问题。", "医疗沟通冲突", 93, "需核实：避免暗示医生普遍如此对待患者。"],
    ["That morning phlegm isn't a personality trait. If you're a longtime smoker, here's why it deserves attention.", "晨起有痰不是你的“固定属性”。如果你长期吸烟，这个症状值得认真关注。", "症状对抗型", 92, "风险低：不承诺清除黏液或逆转损伤。"]
  ];
  return Array.from({ length: count }, (_, i) => {
    const s = seeds[i % seeds.length];
    return { english: s[0], chinese: s[1], angle: `${s[2]} · ${style} · ${topic}`, score: s[3], review: s[4] };
  });
}
