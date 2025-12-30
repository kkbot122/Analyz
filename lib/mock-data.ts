import { subDays, addMinutes } from "date-fns";

export const MOCK_EVENTS = generateMockData();

function generateMockData() {
  const events = [];
  const today = new Date();
  
  // 1. Generate Traffic (Waves)
  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    // Make weekends quieter
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseVolume = isWeekend ? 50 : 150;
    const volume = baseVolume + Math.floor(Math.random() * 50);

    for (let j = 0; j < volume; j++) {
      events.push({
        id: `mock_${i}_${j}`,
        eventName: "page_view",
        // Distribute events throughout the day
        createdAt: addMinutes(date, Math.floor(Math.random() * 1440)),
        sessionId: `session_${i}_${Math.floor(j / 5)}`, // ~5 events per session
        userId: `user_${Math.floor(j / 10)}`, // ~10 events per user
        properties: {
            path: ["/", "/pricing", "/docs"][Math.floor(Math.random() * 3)],
            country: ["US", "IN", "DE"][Math.floor(Math.random() * 3)]
        }
      });
    }
  }

  // 2. Generate Conversions (for Funnel)
  // Add "signup_completed" events to 20% of sessions
  const sessions = new Set(events.map(e => e.sessionId));
  sessions.forEach(sid => {
      if (Math.random() > 0.8) {
          events.push({
              id: `conv_${sid}`,
              eventName: "signup_completed",
              createdAt: new Date(), // Simulating recent conversions
              sessionId: sid,
              userId: `user_converted`,
              properties: { plan: "pro" }
          });
      }
  });

  return events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}