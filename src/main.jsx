import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@material/web/all.js';
import './styles.css';

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const Icon = ({ children }) => <span className="material-symbols-rounded">{children}</span>;

function TextField({ label, value, onInput, type = 'text', error }) {
  return <div className="field-wrap"><md-outlined-text-field label={label} type={type} value={value} oninput={onInput}></md-outlined-text-field>{error && <small className="error-text">{error}</small>}</div>;
}
function TopBar({ title, left, right, onLeft, onRight }) {
  return <header className="topbar">{left ? <md-icon-button aria-label={left} onClick={onLeft}><Icon>{left}</Icon></md-icon-button> : <div className="topbar-spacer" />}<h1>{title}</h1>{right ? <md-icon-button aria-label={right} onClick={onRight}><Icon>{right}</Icon></md-icon-button> : <div className="topbar-spacer" />}</header>;
}
function BottomNav({ screen, navigate }) {
  return <nav className="bottom-nav">{[['chat','Chats','chats'],['contacts','Contacts','contacts'],['person','Profile','profile']].map(([icon,label,key]) => <button className={screen === key ? 'nav-item active' : 'nav-item'} onClick={() => navigate(key)} key={key}><span className="nav-pill"><Icon>{icon}</Icon></span><span>{label}</span></button>)}</nav>;
}
function Registration({ onRegister, onSignIn }) {
  const [name,setName]=useState(''), [email,setEmail]=useState(''), [password,setPassword]=useState(''), [agree,setAgree]=useState(true), [error,setError]=useState('');
  const submit = () => { if (!name.trim() || !email.includes('@') || password.length < 6 || !agree) return setError('Enter your name, a valid email, a 6+ character password, and accept the terms.'); onRegister({name:name.trim(),email}); };
  return <main className="registration screen-enter"><TopBar title="skymessanger" /><section className="welcome"><h2>Connect beyond<br/>the clouds</h2><p>Create your account and start chatting privately.</p><div className="form-stack"><TextField label="Full name" value={name} onInput={e=>setName(e.target.value)} /><TextField label="Email address" value={email} onInput={e=>setEmail(e.target.value)} type="email" /><TextField label="Password" value={password} onInput={e=>setPassword(e.target.value)} type="password" /></div><label className="check-row"><md-checkbox checked={agree} onchange={e=>setAgree(e.target.checked)}></md-checkbox><span>I agree to the Terms of Service</span></label>{error && <p className="error-text form-error">{error}</p>}<md-filled-button class="wide-button" onClick={submit}>Create account <Icon>arrow_forward</Icon></md-filled-button><md-text-button class="wide-button" onClick={onSignIn}>Already have an account? Sign in</md-text-button></section></main>;
}
function EmptyState({ onNew }) { return <section className="empty-state"><div className="empty-icon"><Icon>forum</Icon></div><h2>Your sky is quiet</h2><p>Start a private conversation with someone you know.</p><md-filled-button onClick={onNew}><Icon>edit</Icon> New conversation</md-filled-button></section>; }
function Chats({ navigate, onNew, conversations }) {
 const [filter,setFilter]=useState('All');
 return <main className="app-screen screen-enter"><TopBar title="Chats" left="menu" right="search" /><div className="content"><div className="chips">{['All','Unread','Groups'].map(x=><md-filter-chip selected={filter===x} onClick={()=>setFilter(x)} key={x}>{filter===x&&<Icon>check</Icon>}{x}</md-filter-chip>)}</div>{conversations.length ? <div className="list">{conversations.map(c=><button className="list-item" key={c.id} onClick={()=>navigate('conversation',c)}><span className="avatar"><Icon>{c.group?'groups':'person'}</Icon></span><span className="item-copy"><strong>{c.name}</strong><small>{c.messages.at(-1)?.text || 'No messages yet'}</small></span><Icon>chevron_right</Icon></button>)}</div> : <EmptyState onNew={onNew}/>}</div><md-fab className="new-fab" aria-label="New conversation" onClick={onNew}><Icon>edit</Icon></md-fab><BottomNav screen="chats" navigate={navigate}/></main>;
}
function Conversation({ contact, onBack, onSend }) {
 const [text,setText]=useState(''); const messages=contact?.messages||[];
 const send=()=>{if(text.trim()){onSend(text.trim());setText('')}};
 return <main className="app-screen conversation screen-enter"><TopBar title={contact?.name||'Conversation'} left="arrow_back" right="more_vert" onLeft={onBack}/><div className="online"><span className="status-dot"/> Online now</div><div className="message-area">{messages.length ? messages.map((m,i)=><div className={m.mine?'bubble mine':'bubble'} key={i}>{m.text}</div>) : <div className="conversation-empty"><Icon>lock</Icon><p>Messages are private and encrypted.</p></div>}</div><div className="composer"><md-outlined-text-field label="Write a message" value={text} oninput={e=>setText(e.target.value)} onkeydown={e=>e.key==='Enter'&&send()}></md-outlined-text-field><md-icon-button className="send-button" aria-label="Send" onClick={send}><Icon>send</Icon></md-icon-button></div></main>;
}
function NewConversation({ onClose, onCreate }) { const [name,setName]=useState(''); return <div className="dialog-backdrop"><section className="dialog"><div className="dialog-title"><h2>New conversation</h2><md-icon-button onClick={onClose}><Icon>close</Icon></md-icon-button></div><p>Add a contact to start chatting privately.</p><TextField label="Contact name" value={name} onInput={e=>setName(e.target.value)}/><md-filled-button disabled={!name.trim()} onClick={()=>onCreate(name.trim())}>Start chat <Icon>arrow_forward</Icon></md-filled-button></section></div>; }
function Profile({ navigate, user, onSignOut }) { const [notifications,setNotifications]=useState(true); return <main className="app-screen screen-enter"><TopBar title="Profile" right="more_vert"/><div className="content profile-content"><div className="profile-hero"><div className="profile-avatar"><Icon>person</Icon></div><div><h2>{user?.name||'Your profile'}</h2><p>{user?.email||'Set up your account'}</p></div></div><div className="settings-list"><button className="setting"><span className="setting-icon"><Icon>edit</Icon></span><span><strong>Edit profile</strong><small>Update your name and photo</small></span><Icon>chevron_right</Icon></button><div className="setting"><span className="setting-icon"><Icon>notifications</Icon></span><span><strong>Notifications</strong><small>Messages and call alerts</small></span><md-switch selected={notifications} onchange={e=>setNotifications(e.target.selected)}></md-switch></div>{[['lock','Privacy and security','Control who can contact you'],['palette','Appearance','Theme and chat colors']].map(([icon,title,desc])=><button className="setting" key={title}><span className="setting-icon"><Icon>{icon}</Icon></span><span><strong>{title}</strong><small>{desc}</small></span><Icon>chevron_right</Icon></button>)}</div><md-outlined-button className="wide-button signout" onClick={onSignOut}><Icon>logout</Icon> Sign out</md-outlined-button></div><BottomNav screen="profile" navigate={navigate}/></main>; }
function App() {
 const [user,setUser]=useState(()=>load('sky-user',null)); const [conversations,setConversations]=useState(()=>load('sky-conversations',[])); const [screen,setScreen]=useState(user?'chats':'registration'); const [contact,setContact]=useState(null); const [newChat,setNewChat]=useState(false);
 useEffect(()=>save('sky-conversations',conversations),[conversations]);
 const navigate=(next,data)=>{ if(next==='conversation'){setContact(data);setScreen(next);} else {setScreen(next);setContact(null);} };
 const register=u=>{setUser(u);save('sky-user',u);setScreen('chats')};
 const create=name=>{const c={id:crypto.randomUUID(),name,messages:[],group:false};setConversations(x=>[...x,c]);setNewChat(false);navigate('conversation',c)};
 const send=text=>{setConversations(all=>all.map(c=>c.id===contact.id?{...c,messages:[...c.messages,{text,mine:true}]}:c));setContact(c=>({...c,messages:[...(c.messages||[]),{text,mine:true}]}))};
 if(screen==='registration') return <Registration onRegister={register} onSignIn={()=>setScreen('chats')}/>;
 return <>{screen==='chats'&&<Chats navigate={navigate} onNew={()=>setNewChat(true)} conversations={conversations}/>} {screen==='conversation'&&<Conversation contact={contact} onBack={()=>setScreen('chats')} onSend={send}/>} {screen==='profile'&&<Profile navigate={navigate} user={user} onSignOut={()=>{localStorage.removeItem('sky-user');setUser(null);setScreen('registration')}}/>}{newChat&&<NewConversation onClose={()=>setNewChat(false)} onCreate={create}/>}</>;
}

createRoot(document.getElementById('root')).render(<App />);
