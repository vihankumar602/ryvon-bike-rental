import { bikes } from '../data/bikes';

export function generateAITripItinerary(data) {
  const start = data.start || 'Chandigarh';
  const dest = data.dest || 'Manali';
  const days = Number(data.days || 3);
  const budget = Number(data.budget || 15000);
  const level = data.level || 'Intermediate';
  const pref = data.pref || 'Mountain Offroad';

  const routeTitle = `${start.toUpperCase()} → ${dest.toUpperCase()}`;
  let legs = [];
  let recBike = bikes[0];
  const hotels = ['Lake View Retreat', 'The Himalayan Luxury Resort', 'Solang Valley Alpine Huts'];
  const fuels = ['HP Swarghat Highway Station', 'Indian Oil Kullu Hub', 'BPCL Manali Bypass'];
  const foods = ['Giani Da Dhaba Swarghat', 'Highway Bistro Mandi', "Johnson's Cafe Manali"];
  const points = ['Pandoh Dam Viewpoint', 'Hanogi Mata Temple Pass', 'Atal Tunnel South Portal', 'Solang Ropeway Summit'];
  const packing = ['ECE/ISI Certified Helmet', 'Waterproof Riding Jacket', 'Thermal Base Layers', 'Riding Gloves & Boots', 'Rain Cover', 'Smartphone USB Mount', 'Hydration Pack', 'Emergency First Aid Kit'];
  const aiConditions = {
    statusBadge: '🟢 Excellent riding conditions',
    temp: '19°C',
    rainProb: '12%',
    roadCondition: 'Good / Asphalt',
    visibility: 'Excellent (10 km)',
    recommendation: 'Start before 8:00 AM to avoid traffic near Mandi.'
  };
  const aiSafety = {
    overallScore: 87,
    subscores: [
      { label: 'Road quality', score: 91 },
      { label: 'Weather', score: 84 },
      { label: 'Traffic', score: 79 },
      { label: 'Visibility', score: 95 },
      { label: 'Terrain', score: 86 }
    ],
    tip: 'Safety Tip: Heavy rain expected after 6 PM. Consider returning before 5 PM.'
  };

  const himalayan = bikes.find(b => b.id === 'himalayan') || bikes[0];

  if (start.toLowerCase().includes('chandigarh') && dest.toLowerCase().includes('manali')) {
    recBike = himalayan;
    legs = [
      { day: 1, title: 'Chandigarh → Bilaspur', dist: '190 km', time: '4h 30m', desc: 'Smooth highway cruise via Swarghat ghat roads.' },
      { day: 2, title: 'Bilaspur → Manali', dist: '210 km', time: '5h', desc: 'Scenic mountain climb along Beas River and Mandi Tunnels.' },
      { day: 3, title: 'Manali → Solang Valley & Atal Tunnel', dist: '45 km', time: '2h', desc: 'High altitude pass drive to Atal Tunnel portal.' }
    ];
  } else {
    recBike = pref.includes('Mountain') ? himalayan : bikes[0];
    for (let i = 1; i <= days; i++) {
      legs.push({
        day: i,
        title: `Leg ${i}: ${start} → Waypoint ${i}`,
        dist: `${120 + i * 40} km`,
        time: `${3 + i}h`,
        desc: `Curated ${pref} leg.`
      });
    }
  }

  return { routeTitle, days, budget, level, pref, legs, recBike, hotels, fuels, foods, points, packing, aiConditions, aiSafety };
}
