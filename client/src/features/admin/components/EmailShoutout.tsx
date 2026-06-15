import { useState } from 'react';
import { Send, Eye, AlertTriangle, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';

function extractHtmlFromMime(mime: string) {
  if (!mime.trim()) return '';
  // Try to find the HTML content
  const htmlRegex = /(<html[\s\S]*<\/html>|<body[\s\S]*<\/body>|<div[\s\S]*<\/div>)/i;
  const match = mime.match(htmlRegex);
  if (match && match[1]) {
    return match[1];
  }
  return `<div style="font-family: monospace; padding: 1rem; color: #666;">No valid HTML content detected yet...<br/>(Looking for &lt;html&gt;, &lt;body&gt;, or &lt;div&gt; tags)</div>`;
}

const DEFAULT_THEME_MIME = `From: admin@awsscd2026.com
To: attendee@example.com
Subject: AWS SCD 2026 - Race Day Update!
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', Courier, monospace; background-color: #050505; color: #ffffff; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333333; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #FF9900; padding-bottom: 20px; margin-bottom: 20px; }
    .title { color: #FF9900; font-size: 24px; font-weight: bold; text-transform: uppercase; font-style: italic; margin: 0; }
    .subtitle { color: #E10600; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
    .content { font-size: 16px; line-height: 1.6; color: #cccccc; }
    .highlight { color: #ffffff; font-weight: bold; }
    .button { display: inline-block; background-color: #E10600; color: #ffffff; text-decoration: none; padding: 12px 24px; margin-top: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .footer { margin-top: 30px; border-top: 1px solid #333333; padding-top: 20px; font-size: 12px; color: #666666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://awsscd.com/AWS_Builder.png" alt="AWS SCD Logo" style="height: 40px; margin-bottom: 15px;" />
      <h1 class="title">AWS SCD 2026</h1>
      <p class="subtitle">Race Control Broadcast</p>
    </div>
    <div class="content">
      <p>Drivers,</p>
      <p>We are gearing up for the ultimate cloud racing experience. Please check your pit lane assignments and ensure your telemetry systems are online.</p>
      <p><span class="highlight">Event Schedule Update:</span> Track opens at 09:00 AM IST. Be ready.</p>
      <center>
        <a href="#" class="button">View Dashboard</a>
      </center>
    </div>
    <div class="footer">
      &copy; 2026 AWS SCD Race Control. All rights reserved.
    </div>
  </div>
</body>
</html>`;

export function EmailShoutout() {
  const [mimeMessage, setMimeMessage] = useState(DEFAULT_THEME_MIME);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setStatusMsg(null);
    try {
      await adminApi.sendShoutout({ mimeMessage });
      setStatusMsg({ type: 'success', text: 'Shoutout queued successfully! Check server console.' });
      setMimeMessage('');
      setIsPreviewOpen(false);
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Failed to send shoutout' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 p-6 relative">
      <h3 className="font-sans font-black italic text-lg text-white mb-2 flex items-center gap-2">
        <Send size={18} className="text-aws-orange" />
        Email Shoutout (Broadcast)
      </h3>
      <p className="font-mono text-xs text-white/40 mb-6">
        Send a mass email to <strong>ALL emails in the database</strong>. 
        <br/>Paste your raw MIME formatted message below.
      </p>

      {statusMsg && (
        <div className={`p-4 mb-6 border font-mono text-xs ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {statusMsg.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono text-white/60 mb-2 uppercase tracking-widest">
              Raw MIME Message Payload
            </label>
            <textarea
              value={mimeMessage}
              onChange={(e) => setMimeMessage(e.target.value)}
              className="w-full h-[500px] bg-black border border-white/10 text-white p-4 font-mono text-sm focus:border-aws-orange focus:ring-1 focus:ring-aws-orange outline-none transition-all"
              placeholder={`From: sender@example.com\nTo: recipient@example.com\nSubject: Important Update\nMIME-Version: 1.0\nContent-Type: text/html; charset=UTF-8\n\n<html>...</html>`}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-mono text-white/60 mb-2 uppercase tracking-widest">
              Live HTML Preview
            </label>
            <div className="flex-1 bg-white border border-white/10 rounded-sm overflow-hidden h-[500px]">
              <iframe
                title="Email HTML Preview"
                srcDoc={extractHtmlFromMime(mimeMessage)}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={() => setIsPreviewOpen(true)}
            disabled={!mimeMessage.trim() || isSending}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-sm uppercase tracking-widest hover:bg-aws-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            Preview & Send
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h4 className="font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={18} className="text-f1-red" />
                Confirm Mass Broadcast
              </h4>
              <button onClick={() => setIsPreviewOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-white/70">
              <p className="mb-4 text-white">
                You are about to send this raw MIME payload to <strong>ALL users in the database</strong>. 
                Please verify the contents below:
              </p>
              <div className="bg-black p-4 border border-white/5 whitespace-pre-wrap overflow-x-auto">
                {mimeMessage}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-[#0a0a0a]">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-white/10 text-white/60 hover:text-white font-mono text-xs uppercase transition-colors"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2 bg-f1-red text-white font-mono text-xs uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Confirm & Send to All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
