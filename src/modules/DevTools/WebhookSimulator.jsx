import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, User, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const WebhookSimulator = () => {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newLog = { 
            id: Date.now(), 
            type: 'user', 
            text: message, 
            timestamp: new Date().toLocaleTimeString() 
        };
        setLogs(prev => [...prev, newLog]);
        setLoading(true);
        setMessage('');

        try {
            const response = await api.post('/api/webhooks/simulate', 
                { text: newLog.text, platform: 'whatsapp' }
            );

            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.data.reply,
                status: 'success',
                timestamp: new Date().toLocaleTimeString()
            };
            setLogs(prev => [...prev, botResponse]);

        } catch (error) {
            const errorResponse = {
                id: Date.now() + 1,
                type: 'error',
                text: 'Failed to process message. Server error.',
                status: 'error',
                timestamp: new Date().toLocaleTimeString()
            };
            setLogs(prev => [...prev, errorResponse]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-green-100 rounded-lg text-green-700">
                        <Bot size={18} />
                   </div>
                   <div>
                       <h3 className="font-bold text-dark text-sm">Webhook Simulator</h3>
                       <p className="text-xs text-gray-500">Test your auto-invoicing logic here</p>
                   </div>
                </div>
                <div className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">
                    POST /api/webhooks/simulate
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {logs.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <Bot size={40} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No messages yet. Try saying:</p>
                        <p className="text-xs italic mt-1">"I want 2 Ankara Tops"</p>
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} className={`flex gap-3 ${log.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                            ${log.type === 'user' ? 'bg-gray-100 text-gray-600' : 
                              log.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {log.type === 'user' ? <User size={14} /> : log.type === 'error' ? <AlertCircle size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm 
                            ${log.type === 'user' ? 'bg-primary text-white rounded-tr-none' : 
                              log.type === 'error' ? 'bg-red-50 text-red-700 rounded-tl-none' : 'bg-gray-100 text-dark rounded-tl-none'}`}>
                            <p>{log.text}</p>
                            <span className={`text-[10px] block mt-1 opacity-70 ${log.type === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                                {log.timestamp}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                     <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                             <Bot size={14} />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-500">
                            Typing...
                        </div>
                     </div>
                )}
            </div>

            <form onSubmit={handleSimulate} className="p-4 border-t border-gray-100 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Type a simulated message..." 
                    className="flex-1 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 text-sm"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-green-700 text-white w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50">
                    <Send size={18} />
                </Button>
            </form>
        </div>
    );
};

export default WebhookSimulator;
