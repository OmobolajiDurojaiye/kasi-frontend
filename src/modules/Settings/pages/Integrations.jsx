import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Instagram, CheckCircle, XCircle, ExternalLink, Copy, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import WebhookSimulator from '../../DevTools/WebhookSimulator';

const Integrations = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };

  // Telegram state
  const [telegramStatus, setTelegramStatus] = useState({ connected: false, bot: null });
  const [botToken, setBotToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const res = await axios.get('/api/telegram/status', { headers });
      setTelegramStatus(res.data);
    } catch {
      // not connected
    } finally {
      setLoadingStatus(false);
    }
  };

  const connectTelegram = async () => {
    if (!botToken.trim()) {
      showToast('Please enter your bot token', 'error');
      return;
    }
    setConnecting(true);
    try {
      const res = await axios.post('/api/telegram/connect', { bot_token: botToken.trim() }, { headers });
      setTelegramStatus({ connected: true, bot: res.data.bot });
      setBotToken('');
      showToast('Telegram bot connected! 🎉', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to connect';
      showToast(msg, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectTelegram = async () => {
    if (!confirm('Disconnect your Telegram bot?')) return;
    try {
      await axios.delete('/api/telegram/disconnect', { headers });
      setTelegramStatus({ connected: false, bot: null });
      showToast('Bot disconnected', 'success');
    } catch {
      showToast('Failed to disconnect', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark mb-1">Integrations</h1>
        <p className="text-gray-500 text-sm">Connect messaging platforms so the AI can respond to your customers automatically.</p>
      </div>

      {/* ── Telegram ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <Send size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-dark">Telegram</h3>
                {telegramStatus.connected ? (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Connected
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                    <XCircle size={12} />
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Connect a Telegram bot to auto-respond to customer messages, share product catalogs, and generate invoices.
              </p>
            </div>
          </div>

          {loadingStatus ? (
            <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Checking status...
            </div>
          ) : telegramStatus.connected ? (
            /* ── Connected state ── */
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <Send size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">
                      @{telegramStatus.bot?.bot_username || 'your-bot'} is live!
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Customers messaging your bot will get AI-powered responses from your product catalog.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={disconnectTelegram}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
              >
                Disconnect Bot
              </button>
            </div>
          ) : (
            /* ── Setup flow ── */
            <div className="mt-6 space-y-4">
              {/* Step-by-step guide */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-dark">Setup Guide (2 minutes)</p>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Open Telegram and search for <strong>@BotFather</strong></li>
                  <li>Send <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">/newbot</code> and follow the prompts</li>
                  <li>BotFather will give you a <strong>bot token</strong> — copy it</li>
                  <li>Paste the token below and click <strong>Connect</strong></li>
                </ol>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink size={14} />
                  Open @BotFather
                </a>
              </div>

              {/* Token input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Paste your bot token here (e.g. 123456:ABC-DEF1234...)"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <button
                  onClick={connectTelegram}
                  disabled={connecting || !botToken.trim()}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  {connecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Connect Bot'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── WhatsApp (Coming Soon) ────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 opacity-75">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-dark">WhatsApp</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Automate replies and generate invoices directly from WhatsApp Business messages.
            </p>
          </div>
        </div>
      </div>

      {/* ── Instagram (Coming Soon) ───────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 opacity-75">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
            <Instagram size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-dark">Instagram</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Turn Instagram DMs into sales with AI-powered auto-responses.
            </p>
          </div>
        </div>
      </div>

      {/* ── Webhook Simulator ─────────────────────── */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-dark mb-4">Message Simulator (DevTool)</h3>
        <WebhookSimulator />
      </div>
    </div>
  );
};

export default Integrations;
