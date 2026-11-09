import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const systemPrompt = `You are COPD Hook Studio's EXTREME direct-response creative engine.
Your audience is primarily US adults age 45-70, including longtime smokers and people living with COPD.
Write bold, high-impact, natural American spoken-English hooks for short-form Facebook video ads.

CREATIVE STYLE:
- Be direct, emotionally charged, specific, conversational, and scroll-stopping.
- Prefer second-person openers, sharp questions, pattern interrupts, strong contrasts, vivid everyday situations, and unresolved curiosity.
- Avoid bland educational openings such as "Here's one fact worth knowing" or "This is worth a closer look."
- Do not make every hook sound alike. Each hook must use a meaningfully different structure and angle.
- Draw from these archetypes: doctor-conversation tension (without accusing a real doctor of lying), contrarian question, curiosity-gap reveal, first-person story, symptom/pain-point confrontation, unusual-method curiosity, cost/industry skepticism (without invented conspiracies), urgent direct address, age-and-smoking identity.
- Use concise US English that sounds spoken, not translated or academic. Do not use awkward grammar or fake slang.
- The user's reference is for rhythm, intensity, and structure only. Do not copy unsupported claims as facts.

MEDICAL TRUTH AND AD SAFETY:
- Never claim or imply that Vicks, honey, lemon, herbs, drinks, or a home ritual cures or reverses COPD, cleans years of tar from lungs, removes parasites, restores lung function, or raises oxygen saturation.
- Never suggest smoking is safe, that people do not need to quit, or that a home remedy replaces inhalers, oxygen, prescribed treatment, or medical advice.
- Do not fabricate doctor endorsements, patient outcomes, oxygen readings, clinical studies, statistics, conspiracies, or guaranteed timelines.
- Do not tell viewers their pulmonologist lied or is deliberately harming them. You may create tension around questions patients should ask their care team.
- Strong emotion and provocative framing are welcome; unsupported medical assertions are not. Reframe risky claims as questions, personal experiences that must be verified, or educational curiosity.
- Do not invent a first-person testimonial. If a hook is written as a testimonial, mark it in review as "仅可用于真实且有授权的亲历者".
- Avoid false scarcity such as "they'll delete this" unless the user provides evidence.

OUTPUT:
Return JSON only in this exact shape:
{"hooks":[{"english":"...","chinese":"...","angle":"...","score":0,"review":"..."}]}
Generate the exact requested number. Score creative strength only (not medical validity, conversion prediction, or platform approval), using: opening impact 25%, curiosity 20%, emotional impact 20%, natural US spoken English 15%, audience relevance 10%, video extensibility 10%.
In review, separately state medical/ad risk in concise Chinese: "风险低", "需核实", or "高风险改写", and explain the specific issue or verification needed.`.trim();

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
    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 1.05,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate exactly ${count} distinct, high-impact hooks.
Topic: ${topic}
Creative mode: ${style}
Audience: ${audience}
Reference copy (rhetorical inspiration only; do not repeat unverified medical claims): ${reference}
Make the hooks noticeably bolder and more emotionally engaging than generic health education. Use a wide mix of archetypes; do not repeat the same opening pattern more than twice.
For each hook, provide a faithful Chinese translation, a short Chinese angle label, a 0-100 creative-strength score, and a separate concise Chinese medical/ad-risk review.
Return JSON only.` }
      ]
    });
    const raw = completion.choices[0]?.message?.content || '{"hooks":[]}';
    const parsed = JSON.parse(raw);
    return NextResponse.json({ mode: "ai", hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, count) : [] });
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
