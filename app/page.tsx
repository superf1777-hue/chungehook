"use client";

import { useEffect, useMemo, useState } from "react";

type Hook = {
  id: string; english: string; chinese: string; angle: string;
  score: number; review: string; favorite?: boolean; createdAt: string;
};
type Metric = { id: string; name: string; spend: number; impressions: number; clicks: number; conversions: number };

const styles = ["混合爆款风格", "争议性 / 反常识", "强烈悬念 / 好奇心", "医生权威 / 医疗冲突", "第一人称真实故事", "年龄痛点 / 症状痛点", "直接命令 / Don't / If"];
const initialMetrics: Metric[] = [];

export default function Home() {
  const [tab, setTab] = useState("generator");
  const [topic, setTopic] = useState("Vicks、吸烟与 COPD 肺部健康");
  const [style, setStyle] = useState(styles[0]);
  const [audience, setAudience] = useState("美国50岁以上长期吸烟者");
  const [reference, setReference] = useState("You Don't Need To Stop Smoking If You Know This Vicks Trick!");
  const [count, setCount] = useState(10);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [library, setLibrary] = useState<Hook[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("demo");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("全部");
  const [metricName, setMetricName] = useState("");
  const [spend, setSpend] = useState("0");
  const [impressions, setImpressions] = useState("0");
  const [clicks, setClicks] = useState("0");
  const [conversions, setConversions] = useState("0");

  useEffect(() => {
    try {
      setLibrary(JSON.parse(localStorage.getItem("chs-library") || "[]"));
      setMetrics(JSON.parse(localStorage.getItem("chs-metrics") || "[]"));
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("chs-library", JSON.stringify(library)); }, [library]);
  useEffect(() => { localStorage.setItem("chs-metrics", JSON.stringify(metrics)); }, [metrics]);

  const filtered = useMemo(() => library.filter(h => {
    const q = search.toLowerCase();
    const match = !q || h.english.toLowerCase().includes(q) || h.chinese.includes(search) || h.angle.toLowerCase().includes(q);
    const category = filter === "全部" || (filter === "收藏" ? h.favorite : h.angle.includes(filter));
    return match && category;
  }), [library, search, filter]);

  async function generate() {
    setBusy(true); setNotice("");
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, audience, reference, count }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setMode(data.mode);
      const rows: Hook[] = (data.hooks || []).map((h: any, i: number) => ({
        ...h, id: `${Date.now()}-${i}`, createdAt: new Date().toISOString()
      }));
      setHooks(rows);
      if (!rows.length) setNotice("没有生成结果，请调整输入后重试。");
    } catch (e: any) { setNotice(e.message || "生成失败"); }
    finally { setBusy(false); }
  }

  function save(h: Hook) {
    if (library.some(x => x.id === h.id)) return;
    setLibrary(prev => [h, ...prev]);
    setNotice("已保存到 Hook Library。");
  }
  function toggleFavorite(id: string) {
    setLibrary(prev => prev.map(h => h.id === id ? { ...h, favorite: !h.favorite } : h));
  }
  function exportCSV() {
    const rows = [["English", "Chinese", "Angle", "Score", "Review"], ...filtered.map(h => [h.english, h.chinese, h.angle, String(h.score), h.review])];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "copd-hook-library.csv"; a.click(); URL.revokeObjectURL(a.href);
  }
  function addMetric(e: React.FormEvent) {
    e.preventDefault();
    setMetrics(prev => [{ id: String(Date.now()), name: metricName || "未命名素材", spend: Number(spend), impressions: Number(impressions), clicks: Number(clicks), conversions: Number(conversions) }, ...prev]);
    setMetricName(""); setSpend("0"); setImpressions("0"); setClicks("0"); setConversions("0");
  }

  const nav = [{ id: "generator", label: "AI Hook Generator", icon: "✦" }, { id: "library", label: "Hook Library", icon: "▤" }, { id: "lab", label: "Performance Lab", icon: "▥" }];
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">C</div><div><b>COPD Hook Studio</b><small>CREATIVE INTELLIGENCE</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      {nav.map(n => <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}><span>{n.icon}</span>{n.label}</button>)}
      <div className="sidebar-bottom"><div className="status-dot"/> Local workspace <small>Your data stays in this browser</small></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="mobile-brand">COPD Hook Studio</div><div className="breadcrumb">Workspace <span>/</span> {nav.find(n => n.id === tab)?.label}</div><div className="top-pill">MVP · {mode === "ai" ? "AI MODE" : "DEMO MODE"}</div></header>
      <div className="content">
        {tab === "generator" && <>
          <div className="page-heading"><div><div className="eyebrow">CREATIVE ENGINE</div><h1>Hook Generator</h1><p>为美国短视频受众生成更有吸引力的 COPD 内容开头。</p></div><div className="heading-spark">✧</div></div>
          <div className="generator-grid">
            <section className="panel input-panel">
              <div className="panel-title"><div><h2>创意 Brief</h2><p>描述你想测试的广告角度</p></div><span className="step-tag">01 / INPUT</span></div>
              <label>创意主题</label><textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2} placeholder="例如：晨起痰液、长期吸烟、肺部健康..." />
              <label>Hook 风格</label><select value={style} onChange={e => setStyle(e.target.value)}>{styles.map(s => <option key={s}>{s}</option>)}</select>
              <label>目标受众</label><input value={audience} onChange={e => setAudience(e.target.value)} />
              <label>参考文案 <span className="optional">OPTIONAL</span></label><textarea value={reference} onChange={e => setReference(e.target.value)} rows={3} placeholder="粘贴你想让 AI 学习结构和语气的参考文案..." />
              <div className="count-row"><label>生成数量</label><div className="count-options">{[10,20,50].map(n => <button key={n} onClick={() => setCount(n)} className={count === n ? "selected" : ""}>{n} 条</button>)}</div></div>
              <button className="primary-btn generate-btn" onClick={generate} disabled={busy || !topic.trim()}>{busy ? <><span className="spinner"/> 正在生成...</> : <>✦ 生成 Hooks <span>→</span></>}</button>
              <div className="privacy-note">✧ 不会自动发布广告。生成内容仅供创意参考，需人工核实医疗表述。</div>
            </section>
            <section className="results-panel">
              <div className="results-header"><div><div className="eyebrow">OUTPUT</div><h2>生成结果 <span className="result-count">{hooks.length}</span></h2></div><span className="live-indicator"><i/> READY</span></div>
              {notice && <div className="notice">{notice}</div>}
              {hooks.length === 0 ? <div className="empty-state"><div className="empty-icon">✳</div><h3>你的下一条 Hook 从这里开始</h3><p>填写左侧 Brief，生成英文开头、中文翻译和创意分析。</p><div className="empty-chips"><span>Curiosity</span><span>Contrarian</span><span>Storytelling</span></div></div> :
                <div className="hook-list">{hooks.map((h, i) => <article className="hook-card" key={h.id}><div className="hook-card-top"><span className="hook-number">HOOK {String(i+1).padStart(2,"0")}</span><span className="score">✦ {h.score}/100</span></div><h3>{h.english}</h3><p className="translation">{h.chinese}</p><div className="angle">{h.angle}</div><div className="review">⚑ {h.review}</div><div className="card-actions"><button onClick={() => save(h)}>＋ 保存</button><button onClick={() => navigator.clipboard?.writeText(h.english)}>复制英文</button><button onClick={() => navigator.clipboard?.writeText(h.english + "\n" + h.chinese)}>复制双语</button></div></article>)}</div>}
            </section>
          </div>
        </>}
        {tab === "library" && <><div className="page-heading"><div><div className="eyebrow">YOUR CREATIVE ASSETS</div><h1>Hook Library</h1><p>集中管理、检索和导出你的创意资产。</p></div></div><section className="panel library-panel"><div className="library-toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索英文、中文或创意角度..." /><select value={filter} onChange={e => setFilter(e.target.value)}><option>全部</option><option>收藏</option><option>争议性</option><option>悬念</option><option>症状</option></select><button className="secondary-btn" onClick={exportCSV}>↓ 导出 CSV</button></div>{filtered.length === 0 ? <div className="empty-state compact"><div className="empty-icon">▤</div><h3>暂时还没有保存的 Hook</h3><p>在 Generator 中点击「保存」，你的文案会出现在这里。</p></div> : filtered.map(h => <article className="library-row" key={h.id}><div className="library-copy"><b>{h.english}</b><p>{h.chinese}</p><small>{h.angle}</small></div><div className="library-actions"><span className="score">✦ {h.score}</span><button onClick={() => toggleFavorite(h.id)} title="收藏">{h.favorite ? "★" : "☆"}</button><button onClick={() => navigator.clipboard?.writeText(h.english)}>复制</button><button onClick={() => setLibrary(prev => prev.filter(x => x.id !== h.id))}>删除</button></div></article>)}</section></>}
        {tab === "lab" && <><div className="page-heading"><div><div className="eyebrow">CREATIVE PERFORMANCE</div><h1>Performance Lab</h1><p>手动记录广告表现，比较不同 Hook 的结果。</p></div></div><section className="panel"><h2>新增素材数据</h2><form className="metrics-form" onSubmit={addMetric}><div className="field wide"><label>素材名称 / Hook ID</label><input value={metricName} onChange={e => setMetricName(e.target.value)} placeholder="例如：Morning Phlegm Hook A" /></div>{[["Spend ($)",spend,setSpend],["Impressions",impressions,setImpressions],["Clicks",clicks,setClicks],["Conversions",conversions,setConversions]].map(([label,val,set]: any) => <div className="field" key={label}><label>{label}</label><input type="number" min="0" step="any" value={val} onChange={e => set(e.target.value)} /></div>)}<button className="primary-btn" type="submit">＋ 保存数据</button></form></section><div className="metric-cards"><div className="metric-card"><small>素材记录</small><b>{metrics.length}</b></div><div className="metric-card"><small>总花费</small><b>${metrics.reduce((a,m)=>a+m.spend,0).toFixed(2)}</b></div><div className="metric-card"><small>总点击</small><b>{metrics.reduce((a,m)=>a+m.clicks,0).toLocaleString()}</b></div><div className="metric-card"><small>总转化</small><b>{metrics.reduce((a,m)=>a+m.conversions,0).toLocaleString()}</b></div></div><section className="panel metrics-table"><h2>数据记录</h2>{metrics.length === 0 ? <p className="muted">尚无数据。添加第一条素材记录开始追踪。</p> : <div className="table-wrap"><table><thead><tr><th>素材</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Conversions</th><th></th></tr></thead><tbody>{metrics.map(m => <tr key={m.id}><td>{m.name}</td><td>${m.spend.toFixed(2)}</td><td>{m.impressions.toLocaleString()}</td><td>{m.clicks.toLocaleString()}</td><td>{m.impressions ? (m.clicks/m.impressions*100).toFixed(2)+"%" : "—"}</td><td>{m.conversions}</td><td><button onClick={() => setMetrics(prev => prev.filter(x => x.id !== m.id))}>删除</button></td></tr>)}</tbody></table></div>}</section></>}
        <footer>© 2026 COPD Hook Studio <span>Built for creative research · Human review required</span></footer>
      </div>
    </section>
  </main>;
}
