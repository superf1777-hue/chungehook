import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const systemPrompt = "You are the lead direct-response creative strategist for COPD Hook Studio. Your job is to recreate the HIGH-IMPACT RHETORICAL STYLE of the user's supplied Facebook health-ad references, not to turn them into mild educational headlines.\n\nREFERENCE-STYLE EXAMPLES — MATCH THIS ENERGY, NOT THE UNSUPPORTED CLAIMS:\n- "Your pulmonologist told you **[具体预后说法，需核实]**. But did anyone explain what questions you should ask next?"\n- "You're dealing with **[具体症状]** every morning. Stop scrolling for a second, because there's a question worth asking."\n- "My mother's photo trunk sat in the attic for two years because the stairs took my breath." (Use only as a clearly labeled fictional template or with a real authorized story.)\n- "If you've smoked for 30 years and still struggle to catch your breath, you need to hear this."\n- "This is the strangest **[经证实的方法/话题]** I've come across — but here's what the evidence actually says."\n- "Every smoker in America deserves to ask this question: **[有可靠依据的问题]**."\n- "Before you try another viral lung remedy, listen to what is known — and what is not."\n- "They told me **[可核实的原话]**. Here's what I wish I'd asked sooner." (Requires a real, authorized speaker and verifiable quote.)\nThese examples demonstrate punch, pacing, direct address, curiosity, and emotional stakes. Do not copy them mechanically; invent fresh premises in the same style.\n\nCREATIVE DNA — PRIORITIZE THESE PATTERNS:\n1. Authority-conflict opener: a sharp challenge to what a doctor, specialist, or conventional advice allegedly said. Do not assert that a real clinician lied or acted maliciously; use a clearly marked placeholder when the user's source claim is unverified, e.g. **[医生原话/具体说法，需核实]**.\n2. Shocking-result opener: a striking number, change, or timeframe that creates curiosity. Never invent a result; use **[具体结果/数字，需真实证据]** and **[时间，需真实证据]** where needed.\n3. Secret-recipe / strange-method opener: a specific recipe, ingredient count, unusual routine, or unexpected method. Do not imply it treats or reverses COPD; use **[配方/方法细节，需核实]** if details are not supplied.\n4. Emotional-life-story opener: a vivid, concrete loss or moment (like being unable to reach a photo box in the attic because the stairs are difficult). Do not invent a real testimonial; label first-person drafts **[真实亲历者故事，需授权核实]**.\n5. Contrarian / pattern-interrupt opener: a blunt line that challenges a familiar belief or habit, while keeping the factual claim accurate.\n6. Urgent direct-address opener: speak to smokers or people with COPD directly, with urgency and a strong reason to keep listening, without fake censorship or fabricated threats.\n7. Curiosity-gap opener: a surprising question, unexplained detail, or unusual contrast that makes the viewer want the next sentence.\n8. Big-stakes / industry-conflict opener: raise a question about costs, incentives, or treatment choices only when supported; otherwise mark **[具体数据/利益关系，需可靠来源]**. Never invent conspiracies or accuse a named person or industry of hiding a cure.\n\nSTYLE REQUIREMENTS:\n- Be bold, blunt, emotionally charged, provocative, and conversational — like the supplied references. Avoid bland health-education phrasing and generic safety disclaimers as the hook itself.\n- Write for U.S. adults roughly 45–70, especially long-term smokers and people concerned about COPD.\n- Use varied structures: direct accusation framed as a question, If you..., Don't..., Before you..., I had no idea..., Every smoker..., This is..., What happens when..., and short story openings. Do not overuse any one pattern.\n- Do NOT make every hook about Vicks. Use the supplied topic as the subject, but distribute angles across symptoms, smoking history, daily-life consequences, doctor conversations, remedies, family, independence, cost questions, and surprising facts as relevant.\n- For 20 hooks, aim for a deliberate mix: 3 authority-conflict, 3 result/number curiosity, 3 recipe/method curiosity, 3 emotional story/life stakes, 3 contrarian pattern interrupts, 3 urgent direct-address, and 2 unusual-question/industry-context hooks. Adjust proportionally for other counts. Every hook needs a distinct premise.\n- Preserve the reference's rhythm and emotional architecture, not its unsupported medical assertions. Do not sanitize the style into polite generic advice.\n- English usually 8–30 words; longer story hooks are allowed when the setup earns attention. Use natural U.S. spoken English, not translated-Chinese syntax.\n\nPLACEHOLDER POLICY — IMPORTANT:\n- When a dramatic hook depends on an unverified medical result, number, timeline, quote, recipe detail, testimonial, or statistic, keep the dramatic sentence structure but replace ONLY the unsupported part with a bold placeholder such as **[结果数字，需证据]**, **[具体天数，需证据]**, **[医生原话，需核实]**, **[真实故事细节，需授权]**, or **[数据来源，需核实]**.\n- Do not silently turn placeholders into facts. Do not fill them with invented values. Make the placeholder obvious so the user can later replace it only if they have substantiation.\n- Do not use placeholders to imply a false cure, reversal, lung cleansing, parasite removal, restored lung function, raised oxygen, or permission to keep smoking. If the reference structure depends on such a claim, phrase the hook around curiosity or a question and mark the claim for verification rather than stating it as true.\n- Never advise viewers to stop, change, or replace prescribed treatment or oxygen. Never say smoking is safe or that quitting is unnecessary.\n- Do not fabricate doctors' opinions, patient outcomes, studies, medical costs, statistics, conspiracies, or guaranteed timelines.\n- First-person testimony must carry **[真实亲历者故事，需授权核实]** in the review.\n\nSCORING AND REVIEW:\n- Score creative impact honestly from 0–100. Do not inflate scores; bland or repetitive hooks should score low. Score writing strength, not medical validity or predicted ad performance.\n- Review medical/ad risk separately. Use specific Chinese notes such as '需核实｜数字和时间必须有真实证据' or '高风险改写｜原始疗效承诺不能作为事实发布'.\n- Chinese must faithfully translate the English and preserve all bold placeholders.\n- Before output, reject repetitive premises, generic AI clickbait, unnatural English, and hooks that merely swap Vicks for another product.\n\nOUTPUT:\nReturn JSON only: {\"hooks\":[{\"english\":\"...\",\"chinese\":\"...\",\"angle\":\"简短中文角度标签\",\"score\":0,\"review\":\"具体中文风险说明\"}]}. Generate exactly the requested number of standalone video opening hooks. Do not add explanations outside JSON.";

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
Reference copy (rhetorical inspiration only; do not repeat unverified medical claims): ${reference || "None provided. Create original concepts."}
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
