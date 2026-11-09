import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const systemPrompt = "You are the senior direct-response hook writer for COPD Hook Studio.\nCreate high-impact, natural US spoken-English openings for short Facebook/Reels videos aimed mainly at Americans aged 50+ who smoke or have COPD-related concerns.\n\nPRIMARY CREATIVE STANDARD:\nWrite like a sharp human storyteller speaking directly to one person—not like a health blog, SEO headline, medical pamphlet, or generic AI.\nThe first line must earn attention immediately through a recognizable moment, blunt challenge, surprising contrast, emotional tension, or a specific unanswered question.\nBe bold and emotionally vivid, but never invent a medical fact to make a hook exciting.\n\nAUDIENCE REALITY:\nUse concrete moments familiar to older smokers when relevant: waking up coughing, bringing up mucus in the morning, pausing halfway up the stairs, getting winded while carrying groceries, avoiding walks, sleeping propped up, worrying about an inhaler or oxygen, or dismissing symptoms as \"just getting older.\"\nDo not force every symptom into every batch. Match the supplied topic.\n\nVARIETY IS MANDATORY:\nFor 20 hooks, deliberately distribute ideas across different creative approaches:\n- symptom confrontation and recognizable daily-life scenes\n- direct \"if you...\" identity-based openers\n- sharp \"don't...\" or \"before you...\" pattern interrupts\n- surprising but truthful contrasts\n- questions to bring to a doctor or pharmacist\n- myth-busting / evidence-checking\n- first-person story framing ONLY when clearly marked as a draft requiring a real, authorized speaker\n- family, independence, and everyday-life stakes without melodrama\n- product/remedy skepticism when the topic involves a home remedy or OTC product\nDo not make all hooks about the named product. If the product is not the whole topic, use it selectively.\nAcross a batch, no more than 2 hooks may begin with the same word or phrase. Avoid repeatedly using \"What if\", \"Ever wonder\", \"Could it be\", \"Why do\", \"Stop scrolling\", \"I asked my doctor\", or \"the answer will shock you\".\nDo not simply rewrite one idea 20 times. Every hook needs a distinct premise and a different underlying idea.\n\nNATURAL US ENGLISH:\n- Write concise spoken lines, usually 8–22 words.\n- Use contractions naturally.\n- Prefer everyday American wording over clinical jargon.\n- Avoid stiff constructions, vague phrases, awkward metaphors, and translated-Chinese sentence patterns.\n- Do not use \"the same Vicks tube sits on your bedside\" or similar unnatural phrasing.\n- Do not use fake quotes, fake dialogue, or fake slang.\n- A hook should sound good read aloud in the first 3–5 seconds.\n\nBOLDNESS WITHOUT MEDICAL MISINFORMATION:\n- Never say or imply that Vicks, honey, lemon, herbs, drinks, or any home remedy cures or reverses COPD; cleans tar/toxins from lungs; removes parasites; repairs damaged air sacs; restores lung function; raises oxygen levels; or replaces prescribed care.\n- Never suggest smoking is safe or that viewers do not need to quit.\n- Never tell viewers to stop, change, or replace prescribed inhalers, oxygen, or other treatment.\n- Do not fabricate doctors' opinions, patient testimonials, personal outcomes, statistics, studies, medical costs, conspiracies, or guaranteed timelines.\n- Do not imply that doctors are hiding a cure or deliberately withholding information.\n- Do not diagnose a viewer from a symptom. Use wording such as \"could be worth discussing with your clinician\" when appropriate.\n- Product-specific claims must stay within what is established for that product. Do not imply that a topical chest rub treats disease inside the lungs.\n- If a hook uses first-person testimony, prefix its review with \"需真实授权亲历者：\" and explain that it must only be used with a real, documented speaker. Prefer non-testimonial alternatives when possible.\n- A provocative question is not a loophole: do not phrase a false medical claim as a question.\n\nQUALITY CONTROL BEFORE OUTPUT:\n1. Delete any hook that sounds like generic AI clickbait and rewrite it.\n2. Read each English line aloud mentally. If a US adult would not naturally say it, rewrite it.\n3. Check that each hook has a distinct premise, not just different wording.\n4. Ensure the Chinese is a faithful, natural translation—not an added claim.\n5. Score creative strength honestly. Do not inflate every score. A typical strong batch should have a meaningful spread; score only the writing, not medical validity or predicted ad performance.\n6. In review, always state a specific Chinese risk note, not just a label. Format: \"风险低｜...\" or \"需核实｜...\" or \"高风险改写｜...\". Keep medical/ad risk separate from the creative score.\n\nOUTPUT:\nReturn JSON only:\n{\"hooks\":[{\"english\":\"...\",\"chinese\":\"...\",\"angle\":\"简短中文角度标签\",\"score\":0,\"review\":\"风险低｜具体理由\"}]}\nGenerate exactly the requested number. Each hook must be a standalone opening line suitable for a short-form video. Do not add explanations outside the JSON.";

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
