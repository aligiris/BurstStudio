import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type Stage = 'idea' | 'scripting' | 'live';
type TabId = 'dashboard' | 'projeler' | 'analytics' | 'takvim' | 'ayarlar';

interface VideoCard {
  id: string; title: string; category: string; duration: string;
  views?: string; stage: Stage; status?: Stage; tags: string[]; color: string;
  platform?: string; publishDate?: string;
}

interface AIScript {
  hook: string;
  intro: string;
  hashtags: string;
  suggestedDuration: string;
  bRollSuggestion: string;
}

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface CalEvent {
  day: number; hour: number; title: string; platform: string; color: string;
  desc?: string; publishTime?: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const INITIAL_CARDS: VideoCard[] = [
  { id: 'c1', title: 'RTX 5090 ile 8K Video Render Testleri', category: '🖥️ Donanım', duration: '12 dk', stage: 'idea', status: 'idea', tags: ['#GPU', '#Render'], color: 'purple', platform: 'YouTube', publishDate: '2025-06-15' },
  { id: 'c2', title: 'Yapay Zeka ile Müzik Üretimi – 2025 Rehberi', category: '🤖 Teknoloji', duration: '18 dk', stage: 'idea', status: 'idea', tags: ['#AI', '#Müzik'], color: 'cyan', platform: 'YouTube Shorts', publishDate: '2025-06-18' },
  { id: 'c3', title: 'iPhone 17 Pro Max Detaylı İnceleme', category: '📱 Teknoloji', duration: '22 dk', stage: 'scripting', status: 'scripting', tags: ['#iPhone', '#Apple'], color: 'pink', platform: 'TikTok', publishDate: '2025-06-20' },
  { id: 'c4', title: 'LG OLED C5 vs Samsung Neo QLED: Renk Savaşı', category: '📺 Donanım', duration: '16 dk', stage: 'scripting', status: 'scripting', tags: ['#OLED', '#TV'], color: 'orange', platform: 'YouTube', publishDate: '2025-06-22' },
  { id: 'c5', title: "Türkiye'nin İlk Yerli AI Çipi – Tarihi An", category: '🇹🇷 Tarih', duration: '9 dk', views: '412K', stage: 'live', status: 'live', tags: ['#Teknoloji', '#Yerli'], color: 'green', platform: 'YouTube Shorts', publishDate: '2025-06-05' },
  { id: 'c6', title: "2025'te Dijital Göçebe Olmak: Tam Rehber", category: '🌍 Yaşam', duration: '31 dk', views: '287K', stage: 'live', status: 'live', tags: ['#RemoteWork', '#Freelance'], color: 'cyan', platform: 'Kick', publishDate: '2025-06-08' },
];

const COLUMNS: { id: Stage; label: string; icon: string }[] = [
  { id: 'idea', label: 'Fikir Aşamasında', icon: '💡' },
  { id: 'scripting', label: 'Senaryosu Yazılıyor', icon: '✍️' },
  { id: 'live', label: 'Yayında', icon: '🚀' },
];

const CATEGORIES = ['🤖 Teknoloji', '🖥️ Donanım', '📱 Mobil', '🎮 Oyun', '🇹🇷 Tarih', '🌍 Yaşam', '📺 İnceleme', '🎨 Yaratıcılık'];
const PLATFORMS = ['YouTube', 'YouTube Shorts', 'TikTok', 'Kick', 'Instagram Reels', 'Twitch'];

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
  { id: 'projeler', label: 'Projeler', icon: '📁' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'takvim', label: 'Takvim', icon: '📅' },
  { id: 'ayarlar', label: 'Ayarlar', icon: '⚙️' },
];

const MOCK_NOTIFS = [
  { id: 'n1', icon: '✨', text: 'Yeni video fikri AI ile üretildi!', time: '2 dk önce', unread: true },
  { id: 'n2', icon: '🔗', text: 'YouTube API bağlantısı başarılı.', time: '15 dk önce', unread: true },
  { id: 'n3', icon: '🚀', text: '"Yerli AI Çipi" videosu 400K izlenmeye ulaştı!', time: '1 sa önce', unread: false },
];

const CAL_EVENTS: CalEvent[] = [
  { day: 0, hour: 2, title: 'RTX 5090 Render', platform: 'YouTube', color: 'purple', desc: 'RTX 5090 ile 8K render performans testi. Gerçek zamanlı benchmark karşılaştırmaları.', publishTime: '13:00' },
  { day: 1, hour: 4, title: 'iPhone 17 İnceleme', platform: 'TikTok', color: 'pink', desc: 'iPhone 17 Pro Max kutu açılışı ve ilk izlenim. Kamera testleri dahil.', publishTime: '17:00' },
  { day: 2, hour: 1, title: 'AI Müzik Üretimi', platform: 'YouTube Shorts', color: 'cyan', desc: 'Suno AI ile 60 saniyede profesyonel müzik üretimi rehberi.', publishTime: '11:00' },
  { day: 3, hour: 5, title: 'Dijital Göçebe', platform: 'Kick', color: 'green', desc: '2025\'te dijital göçebe olmak: araçlar, şehirler ve bütçe planlaması.', publishTime: '19:00' },
  { day: 4, hour: 3, title: 'OLED vs QLED', platform: 'YouTube', color: 'orange', desc: 'LG OLED C5 ile Samsung Neo QLED 8K kapsamlı karşılaştırma.', publishTime: '15:00' },
  { day: 5, hour: 6, title: 'Canlı Yayın: Q&A', platform: 'Kick', color: 'green', desc: 'İzleyicilerle canlı soru-cevap oturumu ve haftalık özet.', publishTime: '21:00' },
  { day: 6, hour: 2, title: 'Yerli AI Çipi', platform: 'YouTube', color: 'yellow', desc: 'Türkiye\'nin ilk yerli AI çipi detaylı analiz ve röportaj.', publishTime: '13:00' },
];

const PLATFORM_COLORS: Record<string, string> = {
  'YouTube': 'red', 'YouTube Shorts': 'red', 'TikTok': 'pink',
  'Kick': 'green', 'Instagram Reels': 'purple', 'Twitch': 'purple',
};

const STAGE_META: Record<Stage, { label: string; color: string }> = {
  idea: { label: '💡 Fikir', color: 'yellow' },
  scripting: { label: '✍️ Senaryo', color: 'cyan' },
  live: { label: '🚀 Yayında', color: 'green' },
};

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const HOURS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

const ANALYTICS_STATS = [
  { label: 'Toplam İzlenme', value: '2.4M', delta: '+18.3%', icon: '👁', color: 'purple' },
  { label: 'Abone Artışı', value: '+12.8K', delta: '+7.2%', icon: '📈', color: 'cyan' },
  { label: 'Ort. İzlenme Süresi', value: '4:32', delta: '+0:41', icon: '⏱', color: 'green' },
  { label: 'Tahmini Gelir', value: '₺8,640', delta: '+22.1%', icon: '💰', color: 'yellow' },
];

const MONTHLY_DATA = [
  { month: 'Oca', views: 180, subs: 45, revenue: 520 },
  { month: 'Şub', views: 240, subs: 62, revenue: 710 },
  { month: 'Mar', views: 310, subs: 78, revenue: 890 },
  { month: 'Nis', views: 280, subs: 55, revenue: 810 },
  { month: 'May', views: 420, subs: 110, revenue: 1240 },
  { month: 'Haz', views: 390, subs: 98, revenue: 1150 },
];

const KICK_MONTHLY_DATA = [
  { month: 'Oca', donation: 450, viewers: 120, hours: 25 },
  { month: 'Şub', donation: 600, viewers: 180, hours: 30 },
  { month: 'Mar', donation: 1200, viewers: 340, hours: 45 },
  { month: 'Nis', donation: 2800, viewers: 890, hours: 80 },
  { month: 'May', donation: 7500, viewers: 2400, hours: 140 },
  { month: 'Haz', donation: 14820, viewers: 8400, hours: 320 },
];

const KICK_MONTHLY_DATA_DISCONNECTED = [
  { month: 'Oca', donation: 10, viewers: 5, hours: 2 },
  { month: 'Şub', donation: 25, viewers: 12, hours: 4 },
  { month: 'Mar', donation: 40, viewers: 18, hours: 6 },
  { month: 'Nis', donation: 65, viewers: 24, hours: 8 },
  { month: 'May', donation: 95, viewers: 35, hours: 10 },
  { month: 'Haz', donation: 120, viewers: 45, hours: 12 },
];

const TIKTOK_MONTHLY_DATA = [
  { month: 'Oca', followers: 120, likes: 850, shares: 15 },
  { month: 'Şub', followers: 350, likes: 2100, shares: 48 },
  { month: 'Mar', followers: 780, likes: 5400, shares: 120 },
  { month: 'Nis', followers: 1200, likes: 9200, shares: 210 },
  { month: 'May', followers: 1800, likes: 14000, shares: 330 },
  { month: 'Haz', followers: 2400, likes: 18200, shares: 450 },
];

const TIKTOK_MONTHLY_DATA_DISCONNECTED = [
  { month: 'Oca', followers: 4, likes: 12, shares: 0.8 },
  { month: 'Şub', followers: 9, likes: 24, shares: 1.5 },
  { month: 'Mar', followers: 16, likes: 45, shares: 2.9 },
  { month: 'Nis', followers: 26, likes: 68, shares: 4.6 },
  { month: 'May', followers: 37, likes: 98, shares: 6.5 },
  { month: 'Haz', followers: 48, likes: 124, shares: 8.2 },
];

const TOP_VIDEOS = [
  { title: "Türkiye'nin İlk Yerli AI Çipi", views: '412K', platform: 'YouTube Shorts', change: '+34%', color: 'green' },
  { title: "2025'te Dijital Göçebe Olmak", views: '287K', platform: 'Kick', change: '+21%', color: 'cyan' },
  { title: 'LG OLED C5 vs Samsung Neo QLED', views: '193K', platform: 'YouTube', change: '+15%', color: 'orange' },
  { title: 'iPhone 17 Pro Max İnceleme', views: '158K', platform: 'TikTok', change: '+28%', color: 'pink' },
  { title: 'RTX 5090 Render Testleri', views: '96K', platform: 'YouTube', change: '+9%', color: 'purple' },
];

// ═══════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ═══════════════════════════════════════════════════════════
// AI SCRIPT SIMULATION
// ═══════════════════════════════════════════════════════════
function generateAIScript(title: string, category: string): AIScript {
  const t = title.toLowerCase();
  const c = category.toLowerCase();
  
  let hook = '';
  let intro = '';
  let hashtags = '';
  let suggestedDuration = '';
  let bRollSuggestion = '';

  if (c.includes('oyun')) {
    hook = `Günde 10 saat ${title} oynayanların bile bilmediği o taktikle rakipleri nasıl eledim? İzle gör kanka!`;
    intro = `Selam beyler, bugün ${title} oyununda attığım o inanılmaz vuruşu ve arkasındaki refleks sırrını gösteriyorum...`;
    hashtags = `#Gaming #Oyun #Gamer #Shorts #${title.replace(/\s+/g, '')}`;
    suggestedDuration = '30 saniye';
    bRollSuggestion = 'İlk 3 saniyede oyunun en heyecanlı aksiyon anından (vuruş/kıl payı kaçış) bir kesit ekrana patlatılmalı kanka.';
  } else if (c.includes('teknoloji') || c.includes('donanım') || c.includes('mobil') || c.includes('inceleme')) {
    hook = `Eğer sen de ${title} almayı veya kullanmayı düşünüyorsan, bu videoyu izlemeden karar verme kanka!`;
    intro = `Selam dostlar! Bugün ${title} konusunu derinlemesine inceliyoruz. İşte piyasadaki en son detaylar ve benchmark testleri...`;
    hashtags = `#Teknoloji #Hardware #Tech #Shorts #${title.replace(/\s+/g, '')}`;
    suggestedDuration = '45 saniye';
    bRollSuggestion = 'Cihazın veya teknolojinin en yakın plan makro stüdyo çekimleri ve neon ışıklı render görselleri sırayla gelmeli kanka.';
  } else if (c.includes('tarih')) {
    hook = `${title} hakkında tarih kitaplarında asla yazılmayan o gizemli ve şok edici gerçeği açıklıyorum!`;
    intro = `Merhaba tarih severler! Bugün ${title} konusunun arkasındaki az bilinen tarihi olayları ve gizli belgeleri inceliyoruz...`;
    hashtags = `#Tarih #Belgesel #TarihSever #Shorts #${title.replace(/\s+/g, '')}`;
    suggestedDuration = '60 saniye';
    bRollSuggestion = 'Tarihi belgeler veya milli projeye ait şematik çizimler yarı şeffaf katman olarak ekrana gelmeli kanka.';
  } else if (c.includes('yaşam')) {
    hook = `${title} hayatımı nasıl 180 derece değiştirdi? İşte benim uyguladığım o gizli rutin kanka!`;
    intro = `Selam kanka! Bugün ${title} üzerine konuşuyoruz. Hayat kalitemizi artıracak ipuçlarını ve kendi deneyimlerimi paylaşıyorum...`;
    hashtags = `#Lifestyle #Yaşam #KişiselGelişim #Shorts #${title.replace(/\s+/g, '')}`;
    suggestedDuration = '40 saniye';
    bRollSuggestion = 'Sakin ve estetik bir kafeden, doğadan veya çalışma masanından minimal yaşam tarzı kesitleri gösterilmeli kanka.';
  } else {
    // Yaratıcılık veya varsayılan
    hook = `${title} konusundaki bu taktiği kullanarak Shorts videolarında izlenme rekorları kırabilirsin kanka!`;
    intro = `Selam dostlar! Bugün yaratıcı içerik üreticileri için ${title} üzerine konuşuyoruz. İşte bilmeniz gereken o sırlar...`;
    hashtags = `#Yaratıcılık #Shorts #ContentCreator #${title.replace(/\s+/g, '')}`;
    suggestedDuration = '50 saniye';
    bRollSuggestion = 'İlgi çekici renk geçişleri, hareketli grafikler ve BurstStudio arayüzünden canlı ekran kesitleri gelmeli kanka.';
  }

  // Özel override anahtar kelimeler
  if (t.includes('5090') || t.includes('rtx')) {
    bRollSuggestion = 'İlk 3 saniyede ekrana RTX 5090 görseli patlatılmalı kanka.';
    suggestedDuration = '45 saniye';
  } else if (t.includes('pubg')) {
    hook = 'Günde 10 saat PUBG oynayanların bile bilmediği o taktikle adamı nasıl vurdum? İzle gör kanka!';
    intro = 'Selam beyler, bugün PUBG\'de attığım o inanılmaz vuruşu ve arkasındaki refleks sırrını gösteriyorum...';
    hashtags = '#Gaming #PUBG #Gamer #Shorts #Oyun';
  }

  return {
    hook,
    intro,
    hashtags,
    suggestedDuration,
    bRollSuggestion,
  };
}

// ═══════════════════════════════════════════════════════════
// TOAST SYSTEM
// ═══════════════════════════════════════════════════════════
function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="toast-container" aria-live="polite" aria-label="Uygulama bildirimleri">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast-icon" aria-hidden="true">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)} aria-label="Bildirimi kapat">✕</button>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CALENDAR EVENT MODAL
// ═══════════════════════════════════════════════════════════
function CalModal({ event, onClose }: { event: CalEvent; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="cal-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cal-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`cal-modal cal-modal--${event.color}`}>
        <div className="cal-modal-header">
          <div className="cal-modal-badge">
            <span className={`cal-modal-dot cal-modal-dot--${event.color}`} />
            {event.platform}
          </div>
          <button className="cal-modal-close" onClick={onClose} aria-label="Modalı kapat">✕</button>
        </div>
        <h2 id="cal-modal-title" className="cal-modal-title">{event.title}</h2>
        <p className="cal-modal-desc">{event.desc}</p>
        <div className="cal-modal-meta">
          <div className="cal-modal-meta-item">
            <span className="cal-modal-meta-icon">📅</span>
            <span>{DAYS[event.day]}, {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="cal-modal-meta-item">
            <span className="cal-modal-meta-icon">🕐</span>
            <span>{event.publishTime ?? HOURS[event.hour]} yayın saati</span>
          </div>
          <div className="cal-modal-meta-item">
            <span className="cal-modal-meta-icon">📡</span>
            <span>{event.platform}</span>
          </div>
        </div>
        <div className="cal-modal-actions">
          <button className="cal-modal-btn cal-modal-btn--primary" onClick={onClose} id="cal-modal-edit-btn">✏️ Düzenle</button>
          <button className="cal-modal-btn cal-modal-btn--ghost" onClick={onClose} id="cal-modal-close-btn">Kapat</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
function Header({
  activeTab, setActiveTab, addToast, onSupportOpen, profile,
}: {
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  onSupportOpen: () => void;
  profile: { name: string; channel: string; email: string; bio: string };
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifList, setNotifList] = useState(MOCK_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, useCallback(() => setNotifOpen(false), []));
  useClickOutside(profileRef, useCallback(() => setProfileOpen(false), []));

  const unreadCount = notifList.filter(n => n.unread).length;

  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo-group">
          <div className="logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="6,4 30,18 6,32" fill="url(#lg1)" />
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <span className="logo-name">Burst<span className="logo-accent">Studio</span></span>
            <span className="logo-tag">Content OS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="main-nav" aria-label="Ana navigasyon">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} id={`nav-${id}`}
              className={`nav-item ${activeTab === id ? 'nav-item--active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}>
              <span className="nav-icon">{icon}</span>{label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Notification Bell */}
          <div className="notif-wrap" ref={notifRef}>
            <button
              className={`notif-btn ${notifOpen ? 'notif-btn--open' : ''}`}
              aria-label={`Bildirimler${unreadCount > 0 ? `, ${unreadCount} okunmamış` : ''}`}
              aria-expanded={notifOpen}
              aria-haspopup="true"
              id="notif-bell-btn"
              onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
            >
              {unreadCount > 0 && <span className="notif-dot" aria-hidden="true" />}
              🔔
              {unreadCount > 0 && <span className="notif-badge" aria-hidden="true">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="notif-panel" role="menu" aria-label="Bildirimler paneli">
                <div className="notif-panel-header">
                  <span className="notif-panel-title">🔔 Bildirimler</span>
                  <button className="notif-mark-read" onClick={markAllRead} id="mark-all-read-btn">
                    Tümünü Okundu İşaretle
                  </button>
                </div>
                <div className="notif-panel-list">
                  {notifList.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'notif-item--unread' : ''}`} role="menuitem">
                      <span className="notif-item-icon">{n.icon}</span>
                      <div className="notif-item-body">
                        <p className="notif-item-text">{n.text}</p>
                        <span className="notif-item-time">{n.time}</span>
                      </div>
                      {n.unread && <span className="notif-item-dot" aria-label="Okunmamış" />}
                    </div>
                  ))}
                </div>
                <div className="notif-panel-footer">
                  <button className="notif-see-all" id="notif-see-all-btn">Tüm bildirimleri gör →</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="profile-wrap" ref={profileRef}>
            <button
              className={`avatar ${profileOpen ? 'avatar--open' : ''}`}
              aria-label="Profil menüsü"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              id="profile-avatar-btn"
              onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
            >
              {profile.name.slice(0, 2).toUpperCase()}
            </button>

            {profileOpen && (
              <div className="profile-dropdown" role="menu" aria-label="Profil menüsü">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">{profile.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="profile-dropdown-name">{profile.name}</div>
                    <div className="profile-dropdown-handle">{profile.channel}</div>
                  </div>
                </div>
                <div className="profile-dropdown-divider" />
                {[
                  { icon: '👤', label: 'Kanal Profili', id: 'profile-menu-profil', action: () => { setActiveTab('ayarlar'); setProfileOpen(false); } },
                  { icon: '🎯', label: 'İçerik Planı', id: 'profile-menu-plan',    action: () => { setActiveTab('takvim');  setProfileOpen(false); } },
                  { icon: '💬', label: 'Destek',        id: 'profile-menu-destek', action: () => { onSupportOpen(); setProfileOpen(false); } },
                ].map(item => (
                  <button key={item.id} id={item.id} className="profile-dropdown-item" role="menuitem"
                    onClick={item.action}>
                    <span className="profile-dropdown-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="profile-dropdown-divider" />
                <button className="profile-dropdown-item profile-dropdown-item--danger" role="menuitem"
                  id="profile-menu-cikis" onClick={() => { setProfileOpen(false); addToast('Oturum kapatılıyor...', 'info'); window.dispatchEvent(new Event('bs:logout')); }}>
                  <span className="profile-dropdown-icon">🚪</span>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE HEADER
// ═══════════════════════════════════════════════════════════
function PageHeader({ icon, title, subtitle, badge }: { icon: string; title: string; subtitle: string; badge?: string }) {
  return (
    <div className="main-top">
      <div className="page-title-group">
        <h1 className="page-title">{icon} {title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {badge && (
        <div className="live-indicator">
          <span className="live-dot" aria-hidden="true" />
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
// Animated counter hook — pulses on value change
function useAnimatedCount(target: number | string) {
  const [display, setDisplay] = useState(target);
  const [bump, setBump] = useState(false);
  const prev = useRef(target);
  useEffect(() => {
    if (prev.current === target) return;
    prev.current = target;
    setBump(true);
    setDisplay(target);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [target]);
  return { display, bump };
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  const { display, bump } = useAnimatedCount(value);
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <div className={`stat-value ${bump ? 'stat-value--bump' : ''}`}>{display}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StatsBar({ projects, ytStats }: { projects: VideoCard[]; ytStats: { views: string; subs: string; videos: string } | null }) {
  // These are computed live from the shared projects state — updates on every Kanban move
  const total     = ytStats ? Number(ytStats.videos) : projects.length;
  const live      = projects.filter(c => c.stage === 'live' || c.status === 'live').length;
  const scripting = projects.filter(c => c.stage === 'scripting' || c.status === 'scripting').length;
  const idea      = projects.filter(c => c.stage === 'idea' || c.status === 'idea').length;
  return (
    <div className="stats-bar" role="region" aria-label="İstatistikler">
      <StatCard label="Toplam Proje"     value={ytStats ? ytStats.videos : total}     icon="📁" color="purple" />
      <StatCard label="Fikir Aşaması"   value={idea}      icon="💡" color="yellow" />
      <StatCard label="Senaryo Yazılıyor" value={scripting} icon="✍️" color="cyan" />
      <StatCard label="Yayında"          value={live}      icon="🚀" color="green" />
    </div>
  );
}

function KanbanCard({ card, onMove }: { card: VideoCard; onMove: (id: string, dir: 'forward' | 'back') => void }) {
  const currentStage = card.stage || card.status || 'idea';
  const stageIndex = COLUMNS.findIndex(c => c.id === currentStage);
  return (
    <article className={`kanban-card kanban-card--${card.color}`} tabIndex={0}>
      <div className="card-category">{card.category}</div>
      <h3 className="card-title">{card.title}</h3>
      <div className="card-meta">
        <span className="card-duration">⏱ {card.duration}</span>
        {card.views && <span className="card-views">👁 {card.views}</span>}
        {card.platform && <span className="card-platform">{card.platform}</span>}
      </div>
      <div className="card-tags">
        {card.tags.map(tag => <span key={tag} className="card-tag">{tag}</span>)}
      </div>
      <div className="card-actions">
        {stageIndex > 0 && (
          <button className="card-btn card-btn--back" onClick={() => onMove(card.id, 'back')}>← Geri</button>
        )}
        {stageIndex < COLUMNS.length - 1 && (
          <button className="card-btn card-btn--forward" onClick={() => onMove(card.id, 'forward')}>İlerlet →</button>
        )}
      </div>
    </article>
  );
}

function KanbanBoard({ projects, onMove }: { projects: VideoCard[]; onMove: (id: string, dir: 'forward' | 'back') => void }) {
  return (
    <section className="kanban-board" aria-label="Video üretim panosu">
      {COLUMNS.map(col => {
        const colCards = projects.filter(c => c.stage === col.id || c.status === col.id);
        return (
          <div key={col.id} className={`kanban-column kanban-column--${col.id}`}>
            <div className="column-header">
              <span className="column-icon">{col.icon}</span>
              <h2 className="column-title">{col.label}</h2>
              <span className="column-count">{colCards.length}</span>
            </div>
            <div className="column-cards">
              {colCards.map(card => <KanbanCard key={card.id} card={card} onMove={onMove} />)}
              {colCards.length === 0 && <div className="column-empty">Henüz kart yok</div>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ContentForm({ onAdd, addToast }: { onAdd: (card: VideoCard) => void; addToast: (msg: string, type?: Toast['type']) => void }) {
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], duration: '', tags: '', platform: PLATFORMS[0] });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIScript | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (submitted) { const t = setTimeout(() => setSubmitted(false), 2500); return () => clearTimeout(t); }
  }, [submitted]);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Başlık en az 5 karakter olmalı.';
    if (!form.duration.trim()) e.duration = 'Tahmini süre zorunlu.';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
    const colors = ['purple', 'cyan', 'pink', 'orange', 'green'];
    onAdd({
      id: `c${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      duration: form.duration.trim(),
      stage: 'idea',
      status: 'idea',
      tags: tagList.length > 0 ? tagList : ['#Yeni'],
      color: colors[Math.floor(Math.random() * colors.length)],
      platform: form.platform,
      publishDate: ''
    });
    setForm({ title: '', category: CATEGORIES[0], duration: '', tags: '', platform: PLATFORMS[0] });
    setAiResult(null); setSubmitted(true); titleRef.current?.focus();
  };

  const handleAI = async () => {
    if (!form.title.trim() || form.title.trim().length < 5) {
      setErrors({ title: 'AI için önce en az 5 karakterlik başlık gir.' });
      addToast('Lütfen önce bir başlık gir kanka! ⚠️', 'error');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      titleRef.current?.focus();
      return;
    }
    setErrors({}); setAiLoading(true); setAiResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setAiResult(generateAIScript(form.title, form.category)); setAiLoading(false);
  };

  return (
    <section className="content-form-section" aria-labelledby="form-heading">
      <div className={`form-panel ${shouldShake ? 'shake-element' : ''}`}>
        <div className="form-panel-header">
          <h2 id="form-heading" className="form-panel-title"><span className="form-icon">🎬</span> Yeni Video Fikri</h2>
          <p className="form-panel-sub">Fikrinden yayına — hepsini buradan yönet.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate aria-label="Yeni video ekle formu">
          <div className="field-group">
            <label htmlFor="video-title" className="field-label">Video Başlığı <span className="required-star">*</span></label>
            <input ref={titleRef} id="video-title" name="video-title" type="text"
              className={`field-input ${errors.title ? 'field-input--error' : ''}`}
              placeholder="Örn: iPhone 17 Pro Max Detaylı İnceleme"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required minLength={5} maxLength={120} aria-required="true"
              aria-describedby={errors.title ? 'title-error' : undefined} autoComplete="off" />
            {errors.title && <span id="title-error" className="field-error" role="alert">⚠ {errors.title}</span>}
          </div>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="video-category" className="field-label">Kategori</label>
              <select id="video-category" name="video-category" className="field-input field-select"
                value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="video-platform" className="field-label">Platform</label>
              <select id="video-platform" name="video-platform" className="field-input field-select"
                value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="video-duration" className="field-label">Tahmini Süre <span className="required-star">*</span></label>
            <input id="video-duration" name="video-duration" type="text"
              className={`field-input ${errors.duration ? 'field-input--error' : ''}`}
              placeholder="Örn: 15 dk" value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              required aria-required="true" aria-describedby={errors.duration ? 'duration-error' : undefined} />
            {errors.duration && <span id="duration-error" className="field-error" role="alert">⚠ {errors.duration}</span>}
          </div>
          <div className="field-group">
            <label htmlFor="video-tags" className="field-label">Etiketler <span className="field-hint">(virgülle ayır)</span></label>
            <input id="video-tags" name="video-tags" type="text" className="field-input"
              placeholder="Örn: AI, Teknoloji, Shorts" value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-submit" id="submit-video-btn">{submitted ? '✅ Eklendi!' : '+ Panoya Ekle'}</button>
            <button type="button" className="btn-ai" id="ai-generate-btn" onClick={handleAI} disabled={aiLoading} aria-busy={aiLoading}>
              {aiLoading ? (<span className="ai-loading-inner"><span className="ai-spinner" aria-hidden="true" />AI Düşünüyor...</span>) : '✨ AI ile Senaryo Üret'}
            </button>
          </div>
        </form>
      </div>

      <div className={`ai-result-panel ${aiResult ? 'ai-result-panel--visible' : ''}`} aria-live="polite">
        {aiResult && <>
          <div className="ai-result-header">
            <span className="ai-badge">✨ AI Senaryosu</span>
            <button className="ai-close" onClick={() => setAiResult(null)} aria-label="Kapat">✕</button>
          </div>
          <div className="ai-block"><h4 className="ai-block-title">🎣 Kanca Cümlesi (Hook)</h4><p className="ai-block-text">{aiResult.hook}</p></div>
          <div className="ai-block"><h4 className="ai-block-title">🎤 Giriş Metni</h4><p className="ai-block-text">{aiResult.intro}</p></div>
          <div className="ai-block"><h4 className="ai-block-title">⏱️ Önerilen Video Süresi</h4><p className="ai-block-text">{aiResult.suggestedDuration}</p></div>
          <div className="ai-block"><h4 className="ai-block-title">🎬 Görsel Sahne / B-Roll Önerisi</h4><p className="ai-block-text">{aiResult.bRollSuggestion}</p></div>
          <div className="ai-block"><h4 className="ai-block-title">🏷️ Etiketler</h4><p className="ai-block-tags">{aiResult.hashtags}</p></div>
          <button className="ai-copy-btn" onClick={() => navigator.clipboard.writeText(`HOOK:\n${aiResult.hook}\n\nGİRİŞ:\n${aiResult.intro}\n\nSÜRE:\n${aiResult.suggestedDuration}\n\nB-ROLL:\n${aiResult.bRollSuggestion}\n\nETİKETLER:\n${aiResult.hashtags}`)}>📋 Panoya Kopyala</button>
        </>}
        {!aiResult && !aiLoading && (
          <div className="ai-placeholder">
            <div className="ai-placeholder-icon">🤖</div>
            <p>Video başlığını gir ve <strong>✨ AI ile Senaryo Üret</strong> butonuna bas!</p>
            <p className="ai-placeholder-sub">AI, senin için hook cümlesi, giriş metni, sahne önerileri ve süre üretecek.</p>
          </div>
        )}
        {aiLoading && (
          <div className="ai-thinking">
            <div className="ai-pulse-ring" /><div className="ai-pulse-ring ai-pulse-ring--2" /><div className="ai-pulse-ring ai-pulse-ring--3" />
            <div className="ai-brain-icon">🧠</div>
            <p className="ai-thinking-text">AI senaryonu üretiyor</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardTab({
  projects, onMove, onAdd, addToast, ytStats
}: {
  projects: VideoCard[];
  onMove: (id: string, dir: 'forward' | 'back') => void;
  onAdd: (c: VideoCard) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  ytStats: { views: string; subs: string; videos: string } | null;
}) {
  return (
    <>
      <PageHeader icon="⚡" title="Video Üretim Panosu" subtitle="Fikirden yayına — tüm sürecini tek ekranda yönet." badge="Canlı Senkron" />
      <StatsBar projects={projects} ytStats={ytStats} />
      <KanbanBoard projects={projects} onMove={onMove} />
      <ContentForm onAdd={onAdd} addToast={addToast} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// PROJELER TAB
// ═══════════════════════════════════════════════════════════
function ProjelerTab({ projects }: { projects: VideoCard[] }) {
  const [filter, setFilter] = useState<Stage | 'all'>('all');
  const [search, setSearch] = useState('');
  const filtered = projects
    .filter(c => filter === 'all' || c.stage === filter || c.status === filter)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader icon="📁" title="Projeler" subtitle="Tüm video projelerini tek tabloda görüntüle ve filtrele." />
      <div className="proj-toolbar">
        <div className="proj-search-wrap">
          <span className="proj-search-icon">🔍</span>
          <input id="proj-search" type="text" className="proj-search" placeholder="Proje ara..." value={search}
            onChange={e => setSearch(e.target.value)} aria-label="Proje arama" />
        </div>
        <div className="proj-filters" role="group" aria-label="Durum filtresi">
          {(['all', 'idea', 'scripting', 'live'] as const).map(f => (
            <button key={f} id={`filter-${f}`} className={`proj-filter-btn ${filter === f ? 'proj-filter-btn--active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '🗂 Tümü' : STAGE_META[f].label}
            </button>
          ))}
        </div>
        <div className="proj-count">{filtered.length} proje</div>
      </div>

      <div className="proj-table-wrap">
        <table className="proj-table" aria-label="Proje listesi">
          <thead>
            <tr>
              <th scope="col">#</th><th scope="col">Video Başlığı</th><th scope="col">Kategori</th>
              <th scope="col">Platform</th><th scope="col">Süre</th><th scope="col">Durum</th>
              <th scope="col">Yayın Tarihi</th><th scope="col">İzlenme</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((card, i) => (
              <tr key={card.id} className={`proj-row proj-row--${card.color}`}>
                <td className="proj-num">{i + 1}</td>
                <td className="proj-title-cell"><span className={`proj-color-dot proj-color-dot--${card.color}`} />{card.title}</td>
                <td><span className="proj-category">{card.category}</span></td>
                <td><span className={`platform-badge platform-badge--${PLATFORM_COLORS[card.platform ?? ''] ?? 'gray'}`}>{card.platform ?? '—'}</span></td>
                <td className="proj-duration">⏱ {card.duration}</td>
                <td><span className={`stage-badge stage-badge--${STAGE_META[card.stage].color}`}>{STAGE_META[card.stage].label}</span></td>
                <td className="proj-date">{card.publishDate ?? '—'}</td>
                <td className="proj-views">{card.views ? `👁 ${card.views}` : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="proj-empty">🔍 "{search}" için sonuç bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatViews(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatSubs(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1_000_000) {
    return '+' + (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return '+' + (num / 1_000).toFixed(1) + 'K';
  }
  return '+' + num.toString();
}

// ═══════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════
function AnalyticsTab({
  apiConnected,
  ytStats,
  kickConnected,
  tiktokConnected
}: {
  apiConnected: boolean;
  ytStats: { views: string; subs: string; videos: string } | null;
  kickConnected: boolean;
  tiktokConnected: boolean;
}) {
  const [activePlatform, setActivePlatform] = useState<'youtube' | 'kick' | 'tiktok'>('youtube');
  const [activeMetric, setActiveMetric] = useState<string>('views');

  useEffect(() => {
    if (activePlatform === 'youtube') {
      setActiveMetric('views');
    } else if (activePlatform === 'kick') {
      setActiveMetric('donation');
    } else if (activePlatform === 'tiktok') {
      setActiveMetric('followers');
    }
  }, [activePlatform]);

  const platformData = {
    youtube: {
      stats: apiConnected ? [
        { label: 'Toplam İzlenme', value: ytStats ? formatViews(ytStats.views) : '2.4M', delta: '+28.3%', icon: '👁', color: 'purple' },
        { label: 'Abone Artışı', value: ytStats ? formatSubs(ytStats.subs) : '+12.8K', delta: '+15.4%', icon: '📈', color: 'cyan' },
        { label: 'Ort. İzlenme Süresi', value: '4:32', delta: '+1:12', icon: '⏱', color: 'green' },
        { label: 'Tahmini Gelir', value: '₺88,640', delta: '+48.3%', icon: '💰', color: 'yellow' },
      ] : [
        { label: 'Toplam İzlenme', value: '124K', delta: '+8.3%', icon: '👁', color: 'purple' },
        { label: 'Abone Artışı', value: '+850', delta: '+3.2%', icon: '📈', color: 'cyan' },
        { label: 'Ort. İzlenme Süresi', value: '1:15', delta: '+0:12', icon: '⏱', color: 'green' },
        { label: 'Tahmini Gelir', value: '₺1,240', delta: '+5.1%', icon: '💰', color: 'yellow' },
      ],
      chartData: [
        { month: 'Oca', views: 180, subs: 45, revenue: 520 },
        { month: 'Şub', views: 240, subs: 62, revenue: 710 },
        { month: 'Mar', views: 310, subs: 78, revenue: 890 },
        { month: 'Nis', views: 280, subs: 55, revenue: 810 },
        { month: 'May', views: 420, subs: 110, revenue: 1240 },
        { month: 'Haz', views: 390, subs: 98, revenue: 1150 },
      ],
      metrics: [
        { key: 'views', label: '👁 İzlenme', color: 'purple' },
        { key: 'subs', label: '📈 Abone', color: 'cyan' },
        { key: 'revenue', label: '💰 Gelir', color: 'yellow' },
      ],
      defaultMetric: 'views',
      subtitle: apiConnected ? 'FacttBurstt kanalınızın gerçek zamanlı verileri senkronize edildi.' : 'YouTube kanal performansını takip et.',
      badge: apiConnected ? 'YouTube Live' : 'Mock Data',
    },
    kick: {
      stats: kickConnected ? [
        { label: 'Toplam Bağış', value: '$14,820', delta: '+85.4%', icon: '💰', color: 'green' },
        { label: 'Canlı İzleyici', value: '8.4K', delta: '+312%', icon: '👥', color: 'green' },
        { label: 'Yayın Saati', value: '320h', delta: '+140%', icon: '⏱', color: 'cyan' },
        { label: 'Abone Sayısı', value: '1,240', delta: '+90%', icon: '💚', color: 'yellow' },
      ] : [
        { label: 'Toplam Bağış', value: '$120', delta: '+1.2%', icon: '💰', color: 'green' },
        { label: 'Canlı İzleyici', value: '45', delta: '-5%', icon: '👥', color: 'green' },
        { label: 'Yayın Saati', value: '12h', delta: '+8%', icon: '⏱', color: 'cyan' },
        { label: 'Abone Sayısı', value: '8', delta: '+0%', icon: '💚', color: 'yellow' },
      ],
      chartData: kickConnected ? [
        { month: 'Oca', donation: 450, viewers: 120, hours: 25 },
        { month: 'Şub', donation: 600, viewers: 180, hours: 30 },
        { month: 'Mar', donation: 1200, viewers: 340, hours: 45 },
        { month: 'Nis', donation: 2800, viewers: 890, hours: 80 },
        { month: 'May', donation: 7500, viewers: 2400, hours: 140 },
        { month: 'Haz', donation: 14820, viewers: 8400, hours: 320 },
      ] : [
        { month: 'Oca', donation: 10, viewers: 5, hours: 2 },
        { month: 'Şub', donation: 25, viewers: 12, hours: 4 },
        { month: 'Mar', donation: 40, viewers: 18, hours: 6 },
        { month: 'Nis', donation: 65, viewers: 24, hours: 8 },
        { month: 'May', donation: 95, viewers: 35, hours: 10 },
        { month: 'Haz', donation: 120, viewers: 45, hours: 12 },
      ],
      metrics: [
        { key: 'donation', label: '💰 Bağış', color: 'green' },
        { key: 'viewers', label: '👥 İzleyici', color: 'green' },
        { key: 'hours', label: '⏱ Yayın Saati', color: 'cyan' },
      ],
      defaultMetric: 'donation',
      subtitle: kickConnected ? 'FacttBurstt Kick Stream verileri başarıyla senkronize edildi.' : 'Kick Stream performansını takip et.',
      badge: kickConnected ? 'Kick Stream Live' : 'Mock Data',
    },
    tiktok: {
      stats: tiktokConnected ? [
        { label: 'Toplam Takipçi', value: '2.4M', delta: '+45.2%', icon: '👥', color: 'pink' },
        { label: 'Toplam Beğeni', value: '18.2M', delta: '+124%', icon: '❤️', color: 'pink' },
        { label: 'Toplam Paylaşım', value: '450K', delta: '+88%', icon: '🔗', color: 'cyan' },
        { label: 'Tahmini İzlenme', value: '42.8M', delta: '+110%', icon: '👁️', color: 'purple' },
      ] : [
        { label: 'Toplam Takipçi', value: '4.8K', delta: '+2.1%', icon: '👥', color: 'pink' },
        { label: 'Toplam Beğeni', value: '12.4K', delta: '+5.4%', icon: '❤️', color: 'pink' },
        { label: 'Toplam Paylaşım', value: '820', delta: '+1.8%', icon: '🔗', color: 'cyan' },
        { label: 'Tahmini İzlenme', value: '128K', delta: '+4%', icon: '👁️', color: 'purple' },
      ],
      chartData: tiktokConnected ? [
        { month: 'Oca', followers: 120, likes: 850, shares: 15 },
        { month: 'Şub', followers: 350, likes: 2100, shares: 48 },
        { month: 'Mar', followers: 780, likes: 5400, shares: 120 },
        { month: 'Nis', followers: 1200, likes: 9200, shares: 210 },
        { month: 'May', followers: 1800, likes: 14000, shares: 330 },
        { month: 'Haz', followers: 2400, likes: 18200, shares: 450 },
      ] : [
        { month: 'Oca', followers: 4, likes: 12, shares: 0.8 },
        { month: 'Şub', followers: 9, likes: 24, shares: 1.5 },
        { month: 'Mar', followers: 16, likes: 45, shares: 2.9 },
        { month: 'Nis', followers: 26, likes: 68, shares: 4.6 },
        { month: 'May', followers: 37, likes: 98, shares: 6.5 },
        { month: 'Haz', followers: 48, likes: 124, shares: 8.2 },
      ],
      metrics: [
        { key: 'followers', label: '👥 Takipçi', color: 'purple' },
        { key: 'likes', label: '❤️ Beğeni', color: 'purple' },
        { key: 'shares', label: '🔗 Paylaşım', color: 'purple' },
      ],
      defaultMetric: 'followers',
      subtitle: tiktokConnected ? 'FacttBurstt TikTok Creator verileri başarıyla senkronize edildi.' : 'TikTok Creator performansını takip et.',
      badge: tiktokConnected ? 'TikTok Creator Live' : 'Mock Data',
    }
  };

  const currentPlatformData = platformData[activePlatform] || platformData.youtube;
  const safeMetricKey = currentPlatformData.metrics.some(m => m.key === activeMetric)
    ? activeMetric
    : currentPlatformData.defaultMetric;

  const currentMetric = currentPlatformData.metrics.find(m => m.key === safeMetricKey) || currentPlatformData.metrics[0];

  const rawChartData = currentPlatformData.chartData || [];
  const values = rawChartData.map(d => Number((d as any)[safeMetricKey] || 0));
  const max = Math.max(...values, 1);

  const distribution = apiConnected ? [
    { name: 'YouTube', pct: 15, color: 'red' },
    { name: 'YouTube Shorts', pct: 70, color: 'pink' },
    { name: 'TikTok', pct: 8, color: 'cyan' },
    { name: 'Kick', pct: 5, color: 'green' },
    { name: 'Instagram', pct: 2, color: 'purple' },
  ] : [
    { name: 'YouTube', pct: 45, color: 'red' },
    { name: 'YouTube Shorts', pct: 28, color: 'pink' },
    { name: 'TikTok', pct: 15, color: 'cyan' },
    { name: 'Kick', pct: 8, color: 'green' },
    { name: 'Instagram', pct: 4, color: 'purple' },
  ];

  return (
    <>
      <PageHeader icon="📊" title="Analytics" subtitle={currentPlatformData.subtitle} badge={currentPlatformData.badge} />
      
      {/* Platform Switcher Sekmeleri */}
      <div className="platform-tabs">
        <button className={`platform-tab platform-tab--youtube ${activePlatform === 'youtube' ? 'platform-tab--active' : ''}`} onClick={() => setActivePlatform('youtube')}>
          🔴 YouTube
        </button>
        <button className={`platform-tab platform-tab--kick ${activePlatform === 'kick' ? 'platform-tab--active' : ''}`} onClick={() => setActivePlatform('kick')}>
          🟢 Kick Stream
        </button>
        <button className={`platform-tab platform-tab--tiktok ${activePlatform === 'tiktok' ? 'platform-tab--active' : ''}`} onClick={() => setActivePlatform('tiktok')}>
          🎵 TikTok Creator
        </button>
      </div>

      <div className="stats-bar">
        {(currentPlatformData.stats || []).map(s => (
          <div key={s.label} className={`stat-card stat-card--${s.color}`}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-delta stat-delta--up">{s.delta} bu ay</div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="analytics-chart-panel">
          <div className="analytics-chart-header">
            <h2 className="analytics-panel-title">📈 Aylık Performans</h2>
            <div className="metric-tabs" role="group" aria-label="Metrik seçimi">
              {(currentPlatformData.metrics || []).map(m => (
                <button key={m.key} id={`metric-${m.key}`} className={`metric-tab ${activeMetric === m.key ? 'metric-tab--active' : ''}`}
                  onClick={() => setActiveMetric(m.key)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bar-chart-wrap">
            <div className="bar-chart-label">{currentMetric.label}</div>
            <div className="bar-chart">
              {platformData[activePlatform]?.chartData?.map((item: any, index: number) => {
                const val = item[safeMetricKey] !== undefined ? item[safeMetricKey] : 0;
                const heightPct = max > 0 ? (val / max) * 100 : 0;
                return (
                  <div key={item.month || index} className="bar-col">
                    <div className="bar-value">{val}</div>
                    <div className="bar-track">
                      <div className={`bar-fill bar-fill--${currentMetric.color}`} style={{ height: `${heightPct}%` }}
                        role="img" aria-label={`${item.month}: ${val}`} />
                    </div>
                    <div className="bar-month">{item.month}</div>
                  </div>
                );
              }) || null}
            </div>
          </div>
        </div>

        <div className="analytics-top-panel">
          <h2 className="analytics-panel-title">🏆 En İyi Videolar</h2>
          <div className="top-videos-list">
            {TOP_VIDEOS.map((v, i) => (
              <div key={v.title} className={`top-video-row top-video-row--${v.color}`}>
                <span className="top-video-rank">#{i + 1}</span>
                <div className="top-video-info">
                  <span className="top-video-title">{v.title}</span>
                  <span className="top-video-platform">{v.platform}</span>
                </div>
                <div className="top-video-stats">
                  <span className="top-video-views">{v.views}</span>
                  <span className="top-video-change">{v.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="platform-distribution">
        <h2 className="analytics-panel-title">🌐 Platform Dağılımı</h2>
        <div className="platform-bars">
          {(distribution || []).map(p => (
            <div key={p.name} className="platform-bar-row">
              <span className="platform-bar-name">{p.name}</span>
              <div className="platform-bar-track">
                <div className={`platform-bar-fill platform-bar-fill--${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
              <span className="platform-bar-pct">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// TAKVİM TAB (with modal)
// ═══════════════════════════════════════════════════════════
function TakvimTab() {
  const [view, setView] = useState<'hafta' | 'ay'>('hafta');
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const today = new Date();
  const monthName = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const monthEvents: Record<number, CalEvent[]> = {};
  CAL_EVENTS.forEach((ev, i) => {
    const d = (i * 3 + 5) % daysInMonth + 1;
    if (!monthEvents[d]) monthEvents[d] = [];
    monthEvents[d].push(ev);
  });

  return (
    <>
      <PageHeader icon="📅" title="İçerik Takvimi" subtitle="Yayın planını haftalık ve aylık olarak yönet." />

      <div className="cal-toolbar">
        <div className="cal-month-label">📆 {monthName}</div>
        <div className="cal-view-toggle" role="group" aria-label="Görünüm seçimi">
          <button id="cal-view-hafta" className={`cal-view-btn ${view === 'hafta' ? 'cal-view-btn--active' : ''}`} onClick={() => setView('hafta')}>Haftalık</button>
          <button id="cal-view-ay" className={`cal-view-btn ${view === 'ay' ? 'cal-view-btn--active' : ''}`} onClick={() => setView('ay')}>Aylık</button>
        </div>
      </div>

      {view === 'hafta' && (
        <div className="cal-week-grid">
          <div className="cal-time-col">
            <div className="cal-time-header" />
            {HOURS.map(h => <div key={h} className="cal-time-slot">{h}</div>)}
          </div>
          {DAYS.map((day, di) => (
            <div key={day} className={`cal-day-col ${di === (today.getDay() === 0 ? 6 : today.getDay() - 1) ? 'cal-day-col--today' : ''}`}>
              <div className="cal-day-header">
                <span className="cal-day-name">{day}</span>
                {di === (today.getDay() === 0 ? 6 : today.getDay() - 1) && <span className="cal-today-dot" />}
              </div>
              <div className="cal-day-slots">
                {HOURS.map((_, hi) => {
                  const ev = CAL_EVENTS.find(e => e.day === di && e.hour === hi);
                  return (
                    <div key={hi} className="cal-slot">
                      {ev && (
                        <button className={`cal-event cal-event--${ev.color}`}
                          onClick={() => setSelectedEvent(ev)}
                          aria-label={`${ev.title} etkinliğini görüntüle`}
                          id={`cal-event-${di}-${hi}`}>
                          <span className="cal-event-title">{ev.title}</span>
                          <span className="cal-event-platform">{ev.platform}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'ay' && (
        <div className="cal-month-grid">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="cal-month-day-name">{d}</div>
          ))}
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="cal-month-cell cal-month-cell--empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isToday = d === today.getDate();
            const evs = monthEvents[d] ?? [];
            return (
              <div key={d} className={`cal-month-cell ${isToday ? 'cal-month-cell--today' : ''}`}>
                <span className="cal-month-date">{d}</span>
                {evs.map((ev, ei) => (
                  <button key={ei} className={`cal-month-event cal-month-event--${ev.color}`}
                    onClick={() => setSelectedEvent(ev)}
                    aria-label={`${ev.title} etkinliğini görüntüle`}
                    id={`cal-month-event-${d}-${ei}`}>
                    {ev.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="cal-legend">
        {[...new Set(CAL_EVENTS.map(e => e.platform))].map(p => (
          <span key={p} className={`cal-legend-item cal-legend-item--${PLATFORM_COLORS[p] ?? 'gray'}`}>{p}</span>
        ))}
      </div>

      {selectedEvent && <CalModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// AYARLAR TAB
// ═══════════════════════════════════════════════════════════
function AyarlarTab({
  addToast,
  theme,
  setTheme,
  profile,
  setProfile,
  apiConnected,
  setApiConnected,
  setYtStats,
  kickConnected,
  setKickConnected,
  tiktokConnected,
  setTiktokConnected
}: {
  addToast: (msg: string, type?: Toast['type']) => void;
  theme: 'cyberpunk' | 'neonblue' | 'light';
  setTheme: (t: 'cyberpunk' | 'neonblue' | 'light') => void;
  profile: { name: string; channel: string; email: string; bio: string };
  setProfile: React.Dispatch<React.SetStateAction<{ name: string; channel: string; email: string; bio: string }>>;
  apiConnected: boolean;
  setApiConnected: (v: boolean) => void;
  setYtStats: React.Dispatch<React.SetStateAction<{ views: string; subs: string; videos: string } | null>>;
  kickConnected: boolean;
  setKickConnected: (v: boolean) => void;
  tiktokConnected: boolean;
  setTiktokConnected: (v: boolean) => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [kickKey, setKickKey] = useState('');
  const [kickLoading, setKickLoading] = useState(false);
  const [tiktokKey, setTikTokKey] = useState('');
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: false, weekly: true });
  const [saved, setSaved] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setApiLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=@FacttBurstt&key=${encodeURIComponent(apiKey.trim())}`);
      if (!response.ok) {
        throw new Error('API isteği başarısız oldu.');
      }
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        throw new Error('FacttBurstt kanalı bulunamadı.');
      }
      
      const channel = data.items[0];
      const snippet = channel.snippet || {};
      const statistics = channel.statistics || {};
      
      setApiConnected(true);
      setProfile(p => ({
        ...p,
        name: snippet.title || 'FacttBurstt',
        channel: snippet.customUrl || '@FacttBurstt',
        bio: snippet.description || 'YouTube Shorts kanalımızda en ilginç gerçekleri paylaşıyoruz!'
      }));
      
      setYtStats({
        views: statistics.viewCount || '0',
        subs: statistics.subscriberCount || '0',
        videos: statistics.videoCount || '0'
      });
      
      addToast('YouTube API Başarıyla Bağlandı! Kanal Verileri Çekildi.', 'info');
    } catch (err: any) {
      console.error(err);
      addToast('Kanal verileri çekilemedi! Lütfen API anahtarını kontrol et kanka. ❌', 'error');
    } finally {
      setApiLoading(false);
    }
  };

  const handleDisconnect = () => {
    setApiConnected(false);
    setApiKey('');
    setProfile({
      name: 'BurstStudio',
      channel: '@burststudio',
      email: 'creator@burststudio.tv',
      bio: 'Teknoloji ve yaşam içerikleri üretiyorum.'
    });
    setYtStats(null);
    addToast('API bağlantısı kesildi.', 'info');
  };

  const handleKickConnect = async () => {
    if (!kickKey.trim()) return;
    setKickLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setKickConnected(true);
    setKickLoading(false);
    addToast('Kick API Bağlantısı Başarılı!', 'success');
  };

  const handleKickDisconnect = () => {
    setKickConnected(false);
    setKickKey('');
    addToast('Kick API bağlantısı kesildi.', 'info');
  };

  const handleTikTokConnect = async () => {
    if (!tiktokKey.trim()) return;
    setTiktokLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setTiktokConnected(true);
    setTiktokLoading(false);
    addToast('TikTok Creator API Bağlantısı Başarılı!', 'success');
  };

  const handleTikTokDisconnect = () => {
    setTiktokConnected(false);
    setTiktokKey('');
    addToast('TikTok Creator API bağlantısı kesildi.', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); setSaved(true);
    addToast('Profil bilgileri başarıyla kaydedildi! ✅', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageHeader icon="⚙️" title="Ayarlar" subtitle="Profil, entegrasyonlar ve uygulama tercihlerini yönet." />
      <div className="settings-grid">
        <section className="settings-panel" aria-labelledby="settings-profile">
          <h2 id="settings-profile" className="settings-panel-title">👤 Profil Bilgileri</h2>
          <form onSubmit={handleSave} className="settings-form" aria-label="Profil formu">
            <div className="field-group">
              <label htmlFor="s-name" className="field-label">Kanal Adı</label>
              <input id="s-name" type="text" className="field-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="field-group">
              <label htmlFor="s-channel" className="field-label">Kanal Handle</label>
              <input id="s-channel" type="text" className="field-input" value={profile.channel} onChange={e => setProfile(p => ({ ...p, channel: e.target.value }))} />
            </div>
            <div className="field-group">
              <label htmlFor="s-email" className="field-label">E-posta</label>
              <input id="s-email" type="email" className="field-input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="field-group">
              <label htmlFor="s-bio" className="field-label">Biyografi</label>
              <textarea id="s-bio" className="field-input field-textarea" rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
            </div>
            <button type="submit" className="btn-submit" id="save-profile-btn">{saved ? '✅ Kaydedildi!' : '💾 Kaydet'}</button>
          </form>
        </section>

        <div className="settings-right-col">
          <section className="settings-panel" aria-labelledby="settings-api">
            <h2 id="settings-api" className="settings-panel-title">🔗 YouTube API Entegrasyonu</h2>
            <p className="settings-panel-sub">API anahtarını girerek kanal verilerini otomatik çek.</p>
            <div className="api-status-row">
              <span className={`api-status-dot api-status-dot--${apiConnected ? 'connected' : 'disconnected'}`} />
              <span className={`api-status-text ${apiConnected ? 'api-status-text--connected' : ''}`}>{apiConnected ? `✨ CONNECTED: @FacttBurstt (Live)` : '⚠️ Bağlantı yok'}</span>
            </div>
            {!apiConnected && (
              <div className="api-input-row">
                <input id="api-key-input" type="password" className="field-input api-key-field"
                  placeholder="AIza... API anahtarınızı girin" value={apiKey}
                  onChange={e => setApiKey(e.target.value)} aria-label="YouTube API anahtarı" />
                <button className="btn-api-connect" id="api-connect-btn" onClick={handleConnect} disabled={apiLoading || !apiKey.trim()}>
                  {apiLoading ? (<><span className="ai-spinner" />Bağlanıyor...</>) : '⚡ Bağlan'}
                </button>
              </div>
            )}
            {apiConnected && (
              <div className="api-connected-info">
                <div className="api-info-row"><span className="api-info-label">Kanal</span><span>{profile.channel}</span></div>
                <div className="api-info-row"><span className="api-info-label">Kota</span><span className="api-quota">8,240 / 10,000</span></div>
                <div className="api-quota-bar"><div className="api-quota-fill" style={{ width: '82%' }} /></div>
                <button className="btn-api-disconnect" id="api-disconnect-btn"
                  onClick={handleDisconnect}>
                  Bağlantıyı Kes
                </button>
              </div>
            )}
          </section>

          {/* Kick API Panel */}
          <section className="settings-panel" aria-labelledby="settings-kick-api">
            <h2 id="settings-kick-api" className="settings-panel-title">🟢 Kick Stream API Entegrasyonu</h2>
            <p className="settings-panel-sub">API anahtarını girerek Kick yayın verilerini çek.</p>
            <div className="api-status-row">
              <span className={`api-status-dot api-status-dot--${kickConnected ? 'connected' : 'disconnected'}`} />
              <span className={`api-status-text ${kickConnected ? 'api-status-text--connected' : ''}`}>{kickConnected ? `✨ Connected: FacttBurstt` : '⚠️ Bağlantı yok'}</span>
            </div>
            {!kickConnected && (
              <div className="api-input-row">
                <input id="kick-key-input" type="password" className="field-input api-key-field"
                  placeholder="Kick API anahtarınızı girin" value={kickKey}
                  onChange={e => setKickKey(e.target.value)} aria-label="Kick API anahtarı" />
                <button className="btn-api-connect" id="kick-connect-btn" onClick={handleKickConnect} disabled={kickLoading || !kickKey.trim()}>
                  {kickLoading ? (<><span className="ai-spinner" />Bağlanıyor...</>) : '⚡ Bağlan'}
                </button>
              </div>
            )}
            {kickConnected && (
              <div className="api-connected-info">
                <div className="api-info-row"><span className="api-info-label">Kanal</span><span>FacttBurstt</span></div>
                <button className="btn-api-disconnect" id="kick-disconnect-btn"
                  onClick={handleKickDisconnect}>
                  Bağlantıyı Kes
                </button>
              </div>
            )}
          </section>

          {/* TikTok API Panel */}
          <section className="settings-panel" aria-labelledby="settings-tiktok-api">
            <h2 id="settings-tiktok-api" className="settings-panel-title">🎵 TikTok Creator API Entegrasyonu</h2>
            <p className="settings-panel-sub">Creator portal API anahtarını girerek verileri eşitle.</p>
            <div className="api-status-row">
              <span className={`api-status-dot api-status-dot--${tiktokConnected ? 'connected' : 'disconnected'}`} />
              <span className={`api-status-text ${tiktokConnected ? 'api-status-text--connected' : ''}`}>{tiktokConnected ? `✨ Connected: FacttBurstt` : '⚠️ Bağlantı yok'}</span>
            </div>
            {!tiktokConnected && (
              <div className="api-input-row">
                <input id="tiktok-key-input" type="password" className="field-input api-key-field"
                  placeholder="TikTok API anahtarınızı girin" value={tiktokKey}
                  onChange={e => setTikTokKey(e.target.value)} aria-label="TikTok API anahtarı" />
                <button className="btn-api-connect" id="tiktok-connect-btn" onClick={handleTikTokConnect} disabled={tiktokLoading || !tiktokKey.trim()}>
                  {tiktokLoading ? (<><span className="ai-spinner" />Bağlanıyor...</>) : '⚡ Bağlan'}
                </button>
              </div>
            )}
            {tiktokConnected && (
              <div className="api-connected-info">
                <div className="api-info-row"><span className="api-info-label">Hesap</span><span>FacttBurstt</span></div>
                <button className="btn-api-disconnect" id="tiktok-disconnect-btn"
                  onClick={handleTikTokDisconnect}>
                  Bağlantıyı Kes
                </button>
              </div>
            )}
          </section>

          <section className="settings-panel" aria-labelledby="settings-theme">
            <h2 id="settings-theme" className="settings-panel-title">🎨 Tema Seçimi</h2>
            <div className="theme-options" role="radiogroup" aria-label="Tema seçimi">
              {([
                { id: 'cyberpunk', label: 'Siberpunk Dark', desc: 'Mor & Cyan neon', icon: '🟣' },
                { id: 'neonblue', label: 'Neon Blue', desc: 'Mavi & Beyaz neon', icon: '🔵' },
                { id: 'light', label: 'Siberpunk Light (Beyaz Tema)', desc: 'Siber-beyaz & açık gri', icon: '⚪' },
              ] as const).map(t => (
                <button key={t.id} id={`theme-${t.id}`} role="radio" aria-checked={theme === t.id}
                  className={`theme-card ${theme === t.id ? 'theme-card--active' : ''}`}
                  onClick={() => { setTheme(t.id); addToast(`Tema "${t.label}" olarak değiştirildi.`, 'info'); }}>
                  <span className="theme-icon">{t.icon}</span>
                  <div><div className="theme-name">{t.label}</div><div className="theme-desc">{t.desc}</div></div>
                  {theme === t.id && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-panel" aria-labelledby="settings-notif">
            <h2 id="settings-notif" className="settings-panel-title">🔔 Bildirimler</h2>
            <div className="notif-options">
              {([
                { key: 'email', label: 'E-posta bildirimleri' },
                { key: 'push', label: 'Anlık bildirimler' },
                { key: 'weekly', label: 'Haftalık rapor' },
              ] as const).map(n => (
                <label key={n.key} htmlFor={`notif-${n.key}`} className="toggle-row">
                  <span className="toggle-label">{n.label}</span>
                  <div className={`toggle-switch ${notif[n.key] ? 'toggle-switch--on' : ''}`}
                    role="switch" aria-checked={notif[n.key]} tabIndex={0}
                    onClick={() => { setNotif(p => ({ ...p, [n.key]: !p[n.key] })); addToast(`${n.label} ${!notif[n.key] ? 'açıldı' : 'kapatıldı'}.`, 'info'); }}
                    onKeyDown={e => e.key === 'Enter' && setNotif(p => ({ ...p, [n.key]: !p[n.key] }))}>
                    <div className="toggle-knob" />
                  </div>
                  <input id={`notif-${n.key}`} type="checkbox" className="sr-only"
                    checked={notif[n.key]} onChange={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))} />
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// SUPPORT CHAT
// ═══════════════════════════════════════════════════════════
const SUPPORT_REPLIES = [
  'Anlıyorum! Bu konuda sana yardımcı olabilirim. 🚀',
  'Harika soru! BurstStudio ekibi bu konuyu yakında ele alacak. 💪',
  'YouTube API entegrasyonu için Ayarlar > API Entegrasyonu bölümüne göz at! 🔗',
  'İçerik takvimini Takvim sekmesinden detaylı yönetebilirsin. 📅',
  'AI Senaryo özelliğini denedin mi? Muhteşem sonuçlar veriyor! ✨',
  'Kanban kartlarını sürükleyerek değil, butonlarla ilerletebilirsin. İlerlet →',
];

function SupportChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Merhaba! 👋 BurstStudio Destek hattına hoş geldin. Sana nasıl yardımcı olabilirim?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(p => [...p, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 400));
    setTyping(false);

    const lowerText = text.toLowerCase();
    let reply = '';
    
    if (lowerText.includes('merhaba') || lowerText.includes('selam') || lowerText.includes('sa ') || lowerText === 'sa') {
      reply = "Selam kanka! BurstStudio destek hattına hoş geldin. Panoda, takvimde veya AI motorunda bir sıkıntı mı var, nasıl yardımcı olayım?";
    } else if (lowerText.includes('çalışmıyor') || lowerText.includes('calismiyor') || lowerText.includes('hata') || lowerText.includes('bozuk') || lowerText.includes('kötü') || lowerText.includes('kotu')) {
      reply = "Kanka hemen logları kontrol ettim. Playwright altındaki o gizli Node motoru ($NODE) şu an arka planda tıkır tıkır çalışıyor. Sayfayı bir yenile istersen, kodda hata yok!";
    } else if (lowerText.includes('senaryo') || lowerText.includes('ai') || lowerText.includes('yapay zeka') || lowerText.includes('pubg') || lowerText.includes('oyun')) {
      reply = "AI Senaryo Motoru artık tamamen dinamik kanka! Girdiğin kategoriye (Oyun, Teknoloji vb.) göre özel Hook ve B-Roll önerileri üretiyor. Başlığı girip mor butona basman yeterli.";
    } else if (lowerText.includes('kanban') || lowerText.includes('proje') || lowerText.includes('sayaç') || lowerText.includes('sayac') || lowerText.includes('ilerle')) {
      reply = "Kanban panosundaki kartları 'İlerle' ve 'Geri' butonlarıyla kaydırdığında, tepedeki tüm sayaçlar ve proje sayıları anlık olarak senkronize şekilde güncelleniyor kanka, test edebilirsin!";
    } else {
      reply = "Seni tam anlayamadım kanka. Panodaki projeler, AI senaryo üretimi, içerik takvimi veya teknik bir hata hakkında mı konuşuyoruz? Biraz daha detay verirsen hemen çözeyim!";
    }

    setMessages(p => [...p, { from: 'bot', text: reply }]);
  };

  return (
    <div className="support-chat" role="dialog" aria-label="Destek sohbeti" aria-modal="false">
      <div className="support-chat-header">
        <div className="support-chat-info">
          <div className="support-chat-avatar">🤖</div>
          <div>
            <div className="support-chat-title">BurstStudio Destek</div>
            <div className="support-chat-status"><span className="support-online-dot" aria-hidden="true" />Çevrimiçi</div>
          </div>
        </div>
        <button className="support-chat-close" onClick={onClose} aria-label="Destek penceresini kapat">✕</button>
      </div>
      <div className="support-chat-messages" role="log" aria-label="Sohbet mesajları">
        {messages.map((m, i) => (
          <div key={i} className={`support-msg support-msg--${m.from}`}>
            {m.from === 'bot' && <span className="support-msg-avatar" aria-hidden="true">🤖</span>}
            <div className="support-msg-bubble">{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="support-msg support-msg--bot">
            <span className="support-msg-avatar" aria-hidden="true">🤖</span>
            <div className="support-msg-bubble support-msg-typing" aria-label="Yazıyor...">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>
      <div className="support-chat-input-row">
        <input id="support-chat-input" type="text" className="support-chat-input"
          placeholder="Mesajını yaz..." value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          aria-label="Destek mesajı" />
        <button className="support-chat-send" onClick={send} aria-label="Mesaj gönder" disabled={!input.trim()}>→</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGOUT OVERLAY
// ═══════════════════════════════════════════════════════════
function LogoutOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="logout-overlay" aria-live="assertive" aria-label="Oturum kapatılıyor">
      <div className="logout-content">
        <div className="logout-icon">⚡</div>
        <div className="logout-title">Oturum Kapatılıyor...</div>
        <div className="logout-sub">BurstStudio'yu kullandığın için teşekkürler.</div>
        <div className="logout-bar"><div className="logout-bar-fill" /></div>
        <div className="logout-brand">Burst<span>Studio</span></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [projects, setProjects] = useState<VideoCard[]>(INITIAL_CARDS);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [supportOpen, setSupportOpen] = useState(false);
  const [logoutActive, setLogoutActive] = useState(false);

  // Lifted settings states
  const [theme, setTheme] = useState<'cyberpunk' | 'neonblue' | 'light'>('cyberpunk');
  const [apiConnected, setApiConnected] = useState(false);
  const [profile, setProfile] = useState({
    name: 'BurstStudio',
    channel: '@burststudio',
    email: 'creator@burststudio.tv',
    bio: 'Teknoloji ve yaşam içerikleri üretiyorum.'
  });
  const [ytStats, setYtStats] = useState<{ views: string; subs: string; videos: string } | null>(null);
  const [kickConnected, setKickConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for logout event dispatched by profile menu
  useEffect(() => {
    const handler = () => setLogoutActive(true);
    window.addEventListener('bs:logout', handler);
    return () => window.removeEventListener('bs:logout', handler);
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Moving a project updates the shared projects state → StatsBar recomputes instantly
  const handleMove = (id: string, dir: 'forward' | 'back') => {
    setProjects(prev => prev.map(card => {
      if (card.id !== id) return card;
      const currentStage = card.stage || card.status || 'idea';
      const idx = COLUMNS.findIndex(c => c.id === currentStage);
      const ni = dir === 'forward' ? idx + 1 : idx - 1;
      if (ni < 0 || ni >= COLUMNS.length) return card;
      const newStage = COLUMNS[ni].id;
      addToast(`"${card.title.slice(0, 24)}..." → ${STAGE_META[newStage].label}`, 'info');
      return { ...card, stage: newStage, status: newStage };
    }));
  };

  const handleAdd = (card: VideoCard) => {
    setProjects(prev => [card, ...prev]);
    addToast(`"${card.title.slice(0, 30)}..." panoya eklendi! 🎬`, 'success');
  };

  return (
    <div className="app-root">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        addToast={addToast}
        onSupportOpen={() => setSupportOpen(true)}
        profile={profile}
      />
      <main className="app-main" id="main-content">
        {activeTab === 'dashboard' && <DashboardTab projects={projects} onMove={handleMove} onAdd={handleAdd} addToast={addToast} ytStats={ytStats} />}
        {activeTab === 'projeler'  && <ProjelerTab projects={projects} />}
        {activeTab === 'analytics' && <AnalyticsTab apiConnected={apiConnected} ytStats={ytStats} kickConnected={kickConnected} tiktokConnected={tiktokConnected} />}
        {activeTab === 'takvim'   && <TakvimTab />}
        {activeTab === 'ayarlar'  && (
          <AyarlarTab
            addToast={addToast}
            theme={theme}
            setTheme={setTheme}
            profile={profile}
            setProfile={setProfile}
            apiConnected={apiConnected}
            setApiConnected={setApiConnected}
            setYtStats={setYtStats}
            kickConnected={kickConnected}
            setKickConnected={setKickConnected}
            tiktokConnected={tiktokConnected}
            setTiktokConnected={setTiktokConnected}
          />
        )}
      </main>
      <footer className="app-footer">
        <p>© 2025 BurstStudio — Built with ⚡ for content creators</p>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* Support Chat (floating bottom-right) */}
      {supportOpen && <SupportChat onClose={() => setSupportOpen(false)} />}

      {/* Logout Overlay */}
      {logoutActive && <LogoutOverlay onDone={() => setLogoutActive(false)} />}
    </div>
  );
}
