import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';

export default function AIAssistantModal() {
  const { closeModal } = useModal();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am RideOS Concierge AI. How can I assist with your motorcycle rental, route telemetry, or gear selection today?'
    }
  ]);
  const [input, setInput] = useState('');

  const quickPrompts = [
    'Best motorcycle for Leh Ladakh?',
    'How does the security deposit escrow work?',
    'What safety gear is included free?',
    'Can I do a one-way trip between Manali and Leh?'
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    let reply = 'Our telematics fleet covers 33+ superbikes and tourers. You can explore the fleet directly or run our Build My Ride AI.';

    const q = query.toLowerCase();
    if (q.includes('ladakh') || q.includes('spiti') || q.includes('mountain')) {
      reply = 'For high-altitude Himalayan routes like Ladakh or Spiti, we strongly recommend the Royal Enfield Himalayan 450 or BMW F 850 GS. Both feature long-travel suspension, 220mm ground clearance, and high-altitude ECU tuning.';
    } else if (q.includes('deposit') || q.includes('escrow') || q.includes('refund')) {
      reply = 'We operate a 100% automated 24-hour escrow refund system. Activas have a ₹1,000 deposit; cruisers ₹3,000; and premium superbikes ₹5,000. Deposits are automatically released back to your bank within 24 hours of vehicle return.';
    } else if (q.includes('gear') || q.includes('helmet') || q.includes('free')) {
      reply = 'Every single booking includes 1 sanitized ISI/ECE-22.06 certified rider helmet completely free. You can also add riding jackets, knee guards, waterproof luggage bags, and 4K action cameras during booking!';
    } else if (q.includes('one-way') || q.includes('drop')) {
      reply = 'Yes! One-way rentals are available between Manali ⇄ Leh, Chandigarh ⇄ Shimla, and Bengaluru ⇄ Goa with instant keyless dropoff at our station hubs.';
    }

    setMessages(prev => [...prev, userMsg, { sender: 'ai', text: reply }]);
    if (!textToSend) setInput('');
  };

  return (
    <div className="modal" style={{ maxWidth: '580px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', height: '520px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>✨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px' }}>RideOS AI Concierge</h3>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>● Online · Real-time Intelligence</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '14px',
                background: m.sender === 'user' ? 'var(--lime)' : 'var(--paper)',
                color: m.sender === 'user' ? '#070a0f' : 'var(--ink)',
                fontSize: '13px',
                lineHeight: 1.5,
                border: '1px solid var(--line)'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', whiteSpace: 'nowrap', padding: '4px 10px', minHeight: '28px', height: '28px' }}
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              placeholder="Ask anything about bikes, routes or rentals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '999px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
            />
            <button className="btn btn-primary" type="submit" style={{ padding: '0 16px' }}>Send</button>
          </form>
        </div>
      </div>
  );
}
