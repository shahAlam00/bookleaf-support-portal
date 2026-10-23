import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BookMarked, BookOpen, Bot, Check,
  CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command, FileText, Filter,
  Headphones, LayoutDashboard, LifeBuoy, LogOut, Menu, MessageCircle, MessageSquare, MoreHorizontal,
  Paperclip, Plus, RefreshCw, Search, Send, Settings2, ShieldCheck, Sparkles, Ticket, UserRound,
  Users, Wallet, X, Zap
} from 'lucide-react';
import { adminApi, api, authApi, authorApi, date, getArray, initials, money, SOCKET_URL } from './services/api.js';

const AuthContext = createContext(null);
const ToastContext = createContext(() => {});
const CATEGORIES = ['Royalty & Payments', 'ISBN & Metadata Issues', 'Printing & Quality', 'Distribution & Availability', 'Book Status & Production Updates', 'General Inquiry'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

function useAuth() { return useContext(AuthContext); }
function useToast() { return useContext(ToastContext); }
function toastError(err, show) { show(err?.message || 'Something went wrong', 'error'); }

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bookleaf_author_session') || 'null'); } catch { return null; }
  });
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'success') => { setToast({ message, type, id: Date.now() }); window.setTimeout(() => setToast(null), 4200); }, []);
  const logout = useCallback(() => { localStorage.removeItem('bookleaf_author_session'); setSession(null); }, []);
  const value = useMemo(() => ({ session, setSession, logout }), [session, logout]);
  return <AuthContext.Provider value={value}><ToastContext.Provider value={notify}>
    <Routes>
      <Route path="/login" element={session ? <Navigate to={session.user?.role === 'author' ? '/author' : '/login'} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={session?.user?.role === 'author' ? '/author' : '/login'} replace />} />
      <Route path="/author/*" element={<Protected role="author"><AuthorApp /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {toast && <div className={`toast toast-${toast.type}`} role="status"><span className="toast-dot" />{toast.message}<button onClick={() => setToast(null)} aria-label="Dismiss"><X size={15}/></button></div>}
  </ToastContext.Provider></AuthContext.Provider>;
}

function Protected({ role, children }) {
  const { session, logout, setSession } = useAuth();
  const location = useLocation();
  useEffect(() => {
    let active = true;
    if (session?.token) authApi.me(session.token).then((user) => {
      if (active && user?.role && user.role !== role) logout();
      else if (active && user?.role) { const next = { ...session, user }; setSession(next); localStorage.setItem('bookleaf_author_session', JSON.stringify(next)); }
    }).catch((err) => { if (active && err.status === 401) logout(); });
    return () => { active = false; };
  // Session validation on mount/token change is intentional.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, role]);
  if (!session?.token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (session.user?.role && session.user.role !== role) return <Navigate to={session.user.role === 'admin' ? '/admin' : '/author'} replace />;
  return children;
}

function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const { setSession } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const notify = useToast();
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try { const result = await authApi.login(email.trim(), password); if (result.user?.role !== 'author') { notify('This is the Author Portal. Please use an author account.', 'error'); return; } const next = { token: result.token, user: result.user }; localStorage.setItem('bookleaf_author_session', JSON.stringify(next)); setSession(next); notify('Welcome to the BookLeaf Author Portal'); navigate('/author', { replace: true }); }
    catch (err) { toastError(err, notify); } finally { setLoading(false); }
  }
  return <main className="login-shell">
    <div className="login-art"><div className="brand brand-light"><span className="brand-mark"><BookOpen size={20}/></span><span>BookLeaf<span className="brand-sub">PUBLISHING SUPPORT</span></span></div>
      <div className="art-copy"><div className="eyebrow eyebrow-light"><Sparkles size={14}/> AUTHOR EXPERIENCE, REIMAGINED</div><h1>Every story deserves<br/><em>great support.</em></h1><p>View your books and royalties, raise support requests, and follow every response in one place.</p>
        <div className="art-stats"><div><strong>22k+</strong><span>Titles supported</span></div><div><strong>1,200+</strong><span>Books monthly</span></div><div><strong>One place</strong><span>For every question</span></div></div>
      </div><div className="art-orb orb-one"/><div className="art-orb orb-two"/><div className="art-footer">© {new Date().getFullYear()} BookLeaf Publishing <span>•</span> Author Support Portal</div>
    </div>
    <div className="login-side"><div className="login-mobile-brand brand"><span className="brand-mark"><BookOpen size={20}/></span><span>BookLeaf<span className="brand-sub">PUBLISHING SUPPORT</span></span></div>
      <div className="login-card"><div className="login-icon"><ShieldCheck size={23}/></div><div className="eyebrow">SECURE PORTAL</div><h2>Welcome back</h2><p className="muted">Sign in with the email registered for your author account.</p>
        <form onSubmit={submit} className="form-stack"><label>Email address<div className="input-wrap"><UserRound size={17}/><input type="email" required autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}/></div></label>
          <label>Password<div className="input-wrap"><ShieldCheck size={17}/><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/><button className="input-action" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          <button className="btn btn-primary btn-full btn-large" disabled={loading}>{loading ? <><span className="spinner"/> Signing in…</> : <>Sign in <ArrowRight size={17}/></>}</button>
        </form>
        <div className="login-help"><LifeBuoy size={16}/><span>Need help accessing your account? Contact the BookLeaf support team.</span></div>
        <div className="login-note"><ShieldCheck size={14}/> Protected with author-only access</div>
      </div><div className="login-bottom">Built for authors. Powered by thoughtful support.</div>
    </div>
  </main>;
}

const authorNav = [
  { label: 'Workspace', items: [{ to: '/author', label: 'Overview', icon: LayoutDashboard }, { to: '/author/books', label: 'My books', icon: BookMarked }, { to: '/author/tickets', label: 'My tickets', icon: MessageSquare }] },
];
const adminNav = [
  { label: 'WORKSPACE', items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }, { to: '/admin/tickets', label: 'Ticket queue', icon: Ticket }] },
];

function Shell({ role, children, title, subtitle, actions }) {
  const { session, logout } = useAuth(); const [mobileOpen, setMobileOpen] = useState(false); const location = useLocation(); const navigate = useNavigate();
  const isAdmin = role === 'admin'; const navGroups = isAdmin ? adminNav : authorNav;
  const displayName = session?.user?.name || (isAdmin ? 'BookLeaf Admin' : 'BookLeaf Author');
  const pathActive = (to) => to === `/${role}` ? location.pathname === `/${role}` || location.pathname === `/${role}/` : location.pathname.startsWith(to);
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><span className="brand-mark"><BookOpen size={19}/></span><span className="brand-name">BookLeaf<span className="brand-sub">{isAdmin ? 'OPERATIONS DESK' : 'AUTHOR PORTAL'}</span></span><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close"><X size={17}/></button></div>
      <div className={`workspace-pill ${isAdmin ? 'workspace-admin' : ''}`}><span className="workspace-dot"/><span>{isAdmin ? 'Operations workspace' : 'Author workspace'}</span><ChevronDown size={14}/></div>
      {navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map((item) => <button key={item.to} className={`nav-item ${pathActive(item.to) ? 'nav-active' : ''}`} onClick={() => { navigate(item.to); setMobileOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'Ticket queue' && <span className="nav-live-dot"/>}</button>)}</div>)}
      <div className="sidebar-spacer"/>
      <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={17}/></div><strong>{isAdmin ? 'AI-assisted support' : 'Need a hand?'}</strong><p>{isAdmin ? 'Review every AI draft before sending a reply.' : 'Create a ticket and our team will help you.'}</p>{!isAdmin && <button onClick={() => navigate('/author/tickets/new')}>Raise a query <ArrowRight size={14}/></button>}</div>
      <div className="sidebar-bottom"><div className="profile-mini"><div className="avatar">{initials(displayName)}</div><div className="profile-meta"><strong>{displayName}</strong><span>{isAdmin ? 'Administrator' : 'Author account'}</span></div><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    <div className="main-column"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumbs"><span>BookLeaf</span><ChevronRight size={14}/><strong>{title || (isAdmin ? 'Operations' : 'Workspace')}</strong></div></div><div className="topbar-right"><div className="system-status"><span className="status-dot"/> All systems operational</div><button className="icon-button topbar-help" title="Support information"><CircleHelp size={18}/></button><div className="avatar avatar-top">{initials(displayName)}</div></div></header>
      <main className="page-content"><div className="page-heading"><div><div className="eyebrow">{isAdmin ? 'BOOKLEAF OPERATIONS' : 'YOUR PUBLISHING SPACE'}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>{children}</main>
      <footer className="app-footer"><span>© {new Date().getFullYear()} BookLeaf Publishing</span><span><span className="footer-dot"/> Secure support workspace</span></footer>
    </div>
  </div>;
}

function AuthorApp() {
  const location = useLocation();
  return <Routes><Route path="/" element={<AuthorOverview/>}/><Route path="/books" element={<AuthorBooks/>}/><Route path="/tickets" element={<AuthorTickets/>}/><Route path="/tickets/new" element={<NewTicket/>}/><Route path="/tickets/:id" element={<TicketDetails role="author"/>}/><Route path="*" element={<Navigate to="/author" replace/>}/></Routes>;
}
function AdminApp() {
  return <Routes><Route path="/" element={<AdminOverview/>}/><Route path="/tickets" element={<AdminQueue/>}/><Route path="/tickets/:id" element={<TicketDetails role="admin"/>}/><Route path="*" element={<Navigate to="/admin" replace/>}/></Routes>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = 'blue', trend }) {
  return <div className="metric-card"><div className={`metric-icon metric-${tone}`}><Icon size={19}/></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-detail">{trend && <span className="metric-trend"><ArrowUpRight size={13}/>{trend}</span>}{detail}</div></div>;
}
function SectionHeader({ title, subtitle, action }) { return <div className="section-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }
function StatusBadge({ value }) { const key = String(value || 'Open').toLowerCase().replace(/\s+/g, '-'); return <span className={`badge badge-status status-${key}`}>{value || 'Open'}</span>; }
function PriorityBadge({ value }) { const key = String(value || 'Medium').toLowerCase(); return <span className={`priority priority-${key}`}><span/>{value || 'Medium'}</span>; }
function EmptyState({ icon: Icon = MessageSquare, title, description, action }) { return <div className="empty-state"><div className="empty-icon"><Icon size={24}/></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
function LoadingBlock({ label = 'Loading your workspace…' }) { return <div className="loading-block"><span className="spinner spinner-dark"/>{label}</div>; }
function ErrorPanel({ error, retry }) { return <div className="error-panel"><div><strong>We couldn’t load this information.</strong><p>{error}</p></div><button className="btn btn-secondary btn-small" onClick={retry}><RefreshCw size={14}/> Try again</button></div>; }

function AuthorOverview() {
  const { session } = useAuth(); const notify = useToast(); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [profile, setProfile] = useState(null); const [books, setBooks] = useState([]); const [tickets, setTickets] = useState([]);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [p, b, t] = await Promise.all([authorApi.profile(session.token), authorApi.books(session.token), authorApi.tickets(session.token, { limit: 5 })]); setProfile(p); setBooks(getArray(b)); setTickets(getArray(t)); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [session.token]);
  useEffect(() => { load(); }, [load]);
  const earned = books.reduce((n, b) => n + Number(b.totalRoyaltyEarned || 0), 0); const paid = books.reduce((n, b) => n + Number(b.royaltyPaid || 0), 0); const pending = books.reduce((n, b) => n + Number(b.royaltyPending || 0), 0);
  return <Shell role="author" title="Your overview" subtitle={`Welcome back${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}. Here’s what’s happening with your books.`} actions={<button className="btn btn-primary" onClick={() => window.location.assign('/author/tickets/new')}><Plus size={16}/> Raise a query</button>}>
    {loading ? <LoadingBlock/> : error ? <ErrorPanel error={error} retry={load}/> : <>
      <div className="welcome-banner"><div className="welcome-copy"><div className="welcome-kicker"><Sparkles size={14}/> YOUR AUTHOR SPACE</div><h2>Your stories are in good hands.</h2><p>Keep track of your publishing details and get help from the BookLeaf team whenever you need it.</p><button className="welcome-link" onClick={() => window.location.assign('/author/books')}>Explore your books <ArrowRight size={15}/></button></div><div className="welcome-illustration"><div className="illustration-circle"><BookOpen size={44}/></div><div className="float-card float-card-one"><span className="float-check"><Check size={13}/></span><span><b>Books tracked</b><small>All in one place</small></span></div><div className="float-card float-card-two"><MessageCircle size={18}/><span><b>Support, simplified</b><small>We’re here to help</small></span></div></div></div>
      <div className="metrics-grid metrics-four"><MetricCard icon={BookOpen} label="Your books" value={books.length} detail="Across your catalogue" tone="blue"/><MetricCard icon={Wallet} label="Total royalty earned" value={money(earned)} detail="Lifetime earnings" tone="violet"/><MetricCard icon={CheckCheck} label="Royalty paid" value={money(paid)} detail="Paid to date" tone="green"/><MetricCard icon={Clock3} label="Royalty pending" value={money(pending)} detail="Pending payout" tone="amber"/></div>
      <div className="content-grid content-grid-main"><section className="panel"><SectionHeader title="Your books" subtitle="A quick look at your published titles" action={<button className="text-button" onClick={() => window.location.assign('/author/books')}>View all <ArrowRight size={14}/></button>}/>{books.length ? <div className="book-list">{books.slice(0, 4).map((book, i) => <BookRow key={book._id || book.bookId} book={book} index={i}/>)}</div> : <EmptyState icon={BookOpen} title="No books found" description="Your book records will appear here when available."/>}</section>
        <section className="panel"><SectionHeader title="Recent support tickets" subtitle="Updates from the BookLeaf team" action={<button className="text-button" onClick={() => window.location.assign('/author/tickets')}>View all <ArrowRight size={14}/></button>}/>{tickets.length ? <div className="ticket-mini-list">{tickets.slice(0, 4).map((t) => <TicketMini key={t._id} ticket={t} onClick={() => window.location.assign(`/author/tickets/${t._id}`)}/>)}</div> : <EmptyState icon={MessageSquare} title="Nothing in your inbox" description="If you need help, create a support ticket." action={<button className="btn btn-secondary btn-small" onClick={() => window.location.assign('/author/tickets/new')}>Create ticket</button>}/>}</section></div>
      <div className="help-strip"><div className="help-strip-icon"><Headphones size={20}/></div><div><strong>Have a question about your publishing journey?</strong><p>Tell us what you need help with and our support team will take it from there.</p></div><button className="btn btn-secondary" onClick={() => window.location.assign('/author/tickets/new')}>Contact support <ArrowRight size={15}/></button></div>
    </>}
  </Shell>;
}

function BookRow({ book, index = 0 }) {
  const coverTones = ['cover-blue', 'cover-rose', 'cover-gold', 'cover-green'];
  return <div className="book-row"><div className={`book-cover ${coverTones[index % coverTones.length]}`}><BookOpen size={22}/><span/></div><div className="book-row-main"><strong>{book.title || 'Untitled book'}</strong><span>{book.genre || 'Genre not specified'} <span className="middot">·</span> ISBN {book.isbn || '—'}</span></div><div className="book-row-status"><StatusBadge value={book.status}/><span>{Number(book.totalCopiesSold ?? book.copiesSold ?? 0).toLocaleString('en-IN')} copies sold</span></div><div className="book-row-royalty"><strong>{money(book.totalRoyaltyEarned)}</strong><span>Royalty earned</span></div></div>;
}
function TicketMini({ ticket, onClick }) { return <button className="ticket-mini" onClick={onClick}><div className="ticket-mini-icon"><MessageSquare size={17}/></div><div className="ticket-mini-main"><strong>{ticket.subject || 'Support query'}</strong><span>{ticket.ticketNumber || 'Ticket'} <span className="middot">·</span> {date(ticket.updatedAt || ticket.createdAt)}</span></div><div className="ticket-mini-end"><StatusBadge value={ticket.status}/><ChevronRight size={16}/></div></button>; }

function AuthorBooks() {
  const { session } = useAuth(); const [books, setBooks] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [status, setStatus] = useState('All statuses');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setBooks(getArray(await authorApi.books(session.token))); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [session.token]); useEffect(() => { load(); }, [load]);
  const filtered = books.filter((b) => `${b.title} ${b.isbn} ${b.genre}`.toLowerCase().includes(search.toLowerCase()) && (status === 'All statuses' || b.status === status));
  return <Shell role="author" title="My books" subtitle="Your titles, publication details and royalty performance." actions={<button className="btn btn-secondary" onClick={load}><RefreshCw size={15}/> Refresh</button>}>
    <div className="metrics-grid metrics-three"><MetricCard icon={BookOpen} label="Total titles" value={books.length} detail="Books in your account"/><MetricCard icon={Activity} label="Total copies sold" value={books.reduce((n,b)=>n+Number(b.totalCopiesSold ?? b.copiesSold ?? 0),0).toLocaleString('en-IN')} detail="Across all books" tone="violet"/><MetricCard icon={Wallet} label="Pending royalty" value={money(books.reduce((n,b)=>n+Number(b.royaltyPending||0),0))} detail="Awaiting payout" tone="amber"/></div>
    <section className="panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search title, ISBN or genre…" value={search} onChange={(e)=>setSearch(e.target.value)}/></div><div className="select-wrap"><Filter size={15}/><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>All statuses</option>{[...new Set(books.map(b=>b.status).filter(Boolean))].map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div><span className="result-count">{filtered.length} titles</span></div>
      {loading ? <LoadingBlock/> : error ? <ErrorPanel error={error} retry={load}/> : filtered.length ? <div className="table-scroll"><table className="data-table books-table"><thead><tr><th>BOOK TITLE</th><th>STATUS</th><th>PUBLICATION DATE</th><th>MRP</th><th>COPIES SOLD</th><th>ROYALTY EARNED</th><th>PAID</th><th>PENDING</th></tr></thead><tbody>{filtered.map((b,i)=><tr key={b._id||b.bookId}><td><div className="table-book"><div className={`book-cover book-cover-small cover-${['blue','rose','gold','green'][i%4]}`}><BookOpen size={15}/></div><div><strong>{b.title}</strong><span>ISBN {b.isbn||'—'} · {b.genre||'—'}</span></div></div></td><td><StatusBadge value={b.status}/></td><td>{date(b.publicationDate)}</td><td>{money(b.mrp)}</td><td>{Number(b.totalCopiesSold??b.copiesSold??0).toLocaleString('en-IN')}</td><td className="money-cell">{money(b.totalRoyaltyEarned)}</td><td>{money(b.royaltyPaid)}</td><td className="pending-cell">{money(b.royaltyPending)}</td></tr>)}</tbody></table></div> : <EmptyState icon={BookOpen} title="No books match your search" description="Try changing your search or filter."/>}</section>
  </Shell>;
}

function AuthorTickets() {
  const { session } = useAuth(); const [tickets, setTickets] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [status, setStatus] = useState('All statuses'); const navigate = useNavigate();
  const load = useCallback(async () => { setLoading(true); setError(''); try { const data = await authorApi.tickets(session.token, status === 'All statuses' ? { limit: 100 } : { status, limit: 100 }); setTickets(getArray(data)); } catch(e) { setError(e.message); } finally { setLoading(false); } }, [session.token, status]); useEffect(()=>{load();},[load]);
  useTicketSocket(session, load);
  return <Shell role="author" title="My tickets" subtitle="Every question, update and response in one place." actions={<button className="btn btn-primary" onClick={()=>navigate('/author/tickets/new')}><Plus size={16}/> New ticket</button>}>
    <div className="ticket-summary-row"><div><span className="summary-number">{tickets.length}</span><span className="summary-label">Total tickets</span></div><div><span className="summary-number">{tickets.filter(t=>t.status==='Open'||t.status==='In Progress').length}</span><span className="summary-label">Awaiting resolution</span></div><div><span className="summary-number">{tickets.filter(t=>t.status==='Resolved'||t.status==='Closed').length}</span><span className="summary-label">Resolved</span></div></div>
    <section className="panel"><div className="toolbar"><div><h2 className="toolbar-title">Your support history</h2><p className="toolbar-subtitle">Select a ticket to view the conversation.</p></div><div className="select-wrap"><Filter size={15}/><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>All statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div></div>
      {loading?<LoadingBlock/>:error?<ErrorPanel error={error} retry={load}/>:tickets.length?<div className="ticket-list">{tickets.map(t=><TicketListRow key={t._id} ticket={t} onClick={()=>navigate(`/author/tickets/${t._id}`)}/>)}</div>:<EmptyState icon={MessageSquare} title="No support tickets yet" description="When you need help with a book, royalty or publishing update, start a conversation here." action={<button className="btn btn-primary btn-small" onClick={()=>navigate('/author/tickets/new')}><Plus size={15}/> Raise your first query</button>}/>}</section>
  </Shell>;
}
function TicketListRow({ ticket, onClick, admin = false }) { return <button className="ticket-list-row" onClick={onClick}><div className="ticket-row-symbol"><MessageSquare size={18}/></div><div className="ticket-row-content"><div className="ticket-row-title"><strong>{ticket.subject}</strong>{ticket.priority && <PriorityBadge value={ticket.priority}/>}</div><div className="ticket-row-meta"><span>{ticket.ticketNumber || 'Ticket'}</span><span>·</span><span>{ticket.bookTitle || ticket.bookId || 'General inquiry'}</span>{admin && <><span>·</span><span>{ticket.authorId || 'Author'}</span></>}</div><p>{ticket.description}</p></div><div className="ticket-row-end"><StatusBadge value={ticket.status}/><span>{date(ticket.updatedAt||ticket.createdAt)}</span><ChevronRight size={17}/></div></button>; }

function NewTicket() {
  const { session } = useAuth(); const notify = useToast(); const navigate = useNavigate(); const [books, setBooks] = useState([]); const [booksError, setBooksError] = useState(''); const [loadingBooks, setLoadingBooks] = useState(true); const [saving, setSaving] = useState(false); const [bookId, setBookId] = useState(''); const [subject, setSubject] = useState(''); const [description, setDescription] = useState(''); const [fileName, setFileName] = useState('');
  useEffect(()=>{authorApi.books(session.token).then((d)=>setBooks(getArray(d))).catch(e=>setBooksError(e.message)).finally(()=>setLoadingBooks(false));},[session.token]);
  async function submit(e) { e.preventDefault(); setSaving(true); try { const result = await authorApi.createTicket(session.token, { bookId: bookId || null, subject: subject.trim(), description: description.trim(), ...(fileName ? { attachmentName: fileName } : {}) }); notify('Your support ticket has been created'); navigate(`/author/tickets/${result._id}`); } catch(e) { toastError(e, notify); } finally { setSaving(false); } }
  return <Shell role="author" title="Raise a support query" subtitle="Tell us what you need help with. The BookLeaf team will take it from here." actions={<button className="btn btn-secondary" onClick={()=>navigate('/author/tickets')}><ArrowLeft size={15}/> Back to tickets</button>}>
    <div className="form-page-grid"><div className="panel ticket-form-panel"><div className="form-intro"><div className="form-intro-icon"><MessageCircle size={21}/></div><div><h2>Tell us how we can help</h2><p>Share a few details so we can route your query to the right team.</p></div></div>
      <form className="form-stack support-form" onSubmit={submit}><label>What is your query about?<span className="required">*</span><div className="select-field"><select value={bookId} onChange={e=>setBookId(e.target.value)}><option value="">General / Account Level</option>{books.map(b=><option value={b.bookId} key={b.bookId}>{b.title} · {b.bookId}</option>)}</select><ChevronDown size={16}/></div>{booksError && <small className="field-help">Could not load books: {booksError}</small>}{loadingBooks && <small className="field-help">Loading your books…</small>}</label>
        <label>Subject <span className="required">*</span><input className="text-input" minLength={3} maxLength={180} required placeholder="e.g. Question about my royalty payment" value={subject} onChange={e=>setSubject(e.target.value)}/><small className="field-help">A short summary helps us understand your question.</small></label>
        <label>Describe your query <span className="required">*</span><textarea className="text-input textarea" minLength={10} maxLength={10000} required rows={7} placeholder="Tell us what happened and what you need help with…" value={description} onChange={e=>setDescription(e.target.value)}/><div className="field-foot"><small>Include any relevant details so we can help faster.</small><small>{description.length}/10,000</small></div></label>
        <label className="attachment-field"><span>Attachment <span className="optional">(optional)</span></span><div className="attachment-box"><Paperclip size={18}/><div><strong>{fileName || 'Add a file name'}</strong><small>Attachment UI only — file upload is not enabled in this assignment build.</small></div><label className="btn btn-secondary btn-small file-picker">Choose file<input type="file" onChange={e=>setFileName(e.target.files?.[0]?.name || '')}/></label></div></label>
        <div className="form-bottom"><span><ShieldCheck size={15}/> Your ticket is only visible to you and the support team.</span><button className="btn btn-primary btn-large" disabled={saving}>{saving ? <><span className="spinner"/> Submitting…</> : <>Submit query <ArrowRight size={16}/></>}</button></div>
      </form></div><aside className="form-aside"><div className="aside-card aside-blue"><div className="aside-art"><Headphones size={28}/></div><h3>What happens next?</h3><ol className="steps-list"><li><span>1</span><div><strong>Your query is logged</strong><p>We’ll create a ticket and share a reference number.</p></div></li><li><span>2</span><div><strong>The right team reviews it</strong><p>Your query is routed based on its topic and urgency.</p></div></li><li><span>3</span><div><strong>You get a response</strong><p>Follow replies and status updates in My Tickets.</p></div></li></ol></div><div className="aside-card"><div className="aside-title"><Zap size={17}/> Helpful tip</div><p>For royalty queries, include the book title and the payment period you’re asking about.</p></div></aside></div>
  </Shell>;
}

function AdminOverview() {
  const { session } = useAuth(); const notify = useToast(); const [summary, setSummary] = useState(null); const [tickets, setTickets] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const navigate = useNavigate();
  const load = useCallback(async()=>{setLoading(true);setError('');try{const [s,t]=await Promise.all([adminApi.dashboard(session.token),adminApi.tickets(session.token,{limit:6})]);setSummary(s);setTickets(getArray(t));}catch(e){setError(e.message);}finally{setLoading(false);}},[session.token]); useEffect(()=>{load();},[load]); useTicketSocket(session,load);
  const categoryRows = (summary?.byCategory||[]).slice().sort((a,b)=>b.count-a.count); const max = Math.max(1,...categoryRows.map(x=>x.count));
  return <Shell role="admin" title="Operations overview" subtitle="A live view of author support across BookLeaf." actions={<button className="btn btn-secondary" onClick={load}><RefreshCw size={15}/> Refresh data</button>}>
    {loading?<LoadingBlock/>:error?<ErrorPanel error={error} retry={load}/>:<>
      <div className="admin-welcome"><div><div className="welcome-kicker"><Activity size={14}/> SUPPORT OPERATIONS</div><h2>Good work starts with a clear queue.</h2><p>Review urgent requests, keep responses consistent, and make every author feel heard.</p></div><div className="admin-welcome-side"><div className="admin-spark"><Bot size={27}/></div><div><strong>AI support assistant</strong><span>Drafts are ready for human review</span></div></div></div>
      <div className="metrics-grid metrics-four"><MetricCard icon={Ticket} label="All tickets" value={summary?.total ?? 0} detail="Across all authors" tone="blue"/><MetricCard icon={Clock3} label="Open" value={summary?.open ?? 0} detail="Needs a first response" tone="amber"/><MetricCard icon={Activity} label="In progress" value={summary?.inProgress ?? 0} detail="Being handled" tone="violet"/><MetricCard icon={Zap} label="Critical unresolved" value={summary?.criticalUnresolved ?? 0} detail="Prioritise these first" tone="rose"/></div>
      <div className="content-grid admin-content-grid"><section className="panel"><SectionHeader title="Priority queue" subtitle="Urgent and unresolved requests first" action={<button className="text-button" onClick={()=>navigate('/admin/tickets')}>Open queue <ArrowRight size={14}/></button>}/>{tickets.length?<div className="ticket-mini-list">{tickets.map(t=><TicketMini key={t._id} ticket={t} onClick={()=>navigate(`/admin/tickets/${t._id}`)}/>)}</div>:<EmptyState icon={Ticket} title="Queue is clear" description="New author support requests will appear here."/>}</section>
        <section className="panel"><SectionHeader title="Ticket categories" subtitle="Where authors need help"/>{categoryRows.length?<div className="category-chart">{categoryRows.map(row=><div className="category-row" key={row._id}><div className="category-label"><span>{row._id||'Uncategorised'}</span><strong>{row.count}</strong></div><div className="bar-track"><div className="bar-fill" style={{width:`${Math.max(5,row.count/max*100)}%`}}/></div></div>)}</div>:<EmptyState icon={Activity} title="No category data yet" description="Category trends appear when tickets are created."/>}<div className="ai-note"><div><Sparkles size={17}/></div><p><strong>AI helps with triage.</strong><br/>Classification and priority can be overridden by the support team.</p></div></section></div>
    </>}
  </Shell>;
}

function AdminQueue() {
  const { session } = useAuth(); const [tickets,setTickets]=useState([]); const [pagination,setPagination]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [status,setStatus]=useState(''); const [priority,setPriority]=useState(''); const [category,setCategory]=useState(''); const [search,setSearch]=useState(''); const [searchApplied,setSearchApplied]=useState(''); const [fromDate,setFromDate]=useState(''); const [toDate,setToDate]=useState(''); const [page,setPage]=useState(1); const navigate=useNavigate();
  const load=useCallback(async()=>{setLoading(true);setError('');try{const data=await adminApi.tickets(session.token,{status,priority,category,search:searchApplied,from:fromDate,to:toDate,page,limit:10});setTickets(getArray(data));setPagination(data.pagination||null);}catch(e){setError(e.message);}finally{setLoading(false);}},[session.token,status,priority,category,searchApplied,fromDate,toDate,page]);useEffect(()=>{load();},[load]);useTicketSocket(session,load);
  function resetFilters(){setStatus('');setPriority('');setCategory('');setSearch('');setSearchApplied('');setFromDate('');setToDate('');setPage(1);}
  return <Shell role="admin" title="Ticket queue" subtitle="Triage, assign and resolve incoming author queries." actions={<button className="btn btn-secondary" onClick={load}><RefreshCw size={15}/> Refresh queue</button>}>
    <div className="queue-stats"><div><span className="queue-stat-dot dot-critical"/><span>Critical first</span></div><div><span className="queue-stat-dot dot-open"/><span>Oldest unresolved next</span></div><span className="queue-count">{pagination?.total ?? tickets.length} total tickets</span></div>
    <section className="panel queue-panel"><div className="filter-toolbar"><form className="search-box queue-search" onSubmit={e=>{e.preventDefault();setPage(1);setSearchApplied(search.trim());}}><Search size={17}/><input placeholder="Search subject, ticket ID or message…" value={search} onChange={e=>setSearch(e.target.value)}/><button type="submit" className="search-submit">Search</button></form><div className="select-wrap"><Filter size={15}/><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div><div className="select-wrap"><select value={priority} onChange={e=>{setPriority(e.target.value);setPage(1);}}><option value="">All priorities</option>{PRIORITIES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div><div className="select-wrap category-filter"><select value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}><option value="">All categories</option>{CATEGORIES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div><label className="date-filter"><span>From</span><input aria-label="From date" type="date" value={fromDate} onChange={e=>{setFromDate(e.target.value);setPage(1);}}/></label><label className="date-filter"><span>To</span><input aria-label="To date" type="date" value={toDate} onChange={e=>{setToDate(e.target.value);setPage(1);}}/></label><button className="icon-button filter-reset" title="Clear filters" onClick={resetFilters}><RefreshCw size={15}/></button></div>
      {loading?<LoadingBlock label="Loading ticket queue…"/>:error?<ErrorPanel error={error} retry={load}/>:tickets.length?<><div className="queue-list">{tickets.map(t=><TicketListRow key={t._id} ticket={t} admin onClick={()=>navigate(`/admin/tickets/${t._id}`)}/>)}</div><div className="pagination"><span>Showing {tickets.length ? ((page-1)*10+1) : 0}–{(page-1)*10+tickets.length} of {pagination?.total ?? tickets.length}</span><div><button className="btn btn-secondary btn-small" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={15}/> Previous</button><span className="page-number">{page}{pagination?.pages ? ` / ${pagination.pages}` : ''}</span><button className="btn btn-secondary btn-small" disabled={pagination?.pages ? page>=pagination.pages : tickets.length<10} onClick={()=>setPage(p=>p+1)}>Next <ChevronRight size={15}/></button></div></div></>:<EmptyState icon={Ticket} title="No tickets found" description="Try clearing a filter or check back when new author queries arrive." action={<button className="btn btn-secondary btn-small" onClick={resetFilters}>Clear filters</button>}/>}</section>
  </Shell>;
}

function useTicketSocket(session, refresh) {
  useEffect(()=>{
    if (!session?.token) return;
    const socket = io(SOCKET_URL, { auth: { token: session.token }, transports: ['websocket','polling'], reconnectionAttempts: 3 });
    socket.on('ticket:created', refresh); socket.on('ticket:updated', refresh); socket.on('ticket:message', refresh);
    return ()=>socket.disconnect();
  },[session?.token, refresh]);
}

function TicketDetails({ role }) {
  const isAdmin = role === 'admin'; const { id } = useParams(); const { session } = useAuth(); const notify = useToast(); const navigate=useNavigate();
  const [ticketData,setTicketData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [draft,setDraft]=useState(''); const [reply,setReply]=useState(''); const [note,setNote]=useState(''); const [busy,setBusy]=useState(''); const [draftInfo,setDraftInfo]=useState(null); const [editStatus,setEditStatus]=useState(''); const [editPriority,setEditPriority]=useState(''); const [editCategory,setEditCategory]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');try{const data=isAdmin?await adminApi.ticket(session.token,id):await authorApi.ticket(session.token,id);setTicketData(data);setEditStatus(data.ticket?.status||'Open');setEditPriority(data.ticket?.priority||'Medium');setEditCategory(data.ticket?.category||'General Inquiry');}catch(e){setError(e.message);}finally{setLoading(false);}},[isAdmin,session.token,id]); useEffect(()=>{load();},[load]);
  useTicketSocket(session,load);
  async function generateDraft(){setBusy('draft');try{const result=await adminApi.draft(session.token,id);setDraft(result.draft||result.response||result.message||result.text||'');setDraftInfo(result);notify(result.aiGenerated===false?'Fallback draft ready — AI provider unavailable':'AI draft generated');}catch(e){toastError(e,notify);}finally{setBusy('');}}
  async function saveMeta(){setBusy('meta');try{await adminApi.update(session.token,id,{status:editStatus,priority:editPriority,category:editCategory});notify('Ticket details updated');await load();}catch(e){toastError(e,notify);}finally{setBusy('');}}
  async function sendReply(e){e.preventDefault();const message=(reply||draft).trim();if(!message)return;setBusy('reply');try{await adminApi.reply(session.token,id,message);setReply('');setDraft('');setDraftInfo(null);notify('Reply sent to author');await load();}catch(e){toastError(e,notify);}finally{setBusy('');}}
  async function addNote(e){e.preventDefault();if(!note.trim())return;setBusy('note');try{await adminApi.note(session.token,id,note.trim());setNote('');notify('Internal note added');await load();}catch(e){toastError(e,notify);}finally{setBusy('');}}
  async function assign(){setBusy('assign');try{await adminApi.update(session.token,id,{assignToMe:true});notify('Ticket assigned to you');await load();}catch(e){toastError(e,notify);}finally{setBusy('');}}
  const ticket=ticketData?.ticket; const messages=ticketData?.messages||[];
  return <Shell role={role} title={isAdmin?'Ticket details':'Ticket conversation'} subtitle={isAdmin?'Review the query, manage ticket status and send a considered response.':'Follow the progress of your query and messages from the BookLeaf team.'} actions={<button className="btn btn-secondary" onClick={()=>navigate(isAdmin?'/admin/tickets':'/author/tickets')}><ArrowLeft size={15}/> Back to {isAdmin?'queue':'tickets'}</button>}>
    {loading?<LoadingBlock label="Loading ticket conversation…"/>:error?<ErrorPanel error={error} retry={load}/>:ticket?<>
      <div className="ticket-detail-heading"><div><div className="ticket-id-line"><span className="ticket-id">{ticket.ticketNumber||`Ticket ${ticket._id?.slice(-6)}`}</span><span className="middot">·</span><span>Created {date(ticket.createdAt)}</span></div><h2>{ticket.subject}</h2><div className="ticket-detail-pills"><StatusBadge value={ticket.status}/><PriorityBadge value={ticket.priority}/><span className="category-pill">{ticket.category}</span></div></div>{isAdmin&&<button className="btn btn-secondary" onClick={assign} disabled={busy==='assign'}><UserRound size={15}/> {busy==='assign'?'Assigning…':'Assign to me'}</button>}</div>
      <div className={`ticket-detail-grid ${isAdmin?'admin-detail-grid':''}`}><div className="ticket-detail-main"><section className="panel"><SectionHeader title="Conversation" subtitle={isAdmin?`${ticket.authorId||'Author'} · ${ticket.bookTitle||'General / Account Level'}`:'Your question and support replies'}/><div className="conversation"><article className="message-card message-author"><div className="message-avatar message-avatar-author"><UserRound size={17}/></div><div className="message-content"><div className="message-top"><strong>{isAdmin ? ticket.authorId || 'Author' : 'You'}</strong><span>{date(ticket.createdAt,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><p>{ticket.description}</p>{ticket.attachmentName&&<div className="message-attachment"><Paperclip size={14}/>{ticket.attachmentName}</div>}</div></article>
          {messages.map((m,i)=><article className={`message-card ${m.senderRole==='admin'?'message-admin':'message-author'} ${m.isInternal?'message-internal':''}`} key={m._id||i}><div className={`message-avatar ${m.senderRole==='admin'?'message-avatar-admin':'message-avatar-author'}`}>{m.isInternal?<ShieldCheck size={17}/>:m.senderRole==='admin'?<Headphones size={17}/>:<UserRound size={17}/>}</div><div className="message-content"><div className="message-top"><strong>{m.isInternal?'Internal note':m.senderName||(m.senderRole==='admin'?'BookLeaf Support':'Author')}</strong><span>{date(m.createdAt,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><p>{m.body||m.message}</p>{m.isInternal&&<span className="internal-label"><ShieldCheck size={12}/> Visible to admins only</span>}</div></article>)}</div>
        {isAdmin?<form className="reply-composer" onSubmit={sendReply}><label>Reply to author</label><textarea className="text-input textarea" rows={4} placeholder="Write a clear, helpful response…" value={reply} onChange={e=>setReply(e.target.value)}/><div className="composer-bottom"><span><ShieldCheck size={14}/> This message will be visible to the author.</span><button className="btn btn-primary" disabled={busy==='reply'||!(reply||draft).trim()}>{busy==='reply'?<span className="spinner"/>:<Send size={15}/>} Send reply</button></div></form>:<div className="conversation-foot"><span><RefreshCw size={14}/> Updates sync automatically when connected.</span><button className="btn btn-secondary btn-small" onClick={load}><RefreshCw size={14}/> Refresh</button></div>}
        </section>
        {isAdmin&&<section className="panel internal-note-panel"><SectionHeader title="Internal notes" subtitle="Private notes for the BookLeaf team — never shown to the author."/><form className="internal-note-form" onSubmit={addNote}><textarea className="text-input textarea" rows={2} placeholder="Add an internal note for your team…" value={note} onChange={e=>setNote(e.target.value)}/><button className="btn btn-secondary" disabled={busy==='note'||!note.trim()}>{busy==='note'?<span className="spinner spinner-dark"/>:<Plus size={15}/>} Add note</button></form>{(ticket.internalNotes||[]).length>0&&<div className="internal-notes-list">{ticket.internalNotes.map((n,i)=><div className="internal-note" key={n._id||i}><ShieldCheck size={15}/><div><strong>{n.authorName||'Admin'} <span>{date(n.createdAt)}</span></strong><p>{n.body}</p></div></div>)}</div>}</section>}
      </div>
      {isAdmin&&<aside className="ticket-detail-side"><section className="panel ai-panel"><div className="ai-panel-header"><div className="ai-panel-icon"><Sparkles size={18}/></div><div><h3>AI response assistant</h3><p>Drafts grounded in BookLeaf policy</p></div><span className="ai-live">AI</span></div><div className="ai-panel-body"><p className="ai-helper">Generate a suggested reply, review it for accuracy, then edit and send.</p><button className="btn btn-ai btn-full" onClick={generateDraft} disabled={busy==='draft'}>{busy==='draft'?<><span className="spinner"/> Generating…</>:<><Sparkles size={16}/> Generate response draft</>}</button>{draftInfo&&<div className={`ai-source ${draftInfo.aiGenerated===false?'ai-fallback':''}`}><span className="source-dot"/>{draftInfo.aiGenerated===false?'Manual fallback draft':'AI-generated suggestion'} · review before sending</div>}{draft&&<div className="draft-preview"><div className="draft-preview-head"><strong>Suggested response</strong><button className="text-button" onClick={()=>{setReply(draft);notify('Draft copied into reply editor');}}>Use in reply <ArrowDownRight size={13}/></button></div><textarea className="text-input textarea draft-textarea" rows={7} value={draft} onChange={e=>setDraft(e.target.value)}/><p className="field-help">You can edit this draft before sending it to the author.</p><button className="btn btn-secondary btn-full" onClick={()=>setReply(draft)}><Check size={15}/> Use this response</button></div>}</div></section>
        <section className="panel ticket-properties"><SectionHeader title="Ticket properties"/><label>Status<select className="text-input" value={editStatus} onChange={e=>setEditStatus(e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><label>Priority<select className="text-input" value={editPriority} onChange={e=>setEditPriority(e.target.value)}>{PRIORITIES.map(s=><option key={s}>{s}</option>)}</select></label><label>Category<select className="text-input" value={editCategory} onChange={e=>setEditCategory(e.target.value)}>{CATEGORIES.map(s=><option key={s}>{s}</option>)}</select></label><button className="btn btn-primary btn-full" onClick={saveMeta} disabled={busy==='meta'}>{busy==='meta'?<span className="spinner"/>:<Check size={15}/>} Save changes</button><div className="property-divider"/><div className="property-row"><span>Author ID</span><strong>{ticket.authorId||'—'}</strong></div><div className="property-row"><span>Related book</span><strong>{ticket.bookTitle||'General inquiry'}</strong></div><div className="property-row"><span>Created</span><strong>{date(ticket.createdAt)}</strong></div><div className="property-row"><span>Last updated</span><strong>{date(ticket.updatedAt)}</strong></div></section>
      </aside>}
      </div>
    </>:null}
  </Shell>;
}
