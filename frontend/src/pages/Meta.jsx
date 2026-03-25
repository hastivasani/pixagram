import { useNavigate } from "react-router-dom";

const META_APPS = [
  {
    name: "Facebook",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    url: "https://facebook.com",
    desc: "Connect with friends and the world.",
  },
  {
    name: "Instagram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    url: "https://instagram.com",
    desc: "Share photos and videos.",
  },
  {
    name: "WhatsApp",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    url: "https://whatsapp.com",
    desc: "Simple, reliable messaging.",
  },
  {
    name: "Threads",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/01/Threads_%28app%29_logo.svg",
    url: "https://threads.net",
    desc: "Join the conversation.",
  },
  {
    name: "Messenger",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
    url: "https://messenger.com",
    desc: "Fast, fun messaging.",
  },
];

export default function Meta() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-theme-muted text-sm mb-6 hover:text-theme-primary transition">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-theme-primary mb-2">Also from Meta</h1>
        <p className="text-theme-muted text-sm mb-8">Explore other apps and services from Meta.</p>

        <div className="space-y-3">
          {META_APPS.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-theme-card rounded-2xl border border-theme hover:bg-theme-hover transition shadow-theme"
            >
              <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-2xl object-contain" />
              <div>
                <p className="font-semibold text-theme-primary">{app.name}</p>
                <p className="text-sm text-theme-muted">{app.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
