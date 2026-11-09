import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const systemPrompt = `You are COPD Hook Studio, a creative strategist for US short-form health content.
Create compelling, varied advertising hook DRAFTS. Never invent medical evidence, imply a home remedy cures/reverses COPD,
suggest smoking is safe or that a remedy replaces quitting, inhalers, oxygen, or prescribed care, or fabricate doctors,
testimonials, clinical studies, or outcomes. Avoid false urgency and deceptive authority claims.
If the user's reference contains an unsupported medical promise, preserve the requested rhetorical style where possible
but replace the false promise with curiosity, a question, or a truthful educational framing.
Return JSON only: {"hooks":[{"english":"...","chinese":"...","angle":"...","score":0-100,"review":"..."}]}`.trim();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "COPD and smoking");
    const style = String(body.style || "Mixed");
    const audience = String(body.audience || "US adults 50+");
    const reference = String(body.reference || "");
    const count = Math.min(50, Math.max(1, Number(body.count || 10)));
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        mode: "demo",
        hooks: demoHooks(topic, style, count)
      });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${count} distinct hooks.
Topic: ${topic}
Style: ${style}
Audience: ${audience}
Reference for rhetorical inspiration only: ${reference}
Return concise, natural US English hooks and accurate Chinese translations. Vary sentence structures.
For each, add a short angle description, a creative appeal score, and a concise review note.
The score measures creative strength, not medical validity or ad approval.` }
      ]
    });
    const raw = completion.choices[0]?.message?.content || '{"hooks":[]}';
    const parsed = JSON.parse(raw);
    return NextResponse.json({ mode: "ai", hooks: Array.isArray(parsed.hooks) ? parsed.hooks : [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Generation failed. Check server configuration and try again." }, { status: 500 });
  }
}

function demoHooks(topic: string, style: string, count: number) {
  const seeds = [
    ["If You've Smoked for Years, Here's One Lung-Health Fact Worth Knowing.", "如果你已经吸烟多年，有一个关于肺部健康的事实值得了解。", "长期吸烟者提醒", 88, "教育型表达；避免暗示某个技巧能抵消吸烟伤害。"],
    ["COPD and Morning Phlegm: What Your Body May Be Trying to Tell You.", "COPD 与晨起痰液：你的身体可能正在传递什么信号？", "症状好奇心", 91, "以症状为切入点，不承诺清肺或排毒。"],
    ["Before You Try Another Lung Remedy, Understand This About COPD.", "在尝试另一种肺部偏方之前，先了解 COPD 的这一点。", "反常识教育", 90, "适合引出医学知识，避免把偏方描述为治疗。"],
    ["Over 50 and Still Waking Up Coughing? This Is Worth a Closer Look.", "50岁以上，仍然每天醒来咳嗽？这件事值得认真了解。", "年龄与症状", 86, "避免制造恐慌，建议引导专业评估。"],
    ["A Vicks Jar Is Not a COPD Treatment—So Why Do So Many Videos Talk About It?", "Vicks 不是 COPD 的治疗方法——那为什么这么多视频都在谈它？", "争议与揭秘", 93, "明确区分网络说法与医学证据。"],
    ["You Don't Have to Guess What's Behind That Stubborn Morning Cough.", "你不必一直猜测顽固晨咳背后的原因。", "痛点解决", 85, "鼓励了解症状原因，不暗示保证改善。"],
    ["If You Have COPD, Don't Change Your Treatment Because of a Viral Video.", "如果你患有 COPD，不要因为一条爆款视频就改变治疗方案。", "直接命令", 92, "安全提醒型开头，可建立可信度。"],
    ["What Most People Get Wrong About Smoking, Mucus, and COPD.", "关于吸烟、黏液和 COPD，大多数人容易误解什么？", "知识差异", 89, "适合做知识拆解，需核对后续医学内容。"],
    ["That Tight-Chest Feeling Deserves More Than Another Internet Hack.", "胸口发紧的感觉，值得比再试一个网络小妙招更认真地对待。", "情绪共鸣", 87, "不替代就医建议；持续或严重症状应及时求医。"],
    ["The Question Every Longtime Smoker Should Ask About Their Breathing.", "每个长期吸烟者都应该问自己的一个呼吸问题。", "身份代入", 88, "可自然引出戒烟和肺功能评估。"]
  ];
  return Array.from({ length: count }, (_, i) => {
    const s = seeds[i % seeds.length];
    return { english: s[0], chinese: s[1], angle: `${s[2]} · ${style} · ${topic}`, score: s[3], review: s[4] };
  });
}
