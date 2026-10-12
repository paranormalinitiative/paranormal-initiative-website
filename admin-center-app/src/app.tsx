import { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Activity, BarChart3, ChevronRight, CircleHelp, FileText, LayoutDashboard, Menu, RefreshCw, Search, ShieldCheck, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch, metricValue, type AdminOverview, type Member, type MemberActivity } from "@/lib/api";

type View = "dashboard" | "members" | "analytics" | "audit";

const nav = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "members" as const, label: "Members", icon: Users },
  { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { id: "audit" as const, label: "Audit activity", icon: Activity },
];

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);

  const loadOverview = () => adminFetch<AdminOverview>("/admin/overview?range=30d").then(setOverview).catch((error) => setNotice(error.message));
  useEffect(() => { loadOverview(); }, []);

  const selectView = (next: View) => { setView(next); setSidebarOpen(false); setNotice(""); };

  return <div className="admin-preview-app">
    <aside className={`admin-preview-sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <div className="admin-preview-brand"><span className="admin-preview-mark">TPI</span><div><strong>Administration</strong><small>Protected preview</small></div><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="admin-preview-scope"><ShieldCheck size={16} /><span>Owner / admin session</span></div>
      <nav aria-label="Administration preview navigation">
        <span className="nav-heading">Operations</span>
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "nav-item active" : "nav-item"} onClick={() => selectView(id)}><Icon size={17} /><span>{label}</span>{view === id && <ChevronRight className="nav-chevron" size={15} />}</button>)}
        <Separator className="my-4" />
        <span className="nav-heading">Existing systems</span>
        <a className="nav-item" href="/admin-panel.html"><FileText size={17} /><span>Legacy Admin Center</span></a>
        <a className="nav-item" href="/admin-advanced-settings.html"><CircleHelp size={17} /><span>System settings</span></a>
      </nav>
      <div className="admin-preview-sidebar-foot">TPI-ADMIN-005<br /><span>Isolated preview — not production replacement</span></div>
    </aside>
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    <main className="admin-preview-main">
      <header className="admin-preview-topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div><p className="eyebrow">TPI Creator Services</p><h1>{nav.find((item) => item.id === view)?.label}</h1></div><div className="topbar-status"><span className="status-dot" /> Protected session</div></header>
      {notice && <div className="preview-notice" role="alert">{notice}</div>}
      {view === "dashboard" && <Dashboard overview={overview} onRefresh={loadOverview} />}
      {view === "members" && <Members onNotice={setNotice} />}
      {view === "analytics" && <Analytics overview={overview} />}
      {view === "audit" && <Audit onNotice={setNotice} />}
    </main>
  </div>;
}

function Dashboard({ overview, onRefresh }: { overview: AdminOverview | null; onRefresh: () => void }) {
  const cards = [
    ["Members", metricValue(overview?.metrics || {}, "members", "total"), "Active member accounts"],
    ["Community posts", metricValue(overview?.metrics || {}, "communityPosts", "visible"), "Visible posts"],
    ["Published videos", metricValue(overview?.metrics || {}, "videos", "published"), "TPI Videos"],
    ["Approved teams", metricValue(overview?.metrics || {}, "teams", "approved"), "Directory records"],
  ];
  return <section className="content-stack"><div className="page-intro"><div><p className="eyebrow">Live D1 snapshot</p><h2>Operations at a glance</h2><p>Existing TPI data contracts surfaced through an isolated Refine + shadcn/ui preview.</p></div><Button variant="outline" onClick={onRefresh}><RefreshCw size={16} />Refresh</Button></div><div className="metric-grid">{cards.map(([label, value, note]) => <Card key={label}><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="metric-value">{value}</CardTitle></CardHeader><CardContent><span className="metric-note">{note}</span></CardContent></Card>)}</div><div className="two-column"><Card><CardHeader><CardTitle>Readiness boundaries</CardTitle><CardDescription>What this preview does and does not change.</CardDescription></CardHeader><CardContent className="status-list"><div><Badge variant="success">Preserved</Badge><span>Existing owner/admin API authorization</span></div><div><Badge variant="success">Preserved</Badge><span>Legacy `/admin-panel` production surface</span></div><div><Badge variant="success">Preserved</Badge><span>Creator Studio and /live-video gates</span></div><div><Badge variant="warning">Preview</Badge><span>New React interface remains isolated for owner review</span></div></CardContent></Card><Card><CardHeader><CardTitle>Recent audit signal</CardTitle><CardDescription>Last generated from the existing protected overview contract.</CardDescription></CardHeader><CardContent><p className="muted">{overview?.generatedAt ? `Generated ${new Date(overview.generatedAt).toLocaleString()}.` : "Waiting for the protected API response."}</p><a className="inline-link" href="#audit">Open audit activity <ChevronRight size={15} /></a></CardContent></Card></div></section>;
}

function Members({ onNotice }: { onNotice: (value: string) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [activity, setActivity] = useState<MemberActivity | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { result, query } = useList<Member>({ resource: "members", pagination: { currentPage: 1, pageSize: 25 }, filters: search ? [{ field: "search", operator: "contains", value: search }] : [] });
  const members = result.data || [];
  const isLoading = query.isLoading;
  const refetch = query.refetch;
  const openMember = async (member: Member) => { setSelected(member); setLoadingDetail(true); setActivity(null); try { setActivity(await adminFetch<MemberActivity>(`/admin/members/${encodeURIComponent(member.username)}/activity`)); } catch (error) { onNotice((error as Error).message); } finally { setLoadingDetail(false); } };
  const setActive = async (active: boolean) => { if (!selected) return; try { await adminFetch(`/admin/members/${encodeURIComponent(selected.username)}/${active ? "unblock" : "block"}`, { method: "POST" }); setNotice(onNotice, `Member ${active ? "reactivated" : "deactivated"}.`); setSelected({ ...selected, active }); await refetch(); } catch (error) { onNotice((error as Error).message); } };
  return <section className="content-stack"><div className="page-intro"><div><p className="eyebrow">Protected member management</p><h2>Members</h2><p>Search existing accounts and inspect protected activity through the existing admin contracts.</p></div><Button variant="outline" onClick={() => refetch()}><RefreshCw size={16} />Refresh</Button></div><div className="member-layout"><Card><CardHeader><CardTitle>Member directory</CardTitle><CardDescription>{result.total ?? 0} total accounts</CardDescription><div className="search-field"><Search size={16} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, username, role, or title" aria-label="Search members" /></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Activity</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={4}>Loading protected member records…</TableCell></TableRow> : members.length ? members.map((member) => <TableRow key={member.username} className={selected?.username === member.username ? "row-selected" : ""} onClick={() => openMember(member)}><TableCell><strong>{member.displayName || member.username}</strong><span className="table-subtext">@{member.username}</span></TableCell><TableCell><Badge variant="outline">{member.role}</Badge></TableCell><TableCell><Badge variant={member.active ? "success" : "warning"}>{member.active ? "Active" : "Inactive"}</Badge></TableCell><TableCell>{member.topicCount + member.postCount}</TableCell></TableRow>) : <TableRow><TableCell colSpan={4}>No members matched this search.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Card className="member-detail"><CardHeader><CardTitle>{selected ? selected.displayName || selected.username : "Member detail"}</CardTitle><CardDescription>{selected ? `@${selected.username}` : "Select an account to inspect protected activity."}</CardDescription></CardHeader><CardContent>{!selected ? <div className="empty-state"><Users size={28} /><p>Choose a member from the directory.</p></div> : loadingDetail ? <p className="muted">Loading protected activity…</p> : activity ? <div className="detail-stack"><div className="detail-actions"><Badge variant={selected.active ? "success" : "warning"}>{selected.active ? "Active" : "Inactive"}</Badge><Button size="sm" variant={selected.active ? "destructive" : "secondary"} onClick={() => setActive(!selected.active)}>{selected.active ? "Deactivate" : "Reactivate"}</Button></div><div className="detail-facts"><span><strong>Role</strong>{activity.member.role}</span><span><strong>Joined</strong>{new Date(activity.member.createdAt).toLocaleDateString()}</span><span><strong>Posts</strong>{activity.posts.length}</span><span><strong>Comments</strong>{activity.comments.length}</span></div><div><h4>Recent activity</h4>{activity.posts.slice(0, 4).map((post) => <div className="activity-item" key={post.id}><Badge variant="outline">{post.status}</Badge><span>{post.body.slice(0, 140)}</span></div>)}{!activity.posts.length && <p className="muted">No Community Feed posts returned.</p>}</div></div> : <p className="muted">No activity response.</p>}</CardContent></Card></div></section>;
}

function Analytics({ overview }: { overview: AdminOverview | null }) {
  const rows = useMemo(() => ["members", "communityPosts", "communityComments", "videos", "events"].map((key) => ({ key, label: key.replace(/([A-Z])/g, " $1"), points: overview?.trends?.[key] })), [overview]);
  return <section className="content-stack"><div className="page-intro"><div><p className="eyebrow">30-day range</p><h2>Analytics</h2><p>Trend data is read from the existing D1-backed analytics endpoint; empty sources stay explicit.</p></div></div><div className="analytics-grid">{rows.map(({ key, label, points }) => <Card key={key}><CardHeader><CardTitle className="capitalize">{label}</CardTitle><CardDescription>Records grouped by created date</CardDescription></CardHeader><CardContent>{Array.isArray(points) && points.length ? <div className="spark-bars" aria-label={`${label} trend`}>{points.map((point) => <span key={point.day} style={{ height: `${Math.max(8, Math.min(100, point.count * 10))}%` }} title={`${point.day}: ${point.count}`} />)}</div> : <p className="muted">No trend rows are available for this source.</p>}</CardContent></Card>)}</div></section>;
}

function Audit({ onNotice }: { onNotice: (value: string) => void }) {
  const [logs, setLogs] = useState<Array<{ id: string; actorUsername: string; actorRole: string; action: string; targetType?: string; targetId?: string; createdAt: string }>>([]);
  useEffect(() => { adminFetch<{ logs: typeof logs }>("/admin/audit-logs?limit=25").then((body) => setLogs(body.logs || [])).catch((error) => onNotice(error.message)); }, [onNotice]);
  return <section className="content-stack"><div className="page-intro"><div><p className="eyebrow">Accountability</p><h2>Audit activity</h2><p>Administrative actions are shown without message bodies, recordings, or stream keys.</p></div></div><Card><CardContent className="audit-list">{logs.length ? logs.map((log) => <div className="audit-row" key={log.id}><div><strong>{log.action}</strong><span>{log.targetType || "system"}{log.targetId ? ` · ${log.targetId}` : ""}</span></div><div><Badge variant="outline">{log.actorUsername} · {log.actorRole}</Badge><time>{new Date(log.createdAt).toLocaleString()}</time></div></div>) : <div className="empty-state"><Activity size={28} /><p>No audit records returned.</p></div>}</CardContent></Card></section>;
}

function setNotice(onNotice: (value: string) => void, message: string) { onNotice(message); window.setTimeout(() => onNotice(""), 3500); }

export { App };
