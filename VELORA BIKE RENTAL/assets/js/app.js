/* RideOS — World-Class AI-Powered Motorcycle Rental Engine */
(() => {
  'use strict';

  let page = 'home';
  const inPages = location.pathname.replace(/\\/g, '/').includes('/pages/');
  const link = (p) => p === 'home' ? (inPages ? '../index.html' : 'index.html') : (inPages ? p + '.html' : 'pages/' + p + '.html');
  const getAsset = (file) => `${inPages ? '../' : ''}assets/images/${file}`;
  const query = new URLSearchParams(location.search);
  const today = new Date().toISOString().split('T')[0];

  // Theme state & OS preference detection
  let currentTheme = localStorage.getItem('rideos-theme');
  if (!currentTheme) {
    currentTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    currentTheme = theme;
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    const btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(b => { b.textContent = theme === 'dark' ? '☀️' : '☾'; });
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('rideos-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Multi-brand state
  let currentBrand = 'RYVON';
  let currentCurrency = localStorage.getItem('ryvon-currency') || 'INR';
  let currentRiderPersona = localStorage.getItem('ryvon-rider-persona') || 'Mountain Rider';
  const AUTH_USER_KEY = 'ryvon-auth-user';
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const getAuthUser = () => {
    try {
      const userStr = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
      return JSON.parse(userStr || 'null');
    } catch (e) {
      return null;
    }
  };
  const saveAuthUser = (user, rememberMe = true) => {
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, userStr);
      sessionStorage.removeItem(AUTH_USER_KEY);
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, userStr);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };
  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  };
  const getUsers = () => {
    try {
      let users = JSON.parse(localStorage.getItem('ryvon-users') || '[]');
      if (users.length === 0) {
        users = [{
          name: 'Rider Captain',
          email: 'captain@ryvon.com',
          password: 'password123',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          licenseNumber: 'KA-01-2024-0098712',
          phone: '+91 98765 43210',
          memberSince: 'Aug 2026',
          completedTrips: 8,
          activeReservations: 1,
          points: 1240,
          safetyScore: 87
        }];
        localStorage.setItem('ryvon-users', JSON.stringify(users));
      }
      return users;
    } catch (e) {
      return [];
    }
  };
  // Ensure database initialization
  getUsers();

  const userInitial = (user) => (user?.name || user?.email || 'R').trim().charAt(0).toUpperCase();
  const displayName = (user) => escapeHTML(user?.name || (user?.email || 'Rider').split('@')[0]);
  const userAvatar = (user, className = 'user-avatar-img') => user?.avatar
    ? `<img class="${className}" src="${escapeHTML(user.avatar)}" alt="${displayName(user)}">`
    : `<span class="${className} user-avatar-initial" aria-hidden="true">${userInitial(user)}</span>`;


  const currencyRates = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 0.012 },
    EUR: { symbol: '€', rate: 0.011 },
    GBP: { symbol: '£', rate: 0.0094 }
  };

  const money = (num) => {
    const curr = currencyRates[currentCurrency] || currencyRates.INR;
    const converted = Math.round(Number(num) * curr.rate);
    return `${curr.symbol}${converted.toLocaleString()}`;
  };

  // Expanded Massive 33+ Vehicle Catalog (Activas, Scooters, Superbikes & Cruisers)
  const bikes = [
    // 🏔️ ADVENTURE & TOURING (PAGE 1)
    {id:'scrambler400x',name:'Triumph Scrambler 400X',brand:'Triumph',type:'Adventure',price:1649,rating:'4.9',engine:'398 cc',power:'40 PS',torque:'37.5 Nm',weight:'185 kg',seat:'835 mm',topSpeed:'152 km/h',fuelCap:'13 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787482448184.jpg',imgFile:'triumph-scrambler-400x.jpg',dna:{comfort:93,adventure:96,city:85,beginner:78,longRide:94,mileage:83,bestFor:'Scrambler Dirt Trails & Mountain Pass'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'ktmadv390',name:'KTM Adventure 390 Rally',brand:'KTM',type:'Adventure',price:1749,rating:'4.9',engine:'373 cc',power:'43.5 PS',torque:'37 Nm',weight:'177 kg',seat:'855 mm',topSpeed:'155 km/h',fuelCap:'14.5 L',deposit:4500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'99% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483220418.jpg',imgFile:'ktm-adventure-390.jpg',dna:{comfort:90,adventure:98,city:80,beginner:70,longRide:95,mileage:80,bestFor:'Hardcore Offroad Rally & Slopes'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'scram411',name:'Royal Enfield Scram 411 Trail',brand:'Royal Enfield',type:'Adventure',price:1299,rating:'4.8',engine:'411 cc',power:'24.3 PS',torque:'32 Nm',weight:'185 kg',seat:'795 mm',topSpeed:'130 km/h',fuelCap:'15 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787482686415.jpg',imgFile:'royal-enfield-scram-411.jpg',dna:{comfort:92,adventure:94,city:88,beginner:84,longRide:90,mileage:85,bestFor:'Urban Crossover & Unpaved Mountain Roads'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'vstrom250',name:'Suzuki V-Strom SX 250',brand:'Suzuki',type:'Adventure',price:1399,rating:'4.8',engine:'249 cc',power:'26.5 PS',torque:'22.2 Nm',weight:'167 kg',seat:'835 mm',topSpeed:'138 km/h',fuelCap:'12 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787482975007.jpg',imgFile:'suzuki-v-strom-sx-250.jpg',dna:{comfort:94,adventure:92,city:86,beginner:86,longRide:92,mileage:88,bestFor:'Lightweight Dual-Sport Highway & Trails'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'bmwf850',name:'BMW F 850 GS Expedition',brand:'BMW',type:'Adventure',price:2899,rating:'5.0',engine:'853 cc',power:'95 PS',torque:'92 Nm',weight:'233 kg',seat:'860 mm',topSpeed:'197 km/h',fuelCap:'15 L',deposit:9000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'100% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483265241.jpg',imgFile:'bmw-f850-gs.jpg',dna:{comfort:98,adventure:100,city:70,beginner:55,longRide:100,mileage:72,bestFor:'Heavyweight Trans-Himalayan Tourer'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐',mileage:'⭐⭐⭐'}},
    {id:'supermeteor',name:'Super Meteor 650 Cruiser',brand:'Royal Enfield',type:'Cruiser',price:1849,rating:'4.9',engine:'648 cc',power:'47 PS',torque:'52.3 Nm',weight:'241 kg',seat:'740 mm',topSpeed:'168 km/h',fuelCap:'15.7 L',deposit:5000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483309805.jpg',imgFile:'royal-enfield-super-meteor-650.jpg',dna:{comfort:98,adventure:74,city:78,beginner:72,longRide:99,mileage:76,bestFor:'Ultra Luxury Interstate Cruising'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐'}},
    {id:'meteor',name:'Meteor 350 Stellar',brand:'Royal Enfield',type:'Cruiser',price:1399,rating:'4.8',engine:'349 cc',power:'20.4 PS',torque:'27 Nm',weight:'191 kg',seat:'765 mm',topSpeed:'120 km/h',fuelCap:'15 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'95% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483389475.jpg',imgFile:'royal-enfield-meteor-350.jpg',dna:{comfort:96,adventure:75,city:86,beginner:88,longRide:92,mileage:88,bestFor:'Relaxed Coastal & Highway Cruising'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},
    {id:'classic350',name:'Classic 350 Heritage',brand:'Royal Enfield',type:'Cruiser',price:1299,rating:'4.8',engine:'349 cc',power:'20.2 PS',torque:'27 Nm',weight:'195 kg',seat:'805 mm',topSpeed:'115 km/h',fuelCap:'13 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483611534.png',imgFile:'royal-enfield-classic-350.png',dna:{comfort:90,adventure:78,city:84,beginner:85,longRide:88,mileage:86,bestFor:'Heritage Countryside Touring'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'bullet350',name:'Bullet 350 Military Edition',brand:'Royal Enfield',type:'Cruiser',price:1199,rating:'4.8',engine:'349 cc',power:'20.2 PS',torque:'27 Nm',weight:'195 kg',seat:'805 mm',topSpeed:'114 km/h',fuelCap:'13 L',deposit:3000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'95% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787483684430.jpg',imgFile:'royal-enfield-bullet-350.jpg',dna:{comfort:90,adventure:78,city:82,beginner:82,longRide:88,mileage:86,bestFor:'Iconic Heavy Thump Heritage Ride'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},

    // 🛵 SCOOTERS & EXPEDITION (PAGE 2)
    {id:'activa6g',name:'Honda Activa 6G Deluxe',brand:'Honda',type:'Scooter',price:599,rating:'4.8',engine:'109.5 cc',power:'7.79 PS',torque:'8.84 Nm',weight:'107 kg',seat:'692 mm',topSpeed:'85 km/h',fuelCap:'5.3 L',deposit:1500,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'99% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486800181.jpg',imgFile:'honda-activa-6g.jpg',dna:{comfort:92,adventure:50,city:100,beginner:100,longRide:60,mileage:98,bestFor:'Effortless Daily City Commute & Market Runs'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},
    {id:'activa125',name:'Honda Activa 125 FI Premium',brand:'Honda',type:'Scooter',price:699,rating:'4.8',engine:'124 cc',power:'8.3 PS',torque:'10.4 Nm',weight:'109 kg',seat:'712 mm',topSpeed:'90 km/h',fuelCap:'5.3 L',deposit:2000,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787487193743.jpg',imgFile:'honda-activa-125.jpg',dna:{comfort:94,adventure:55,city:99,beginner:98,longRide:68,mileage:95,bestFor:'Smooth 125cc City Commute & Pillion Comfort'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},
    {id:'jupiter125',name:'TVS Jupiter 125 SmartXonnect',brand:'TVS',type:'Scooter',price:649,rating:'4.8',engine:'124.8 cc',power:'8.15 PS',torque:'10.5 Nm',weight:'108 kg',seat:'765 mm',topSpeed:'92 km/h',fuelCap:'5.1 L',deposit:1800,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'97% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787487341306.jpg',imgFile:'tvs-jupiter-125.jpg',dna:{comfort:95,adventure:52,city:98,beginner:98,longRide:65,mileage:96,bestFor:'33L Underseat Boot Storage & City Commute'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},
    {id:'ntorq125',name:'TVS Ntorq 125 Race Edition',brand:'TVS',type:'Scooter',price:749,rating:'4.9',engine:'124.8 cc',power:'9.38 PS',torque:'10.6 Nm',weight:'116 kg',seat:'770 mm',topSpeed:'98 km/h',fuelCap:'5.8 L',deposit:2000,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'98% Match',imgFile:'tvs-ntorq-125.jpg',dna:{comfort:88,adventure:62,city:96,beginner:90,longRide:72,mileage:90,bestFor:'Sporty Acceleration & Bluetooth Navigation'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'burgman125',name:'Suzuki Burgman Street 125 EX',brand:'Suzuki',type:'Scooter',price:799,rating:'4.8',engine:'124 cc',power:'8.7 PS',torque:'10 Nm',weight:'111 kg',seat:'780 mm',topSpeed:'95 km/h',fuelCap:'5.5 L',deposit:2200,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'97% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787482370617.jpg',imgFile:'suzuki-burgman-125.jpg',dna:{comfort:98,adventure:58,city:95,beginner:92,longRide:78,mileage:92,bestFor:'Luxury Maxi Scooter Footrest Ergonomics'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'aerox',name:'Yamaha Aerox 155 Maxi Sport',brand:'Yamaha',type:'Scooter',price:899,rating:'4.9',engine:'155 cc VVA',power:'15 PS',torque:'13.9 Nm',weight:'126 kg',seat:'790 mm',topSpeed:'120 km/h',fuelCap:'5.5 L',deposit:2500,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'99% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486981216.jpg',imgFile:'yamaha-aerox-155.jpg',dna:{comfort:88,adventure:68,city:98,beginner:85,longRide:82,mileage:88,bestFor:'155cc R15 Engine Maxi Scooter Highways'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'vespa150',name:'Vespa Elegante 150 Speciale',brand:'Vespa',type:'Scooter',price:999,rating:'4.9',engine:'149 cc',power:'10.4 PS',torque:'11 Nm',weight:'115 kg',seat:'770 mm',topSpeed:'102 km/h',fuelCap:'7.4 L',deposit:3000,fuel:'Petrol',transmission:'Automatic',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787487446061.jpg',imgFile:'vespa-elegante-150.jpg',dna:{comfort:94,adventure:55,city:96,beginner:90,longRide:75,mileage:86,bestFor:'Italian Monocoque Steel Fashion Cruising'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'himalayan',name:'Himalayan 450 Summit',brand:'Royal Enfield',type:'Adventure',price:1499,rating:'4.9',engine:'452 cc',power:'40 PS',torque:'40 Nm',weight:'196 kg',seat:'825 mm',topSpeed:'151 km/h',fuelCap:'17 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'99% Match',imgFile:'himalayan-450.jpg',dna:{comfort:94,adventure:99,city:82,beginner:74,longRide:97,mileage:84,bestFor:'Alpine Passes + Long Distance Offroad'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'bmw310',name:'BMW G 310 GS Alpine',brand:'BMW',type:'Adventure',price:1899,rating:'4.9',engine:'313 cc',power:'34 PS',torque:'28 Nm',weight:'175 kg',seat:'835 mm',topSpeed:'143 km/h',fuelCap:'11 L',deposit:5000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'99% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787482011678.jpg',imgFile:'bmw-g310-gs.jpg',dna:{comfort:94,adventure:99,city:84,beginner:80,longRide:96,mileage:85,bestFor:'Alpine Passes + Mountain Trails'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},

    {id:'hd440',name:'Harley-Davidson X440 Roadster',brand:'Harley-Davidson',type:'Cruiser',price:1649,rating:'4.8',engine:'440 cc',power:'27 PS',torque:'38 Nm',weight:'190 kg',seat:'805 mm',topSpeed:'135 km/h',fuelCap:'13.5 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787484367040.jpg',imgFile:'harley-davidson-x440.jpg',dna:{comfort:92,adventure:82,city:86,beginner:80,longRide:94,mileage:82,bestFor:'Neo-Retro Expressway Cruising'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'iron883',name:'Harley-Davidson Iron 883 Dark',brand:'Harley-Davidson',type:'Cruiser',price:3499,rating:'4.9',engine:'883 cc V-Twin',power:'51 PS',torque:'68 Nm',weight:'256 kg',seat:'760 mm',topSpeed:'175 km/h',fuelCap:'12.5 L',deposit:10000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787484638750.jpg',imgFile:'harley-davidson-iron-883.jpg',dna:{comfort:90,adventure:68,city:72,beginner:50,longRide:92,mileage:68,bestFor:'Raw American V-Twin Rumble & Pride'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐',beginner:'⭐',mileage:'⭐⭐'}},
    {id:'hness350',name:'Honda Hness CB350 DLX Pro',brand:'Honda',type:'Cruiser',price:1349,rating:'4.9',engine:'348 cc',power:'21 PS',torque:'30 Nm',weight:'181 kg',seat:'800 mm',topSpeed:'132 km/h',fuelCap:'15 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'97% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787484778089.jpg',imgFile:'honda-hness-cb350.jpg',dna:{comfort:95,adventure:78,city:90,beginner:88,longRide:92,mileage:88,bestFor:'Ultra Refined Slipper Clutch Highway Cruising'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'eliminator450',name:'Kawasaki Eliminator 450',brand:'Kawasaki',type:'Cruiser',price:2199,rating:'4.9',engine:'451 cc Parallel',power:'45 PS',torque:'42.6 Nm',weight:'176 kg',seat:'735 mm',topSpeed:'160 km/h',fuelCap:'13 L',deposit:6000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787484813657.png',imgFile:'kawasaki-eliminator-450.png',dna:{comfort:96,adventure:78,city:88,beginner:82,longRide:95,mileage:82,bestFor:'Lightweight Ninja-Engineered Urban Cruiser'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},

    // 🏙️ ROADSTERS & NAKED SPORT
    {id:'trident',name:'Triumph Trident 660',brand:'Triumph',type:'Roadster',price:1699,rating:'4.9',engine:'660 cc Triple',power:'81 PS',torque:'64 Nm',weight:'189 kg',seat:'805 mm',topSpeed:'212 km/h',fuelCap:'14 L',deposit:5000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787485298985.jpg',imgFile:'triumph-trident-660.jpg',dna:{comfort:90,adventure:85,city:88,beginner:72,longRide:94,mileage:80,bestFor:'Triple Cylinder Whine & Expressway Twisties'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'gt650',name:'Continental GT 650 Twin',brand:'Royal Enfield',type:'Roadster',price:1799,rating:'4.8',engine:'648 cc Twin',power:'47 PS',torque:'52 Nm',weight:'212 kg',seat:'804 mm',topSpeed:'174 km/h',fuelCap:'12.5 L',deposit:4500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'97% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787485629206.jpg',imgFile:'royal-enfield-continental-gt-650.jpg',dna:{comfort:85,adventure:80,city:84,beginner:68,longRide:92,mileage:78,bestFor:'Retro Cafe Racer & Expressway Runs'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐'}},
    {id:'guerrilla450',name:'Guerrilla 450 Roadster',brand:'Royal Enfield',type:'Roadster',price:1599,rating:'4.9',engine:'452 cc Sherpa',power:'40 PS',torque:'40 Nm',weight:'185 kg',seat:'780 mm',topSpeed:'155 km/h',fuelCap:'11 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787485678173.jpg',imgFile:'royal-enfield-guerrilla-450.jpg',dna:{comfort:88,adventure:84,city:94,beginner:80,longRide:90,mileage:82,bestFor:'Aggressive Sherpa 450 Roadster Cornering'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'hunter350',name:'Hunter 350 Urban',brand:'Royal Enfield',type:'Roadster',price:1249,rating:'4.8',engine:'349 cc',power:'20.2 PS',torque:'27 Nm',weight:'181 kg',seat:'790 mm',topSpeed:'114 km/h',fuelCap:'13 L',deposit:3000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'95% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787485815916.png',imgFile:'royal-enfield-hunter-350.png',dna:{comfort:86,adventure:72,city:96,beginner:92,longRide:80,mileage:90,bestFor:'City Commute & Nimble Traffic'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'speed400',name:'Triumph Speed 400',brand:'Triumph',type:'Roadster',price:1549,rating:'4.9',engine:'398 cc',power:'40 PS',torque:'37.5 Nm',weight:'176 kg',seat:'790 mm',topSpeed:'155 km/h',fuelCap:'13 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787485961203.png',imgFile:'triumph-speed-400.png',dna:{comfort:92,adventure:86,city:94,beginner:85,longRide:92,mileage:84,bestFor:'Neo-Retro City & Highway Crossover'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'duke',name:'KTM Duke 390 Gen-3',brand:'KTM',type:'Sport',price:1599,rating:'4.9',engine:'399 cc LC4c',power:'46 PS',torque:'39 Nm',weight:'168 kg',seat:'820 mm',topSpeed:'168 km/h',fuelCap:'15 L',deposit:4000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486033224.jpg',imgFile:'ktm-duke-390.jpg',dna:{comfort:82,adventure:84,city:90,beginner:65,longRide:82,mileage:78,bestFor:'Corner Rocket & Aggressive Track Days'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐'}},
    {id:'cb350rs',name:'Honda CB350RS Scrambler',brand:'Honda',type:'Roadster',price:1299,rating:'4.8',engine:'348 cc',power:'21 PS',torque:'30 Nm',weight:'179 kg',seat:'800 mm',topSpeed:'130 km/h',fuelCap:'15 L',deposit:3500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'95% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486108680.jpg',imgFile:'honda-cb350rs.jpg',dna:{comfort:90,adventure:78,city:92,beginner:88,longRide:88,mileage:88,bestFor:'Refined Scrambler Weekend Excursions'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'mt15',name:'Yamaha MT-15 V2 Dark Warrior',brand:'Yamaha',type:'Sport',price:1099,rating:'4.8',engine:'155 cc VVA',power:'18.4 PS',torque:'14.1 Nm',weight:'141 kg',seat:'810 mm',topSpeed:'130 km/h',fuelCap:'10 L',deposit:3000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486159462.jpg',imgFile:'yamaha-mt-15-v2.jpg',dna:{comfort:82,adventure:74,city:98,beginner:85,longRide:78,mileage:92,bestFor:'Hyper-Naked City Agility & Street Performance'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},

    // 🔥 SUPERSPORT & HYPERBIKE
    {id:'ninja400',name:'Kawasaki Ninja 400 Supersport',brand:'Kawasaki',type:'Sport',price:1999,rating:'4.9',engine:'399 cc Twin',power:'45 PS',torque:'37 Nm',weight:'168 kg',seat:'785 mm',topSpeed:'188 km/h',fuelCap:'14 L',deposit:5500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'97% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486334531.jpg',imgFile:'kawasaki-ninja-400.jpg',dna:{comfort:84,adventure:75,city:88,beginner:75,longRide:86,mileage:80,bestFor:'High Revving Twin Supersport Highways'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐',mileage:'⭐⭐⭐⭐'}},
    {id:'ducati',name:'Ducati Scrambler 800 Icon',brand:'Ducati',type:'Sport',price:2499,rating:'5.0',engine:'803 cc L-Twin',power:'73 PS',torque:'65.2 Nm',weight:'185 kg',seat:'795 mm',topSpeed:'200 km/h',fuelCap:'13.5 L',deposit:8000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'100% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787488289050.jpg',imgFile:'ducati-scrambler-800.jpg',dna:{comfort:88,adventure:90,city:88,beginner:60,longRide:95,mileage:72,bestFor:'Italian Luxury Desmodromic Performance'},stars:{comfort:'⭐⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐⭐',beginner:'⭐⭐',mileage:'⭐⭐⭐'}},
    {id:'r15v4',name:'Yamaha YZF R15 V4 Racing Blue',brand:'Yamaha',type:'Sport',price:1199,rating:'4.8',engine:'155 cc VVA',power:'18.4 PS',torque:'14.2 Nm',weight:'142 kg',seat:'815 mm',topSpeed:'140 km/h',fuelCap:'11 L',deposit:3000,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'96% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787487756833.jpg',imgFile:'yamaha-r15-v4.jpg',dna:{comfort:76,adventure:72,city:86,beginner:80,longRide:78,mileage:90,bestFor:'Track Ergonomics & Quickshifter Supersport'},stars:{comfort:'⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐⭐⭐',mileage:'⭐⭐⭐⭐⭐'}},
    {id:'daytona675r',name:'Triumph Daytona 675R',brand:'Triumph',type:'Sport',price:2299,rating:'4.9',engine:'675 cc Triple',power:'128 PS',torque:'72 Nm',weight:'184 kg',seat:'820 mm',topSpeed:'257 km/h',fuelCap:'17.4 L',deposit:7500,fuel:'Petrol',transmission:'Manual',available:true,aiMatch:'98% Match',webImg:'C:/Users/asus/.gemini/antigravity/brain/488515fc-ac14-42e9-b4ff-e0563c38a69c/.user_uploaded/media_1787486639857.jpg',imgFile:'triumph-daytona-675r.jpg',dna:{comfort:78,adventure:70,city:76,beginner:55,longRide:84,mileage:68,bestFor:'Track Days, Canyon Carving & Premium Supersport Riding'},stars:{comfort:'⭐⭐⭐⭐',mountain:'⭐⭐⭐⭐',beginner:'⭐⭐',mileage:'⭐⭐⭐'}}
  ];

  const FLEET_ITEMS_PER_PAGE = 9;
  let fleetCurrentPage = 1;
  let fleetResults = bikes;

  // Enriched Destinations Dataset (21 World-Famous Circuits)
  const destinations = [
    {id:'ladakh',cat:'mountain',name:'Leh Ladakh Pass',season:'May – Sep',elevation:'18,380 ft Peak',road:'78% Quality',weather:'14°C Crisp ☀️',difficulty:'Extreme',bike:'BMW G 310 GS / Himalayan 450',img:'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',desc:'High altitude passes, Khardung La summit & Pangong Tso lake.',photoSpot:'📸 Pangong Lake Point & Magnetic Hill'},
    {id:'kashmir',cat:'mountain',name:'Kashmir Gulmarg Valley',season:'Apr – Nov',elevation:'8,825 ft Valley',road:'84% Quality',weather:'12°C Alpine 🏔️',difficulty:'Moderate',bike:'Himalayan 450 / Speed 400',img:'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',desc:'Srinagar Dal Lake, Gulmarg pine slopes & Pahalgam river valleys.',photoSpot:'📸 Gulmarg Gondola Summit Pass'},
    {id:'spiti',cat:'mountain',name:'Spiti Cold Desert',season:'Jun – Oct',elevation:'14,930 ft Peak',road:'72% Quality',weather:'12°C Dry 🏔️',difficulty:'Hard',bike:'Himalayan 450',img:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',desc:'Rugged cold desert trails, Key Monastery & Chicham Bridge.',photoSpot:'📸 Chicham Highest Asian Bridge'},
    {id:'manali',cat:'mountain',name:'Atal Tunnel Alps',season:'Apr – Nov',elevation:'10,040 ft Tunnel',road:'92% Quality',weather:'16°C Alpine 🏔️',difficulty:'Moderate',bike:'BMW G 310 GS',img:'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',desc:'Solang Valley loops, Atal Tunnel South Portal & Lahaul valley.',photoSpot:'📸 Atal Tunnel South Portal'},
    {id:'sikkim',cat:'mountain',name:'Sikkim Silk Route',season:'Oct – Apr',elevation:'14,200 ft Pass',road:'82% Quality',weather:'13°C Misty 🌄',difficulty:'Hard',bike:'Triumph Scrambler 400X / Himalayan 450',img:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',desc:'32 Zuluk hairpin curves, Kupup Lake & Nathula Pass border.',photoSpot:'📸 Zuluk 32 Hairpin Loops Point'},
    {id:'zanskar',cat:'mountain',name:'Zanskar Glacier Pass',season:'Jun – Sep',elevation:'16,580 ft Glacier',road:'70% Quality',weather:'11°C Cold 🏔️',difficulty:'Extreme',bike:'KTM Adventure 390 / Himalayan 450',img:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',desc:'Shinku La glacier pass, Phugtal monastery & remote river crossings.',photoSpot:'📸 Gonbo Rangjon Holy Mountain Peak'},
    {id:'rishikesh',cat:'mountain',name:'Rishikesh Ganges Trail',season:'Sep – May',elevation:'1,120 ft River',road:'87% Quality',weather:'22°C Pleasant 🌿',difficulty:'Easy',bike:'Classic 350 / Scrambler 400X',img:'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',desc:'Holy Ganges riverbank twisties, Lakshman Jhula & Devprayag confluence.',photoSpot:'📸 Kunjapuri Temple Sunrise Summit'},
    {id:'goa',cat:'coastal',name:'Goa Sea Highway',season:'Oct – Mar',elevation:'120 ft Coastal',road:'95% Quality',weather:'28°C Sunny 🌴',difficulty:'Easy',bike:'Triumph Trident / Aerox',img:'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',desc:'Palm-fringed sea highways, cliffside sunsets & beach rides.',photoSpot:'📸 Vagator Cliffside Viewpoint'},
    {id:'konkan',cat:'coastal',name:'Konkan Marine Drive',season:'Nov – Mar',elevation:'210 ft Coast',road:'90% Quality',weather:'27°C Sea Breeze 🌊',difficulty:'Easy',bike:'Triumph Speed 400 / Continental GT',img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',desc:'Ratnagiri sea cliffs, Ganpatipule coastal curves & ferry crossings.',photoSpot:'📸 Arey Ware Coastal Ocean Drive'},
    {id:'pondicherry',cat:'coastal',name:'Pondicherry French Coast',season:'Oct – Mar',elevation:'15 ft Coastal',road:'93% Quality',weather:'29°C Sea Breeze 🌊',difficulty:'Easy',bike:'Continental GT 650 / Meteor 350',img:'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',desc:'French colony promenades, Rock Beach boulevard & Auroville trails.',photoSpot:'📸 Rock Beach Sea Promenade'},
    {id:'pamban',cat:'coastal',name:'Pamban Ocean Bridge',season:'Oct – Mar',elevation:'40 ft Sea Level',road:'94% Quality',weather:'29°C Tropical 🌊',difficulty:'Easy',bike:'Meteor 350 / Classic 350',img:'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',desc:'Ocean sea-bridge ride to Rameshwaram & Dhanushkodi ghost town.',photoSpot:'📸 Dhanushkodi End of India Tip'},
    {id:'jaisalmer',cat:'desert',name:'Jaisalmer Sand Dunes',season:'Nov – Feb',elevation:'740 ft Desert',road:'91% Quality',weather:'26°C Sunny 🏜️',difficulty:'Moderate',bike:'Classic 350 / Interceptor',img:'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80',desc:'Golden sand dune expressways, heritage forts & desert camps.',photoSpot:'📸 Sam Sand Dunes Sunset Point'},
    {id:'kutch',cat:'desert',name:'Rann of Kutch Salt Trail',season:'Nov – Feb',elevation:'30 ft Salt Bed',road:'95% Quality',weather:'30°C Sunny ☀️',difficulty:'Moderate',bike:'Super Meteor 650 / Meteor 350',img:'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',desc:'White salt desert highway, Road to Heaven & Dholavira Harappan site.',photoSpot:'📸 Road to Heaven Kutch Salt Highway'},
    {id:'jaipur',cat:'desert',name:'Jaipur Pink City & Forts',season:'Oct – Mar',elevation:'1,417 ft Royal',road:'92% Quality',weather:'28°C Pleasant 🏰',difficulty:'Easy',bike:'Classic 350 / Meteor 350',img:'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',desc:'Amer Fort climbs, Nahargarh sunset curves & Hawa Mahal corridors.',photoSpot:'📸 Nahargarh Fort City Viewpoint'},
    {id:'agra',cat:'desert',name:'Agra Yamuna Expressway',season:'Oct – Mar',elevation:'560 ft Plain',road:'96% Quality',weather:'25°C Sunny 🕌',difficulty:'Easy',bike:'Super Meteor 650 / GT 650',img:'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',desc:'Ultra smooth 6-lane Yamuna Expressway & Taj Mahal heritage trail.',photoSpot:'📸 Mehtab Bagh Taj Sunset Viewpoint'},
    {id:'hampi',cat:'desert',name:'Hampi Boulder Trail',season:'Oct – Mar',elevation:'1,450 ft Valley',road:'88% Quality',weather:'28°C Dry 🏛️',difficulty:'Easy',bike:'Scrambler 400X / CB350RS',img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',desc:'Surreal boulder landscapes, Tungabhadra riverbanks & Vijayanagara ruins.',photoSpot:'📸 Anjanadri Hill Sunset Point'},
    {id:'coorg',cat:'forest',name:'Coorg Coffee Trail',season:'Year-Round',elevation:'3,800 ft Hills',road:'88% Quality',weather:'22°C Misty 🌿',difficulty:'Easy',bike:'Meteor 350 / CB350RS',img:'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',desc:'Winding coffee plantation twisties, waterfalls & misty peaks.',photoSpot:'📸 Raja Seat Sunset Summit'},
    {id:'wayanad',cat:'forest',name:'Wayanad Bamboo Ghats',season:'Oct – May',elevation:'2,400 ft Hills',road:'91% Quality',weather:'23°C Pleasant 🍃',difficulty:'Easy',bike:'Speed 400 / Duke 390',img:'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',desc:'Thamarassery 9 hairpin ghat pass, dense wildlife sanctuary loops & lakes.',photoSpot:'📸 Thamarassery Lakkidi Viewpoint'},
    {id:'ooty',cat:'forest',name:'Ooty Nilgiri Pines',season:'Year-Round',elevation:'7,350 ft Hills',road:'89% Quality',weather:'16°C Crisp 🌲',difficulty:'Moderate',bike:'Himalayan 450 / Classic 350',img:'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',desc:'36 hairpin ghat bends, pine forest reserve & tea plantation loops.',photoSpot:'📸 Doddabetta Highest Nilgiri Peak'},
    {id:'meghalaya',cat:'forest',name:'Meghalaya Waterfall Trail',season:'Sep – May',elevation:'4,900 ft Cloudbed',road:'85% Quality',weather:'18°C Misty 🌧️',difficulty:'Moderate',bike:'Himalayan 450 / BMW G 310 GS',img:'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',desc:'Living Root Bridges, Cherrapunji canyon gorges & Dawki crystal river.',photoSpot:'📸 Dawki Umngot Glass River Viewpoint'},
    {id:'munnar',cat:'forest',name:'Munnar Tea Slopes',season:'Sep – May',elevation:'5,200 ft Hills',road:'89% Quality',weather:'20°C Pleasant 🌴',difficulty:'Moderate',bike:'Harley X440 / Interceptor',img:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',desc:'Tea garden hairpins, cloud-bed roads & western ghats.',photoSpot:'📸 Top Station Peak Cloudbed'}
  ];

  const getBike = (id) => bikes.find((bike) => bike.id === id) || bikes[0];
  const getWishlistKey = () => {
    const user = getAuthUser();
    return user ? `rideos-wishlist-${user.email.toLowerCase()}` : 'rideos-wishlist';
  };
  const getComparisonsKey = () => {
    const user = getAuthUser();
    return user ? `rideos-comparisons-${user.email.toLowerCase()}` : 'rideos-comparisons';
  };
  const wishes = () => {
    try {
      return JSON.parse(localStorage.getItem(getWishlistKey()) || '[]');
    } catch (e) {
      return [];
    }
  };
  const saveWishes = (w) => {
    localStorage.setItem(getWishlistKey(), JSON.stringify(w));
  };
  const comparisons = () => {
    try {
      return JSON.parse(localStorage.getItem(getComparisonsKey()) || '[]');
    } catch (e) {
      return [];
    }
  };
  const saveComparisons = (c) => {
    localStorage.setItem(getComparisonsKey(), JSON.stringify(c));
  };
  const migrateGuestData = (user) => {
    try {
      const guestWishes = JSON.parse(localStorage.getItem('rideos-wishlist') || '[]');
      if (guestWishes.length > 0) {
        const userWishesKey = `rideos-wishlist-${user.email.toLowerCase()}`;
        const userWishes = JSON.parse(localStorage.getItem(userWishesKey) || '[]');
        if (userWishes.length === 0) {
          localStorage.setItem(userWishesKey, JSON.stringify(guestWishes));
        }
      }
      const guestComps = JSON.parse(localStorage.getItem('rideos-comparisons') || '[]');
      if (guestComps.length > 0) {
        const userCompsKey = `rideos-comparisons-${user.email.toLowerCase()}`;
        const userComps = JSON.parse(localStorage.getItem(userCompsKey) || '[]');
        if (userComps.length === 0) {
          localStorage.setItem(userCompsKey, JSON.stringify(guestComps));
        }
      }
    } catch (e) {
      console.error('Migration error:', e);
    }
  };
  const bikeHref = (id) => link('bike-details') + '?bike=' + id;
  const bookHref = (id) => link('booking') + '?bike=' + id;
  const bikeImg = (bike) => {
    if (!bike) return getAsset('ryvon-superbike.png');
    if (bike.webImg) return bike.webImg;
    if (bike.imgFile) return getAsset(bike.imgFile);
    return getAsset('ryvon-superbike.png');
  };

  const logoSVG = `<img class="brand-logo" src="${getAsset('ryvon-logo.png')}" alt="RYVON logo">`;

  const header = () => {
    const user = getAuthUser();
    return `<div class="container nav">
    <a class="brand" href="${link('home')}">${logoSVG}<span class="brand-text">${currentBrand}</span></a>
    <ul class="nav-links" id="mobile-navigation">
      <li class="mobile-drawer-header" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--line)">
          <span class="brand">${logoSVG} <strong>${currentBrand}</strong></span>
          <button class="icon-btn mobile-close-btn" type="button" aria-label="Close menu">✕</button>
        </div>
      </li>
      <li><a class="${page==='home'?'active':''}" href="${link('home')}">Home</a></li>
      <li><a class="${['bikes','details'].includes(page)?'active':''}" href="${link('bikes')}">Explore Fleet</a></li>
      <li><a class="${page==='destinations'?'active':''}" href="${link('destinations')}">Destinations</a></li>
      <li><a href="#" data-action="build-my-ride">Build My Ride 🗺️</a></li>
      <li><a class="${page==='about'?'active':''}" href="${link('about')}">Brand Story</a></li>
      <li><a class="${page==='faq'?'active':''}" href="${link('faq')}">FAQs</a></li>
      <li><a class="${page==='contact'?'active':''}" href="${link('contact')}">Contact</a></li>
      <li class="mobile-drawer-controls" style="display:none">
        <div class="mobile-controls-wrap" style="display:grid;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">

          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;font-weight:700;color:var(--ink-soft)">Currency</span>
            <select class="currency-picker-mobile filter-select" style="width:130px;min-height:34px" aria-label="Currency Selector Mobile">
              <option value="INR" ${currentCurrency==='INR'?'selected':''}>₹ INR</option>
              <option value="USD" ${currentCurrency==='USD'?'selected':''}>$ USD</option>
              <option value="EUR" ${currentCurrency==='EUR'?'selected':''}>€ EUR</option>
              <option value="GBP" ${currentCurrency==='GBP'?'selected':''}>£ GBP</option>
            </select>
          </div>
          ${user ? `<a class="btn btn-dark btn-sm" href="${link('profile')}" style="width:100%;margin-top:8px;text-align:center;justify-content:center">My Rider Profile</a>` : `<a class="btn btn-dark btn-sm" href="${link('login')}" style="width:100%;margin-top:8px;text-align:center;justify-content:center">Sign in to Member Circle</a>`}
        </div>
      </li>
    </ul>
    <div class="header-actions">
      <button class="btn btn-outline btn-sm desktop-only" data-action="quick-book">⚡ Quick Book</button>
      <button class="btn btn-outline btn-sm desktop-only" data-action="persona-picker">🧠 ${currentRiderPersona}</button>

      <div class="currency-selector desktop-only" title="Change Currency">
        <button class="currency-select-btn" type="button">
          <select id="currency-picker" aria-label="Currency Selector Desktop">
            <option value="INR" ${currentCurrency==='INR'?'selected':''}>₹ INR</option>
            <option value="USD" ${currentCurrency==='USD'?'selected':''}>$ USD</option>
            <option value="EUR" ${currentCurrency==='EUR'?'selected':''}>€ EUR</option>
            <option value="GBP" ${currentCurrency==='GBP'?'selected':''}>£ GBP</option>
          </select>
        </button>
      </div>
      <button class="icon-btn cmdk-open-btn" type="button" data-action="cmdk" aria-label="Quick search (Ctrl+K)">⌕</button>
      <a class="icon-btn" href="${link('wishlist')}" aria-label="Wishlist">♡</a>
      <button class="theme-toggle" type="button" aria-label="Toggle dark/light mode">${currentTheme==='dark'?'☀️':'☾'}</button>
      ${user ? `
        <div class="user-profile-menu-container" style="position: relative; display: inline-flex; align-items: center;">
          <button class="user-avatar-btn" type="button" aria-expanded="false" aria-label="Open user menu">
            ${userAvatar(user)}
            <span class="avatar-arrow">⌄</span>
          </button>
          <div class="user-dropdown-menu" aria-hidden="true">
            <div class="user-dropdown-header">
              ${userAvatar(user, 'dropdown-avatar-img')}
              <div class="user-dropdown-info">
                <span class="user-dropdown-name">${displayName(user)}</span>
                <span class="user-dropdown-email">${escapeHTML(user.email)}</span>
              </div>
            </div>
            <div class="user-dropdown-divider"></div>
            <ul class="user-dropdown-links">
              <li><a href="${link('profile')}">👤 My Profile</a></li>
              <li><a href="${link('booking-history')}">🗺️ My Bookings</a></li>
              <li><a href="${link('profile')}">⚙️ Account Settings</a></li>
              <div class="user-dropdown-divider"></div>
              <li><a href="#" class="logout-link">🚪 Sign Out</a></li>
            </ul>
          </div>
        </div>
      ` : `<a class="btn btn-dark btn-sm desktop-only" href="${link('login')}">Sign in</a>`}
      <button class="icon-btn menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-navigation">☰</button>
    </div>
  </div>`;
  };

  const footer = () => `<div class="container"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="${link('home')}">${logoSVG}<span class="brand-text">${currentBrand}</span></a><p>The world’s most intelligent motorcycle rental platform. Designed for pure freedom on the open road.</p><div class="socials"><a class="social" href="#">ig</a><a class="social" href="#">𝕏</a><a class="social" href="#">yt</a></div></div><div class="footer-col"><h3>Fleet & Routes</h3><a href="${link('bikes')}">All Motorcycles</a><a href="${link('destinations')}">Expedition Zones</a><a href="#" data-action="build-my-ride">Build My Ride 🗺️</a><a href="${link('wishlist')}">Saved Shortlist</a></div><div class="footer-col"><h3>${currentBrand} Intelligence</h3><a href="${link('about')}">Brand Story</a><a href="${link('faq')}">FAQs & Safety</a><a href="${link('contact')}">Ride Command Hub</a><a href="#" data-action="ai-assistant">AI Ride Planner</a></div><div class="footer-col"><h3>Members Circle</h3><a href="${link('dashboard')}">Telemetry Dashboard</a><a href="${link('booking-history')}">Journey Logs</a><a href="${link('profile')}">Rider Profile</a><a href="${link('login')}">Member Sign in</a></div></div><div class="footer-bottom"><span>© 2026 ${currentBrand} Technologies. Engineered for the scenic detour.</span><span>Privacy Policy · Terms of Service · Safety Charter</span></div></div>`;

  function bikesPage() {
    const rideStyles = ['Sport','Cruiser','Adventure','Roadster','Scooter'];
    const brandList = ['All Brands','Honda','TVS','Suzuki','Yamaha','Vespa','Royal Enfield','Triumph','BMW','KTM','Kawasaki','Harley-Davidson','Ducati'];

    return `<section class="page-hero"><div class="container"><nav class="breadcrumbs"><a href="${link('home')}">Home</a><span>/</span><span>Fleet Catalog</span></nav>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px">
        <div>
          <h1>Explore our <span class="serif">curated fleet.</span></h1>
          <p>Filter by engine displacement, terrain style, rating, and real-time availability.</p>
        </div>
        <span class="badge" style="background:var(--lime);color:#070a0f">${bikes.length} VEHICLES AVAILABLE · 100% INSPECTED</span>
      </div>
    </div></section>

    <section class="section-tight"><div class="container">
      ${renderNaturalLanguageSearchBar()}
      
      <div style="margin-bottom:16px">
        <div class="brand-filter-bar">
          ${brandList.map((b, idx) => `<button class="brand-filter-chip ${idx===0?'active':''}" data-brand-filter="${b}" type="button">${b}</button>`).join('')}
        </div>
        <div class="riding-style-bar">
          <button class="riding-style-chip active" data-style-filter="all" type="button">⚡ All Styles</button>
          <button class="riding-style-chip" data-style-filter="scooter" type="button">🛵 Activas & Scooters</button>
          <button class="riding-style-chip" data-style-filter="mountain" type="button">🏔️ Mountain Offroad</button>
          <button class="riding-style-chip" data-style-filter="city" type="button">🏙️ City Commuter</button>
          <button class="riding-style-chip" data-style-filter="cruiser" type="button">🌊 Sunset Cruiser</button>
          <button class="riding-style-chip" data-style-filter="track" type="button">🔥 High Speed Track</button>
        </div>
      </div>

      <div class="catalog-layout"><aside class="filters card" id="filters"><div class="filter-head"><h3>Refine Fleet</h3><button class="clear" data-action="clear">Reset</button></div><div class="filter-group"><strong>Max Budget per day</strong><input id="price" class="price-range" type="range" min="500" max="3500" step="100" value="3500"><div class="range-row"><span>${money(500)}</span><span id="price-out">${money(3500)}</span></div></div><div class="filter-group"><strong>Category</strong>${rideStyles.map(x=>`<label class="check"><span>${x}</span><input class="filter-type" type="checkbox" value="${x}"></label>`).join('')}</div><div class="filter-group"><strong>Manufacturer</strong>${brandList.slice(1).map(x=>`<label class="check"><span>${x}</span><input class="filter-brand" type="checkbox" value="${x}"></label>`).join('')}</div><div class="filter-group"><strong>Transmission</strong><label class="check"><span>Manual</span><input class="filter-transmission" type="checkbox" value="Manual"></label><label class="check"><span>Automatic</span><input class="filter-transmission" type="checkbox" value="Automatic"></label></div><div class="filter-group"><strong>Rating Filter</strong><select class="filter-select" id="rating"><option value="0">Any rating</option><option value="4.8">4.8+ Top Rated</option><option value="4.9">4.9+ Perfection</option></select><label class="check availability-filter"><span>Available today</span><input id="available" type="checkbox"></label></div><button class="btn btn-primary sheet-apply" type="button" data-action="close-filters">Show Results</button></aside><div class="catalog-main"><div class="catalog-tools"><div><p id="result-count">Showing ${bikes.length} vehicles</p><button class="btn btn-outline btn-sm menu-filter" data-action="filters">Filter Options</button></div><div class="tool-controls"><input id="catalog-search" class="catalog-search" type="search" placeholder="Search Activa, RE, BMW..." aria-label="Search bikes"><select id="sort"><option value="popular">Most Popular</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="rating">Highest Rated</option></select><div class="view-switch"><button class="active" data-view="grid">▦</button><button data-view="list">☷</button></div></div></div><div class="catalog-grid" id="catalog">${bikes.slice(0, FLEET_ITEMS_PER_PAGE).map(bikeCard).join('')}</div><div id="fleet-pagination">${renderFleetPagination(Math.ceil(bikes.length / FLEET_ITEMS_PER_PAGE))}</div></div></div>
    </div></section>`;
  }

  function openExpeditionPreviewModal(destId) {
    const d = destinations.find(x => x.id === destId) || destinations[0];
    openModal(`<div class="modal" style="width:min(640px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <img src="${d.img}" width="80" height="60" style="object-fit:cover;border-radius:10px">
      <div>
        <span class="badge" style="background:var(--lime);color:#070a0f">${d.season}</span>
        <h2 style="margin:2px 0">${d.name}</h2>
        <span class="elevation-badge">🏔️ ${d.elevation}</span>
      </div>
    </div>

    <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:14px;margin:14px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><span>🌤️ Live Weather</span><strong style="display:block;font-size:13px">${d.weather}</strong></div>
      <div><span>🛣️ Road Quality</span><strong style="display:block;font-size:13px">${d.road}</strong></div>
      <div><span>⚠️ Route Difficulty</span><strong style="display:block;font-size:13px">${d.difficulty}</strong></div>
      <div><span>🏍️ Preferred Machine</span><strong style="display:block;font-size:13px">${d.bike}</strong></div>
    </div>

    <div class="waypoint-photo-spot">
      <span>${d.photoSpot}</span>
    </div>

    <div style="background:rgba(255,184,0,0.1);border-left:4px solid var(--lime-dark);padding:10px 14px;border-radius:0 10px 10px 0;font-size:12px;font-weight:700;margin:14px 0">
      💡 <strong>AI Trip Advisory:</strong> "${d.desc} High-altitude oxygen check recommended."
    </div>

    <a class="btn btn-primary" style="width:100%" href="${link('bikes')}?q=${encodeURIComponent(d.bike.split('/')[0].trim())}">Find Bikes for ${d.name} →</a>
    </div>`);
  }

  const DEST_CATEGORIES = ['mountain', 'coastal', 'desert', 'forest'];
  let currentDestCat = 'mountain';
  let currentDestSeason = 'all';

  const destCategoryMeta = {
    mountain: {
      name: 'Mountain & Himalayan',
      title: 'Explore Mountain Routes',
      subtitle: "High-altitude passes, dramatic valleys and some of India's most legendary motorcycle roads.",
      labelPlural: 'curated Himalayan riding destinations'
    },
    coastal: {
      name: 'Coastal & Beach',
      title: 'Explore Coastal Routes',
      subtitle: 'Open highways, sea cliffs, tropical roads and relaxed coastal riding.',
      labelPlural: 'curated coastal riding destinations'
    },
    desert: {
      name: 'Desert & Heritage',
      title: 'Explore Desert & Heritage Routes',
      subtitle: 'Historic cities, desert highways, forts and wide-open roads.',
      labelPlural: 'curated desert & heritage riding destinations'
    },
    forest: {
      name: 'Forest & Valleys',
      title: 'Explore Forest & Valley Routes',
      subtitle: 'Green mountain roads, waterfalls, tea estates and winding forest routes.',
      labelPlural: 'curated forest & valley riding destinations'
    }
  };

  function getCategoryCounts() {
    const counts = { mountain: 0, coastal: 0, desert: 0, forest: 0 };
    destinations.forEach(d => {
      if (counts[d.cat] !== undefined) counts[d.cat]++;
    });
    return counts;
  }

  function getFilteredDestinations() {
    return destinations.filter(d => d.cat === currentDestCat && matchesDestinationSeason(d, currentDestSeason));
  }

  function matchesDestinationSeason(d, seasonKey) {
    if (!seasonKey || seasonKey === 'all') return true;
    const s = (d.season || '').toLowerCase();
    if (s.includes('year-round') || s.includes('year round')) return true;
    if (seasonKey === 'year-round') return s.includes('year-round') || s.includes('year round');

    const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const targetMonths = {
      'jan-mar': [0, 1, 2],
      'apr-jun': [3, 4, 5],
      'jul-sep': [6, 7, 8],
      'oct-dec': [9, 10, 11]
    }[seasonKey];

    if (!targetMonths) return true;

    const parts = s.replace(/[^a-z\s–-]/g, '').split(/[–-]/).map(p => p.trim().slice(0, 3));
    if (parts.length >= 2 && monthMap[parts[0]] !== undefined && monthMap[parts[1]] !== undefined) {
      const start = monthMap[parts[0]];
      const end = monthMap[parts[1]];
      const activeMonths = [];
      if (start <= end) {
        for (let m = start; m <= end; m++) activeMonths.push(m);
      } else {
        for (let m = start; m <= 11; m++) activeMonths.push(m);
        for (let m = 0; m <= end; m++) activeMonths.push(m);
      }
      return targetMonths.some(m => activeMonths.includes(m));
    }
    return true;
  }

  function renderDestinationCard(d) {
    return `<div class="dest-card" id="${d.id}" data-cat="${d.cat}">
      <img src="${d.img}" alt="${d.name}" class="dest-card-bg" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'">
      <div class="dest-overlay"></div>
      <div class="dest-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span class="badge" style="font-size:9.5px;padding:2px 7px">${d.season}</span>
          <span class="elevation-badge" style="font-size:9.5px;padding:2px 7px">🏔️ ${d.elevation}</span>
        </div>
        <h2 class="dest-title">${d.name}</h2>
        <p class="dest-subtitle">${d.desc}</p>
        <div class="dest-tags" style="margin-bottom:5px">
          <span class="dest-tag">🌤️ ${d.weather}</span>
          <span class="dest-tag">🛣️ ${d.road}</span>
          <span class="dest-tag">⚠️ ${d.difficulty}</span>
        </div>
        <div class="waypoint-photo-spot" style="background:rgba(0,0,0,0.6);border-color:rgba(255,255,255,0.2);color:#fff;margin-bottom:8px;font-size:9.5px;padding:3px 7px">
          <span>${d.photoSpot}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="btn btn-outline btn-sm" style="color:#fff;border-color:rgba(255,255,255,0.35);padding:5px 8px;font-size:11px" type="button" data-action="expedition-preview" data-id="${d.id}">AI Details 💡</button>
          <a class="btn btn-primary btn-sm" style="padding:5px 8px;font-size:11px" href="${link('bikes')}?q=${encodeURIComponent(d.bike.split('/')[0].trim())}">Book Bike →</a>
        </div>
      </div>
    </div>`;
  }

  function destinationsPage() {
    const counts = getCategoryCounts();
    const meta = destCategoryMeta[currentDestCat] || destCategoryMeta.mountain;
    const filtered = getFilteredDestinations();
    const currentDestIndex = Math.max(0, DEST_CATEGORIES.indexOf(currentDestCat));

    return `<section class="dest-hero">
      <div class="dest-hero-overlay"></div>
      <div class="container dest-hero-container">
        <div class="dest-hero-content">
          <nav class="breadcrumbs dest-breadcrumbs"><a href="${link('home')}">Home</a><span>/</span><span style="color:var(--lime);font-weight:700">DESTINATIONS</span></nav>
          <h1 class="dest-hero-title">Famous Riding <br><span class="caps-serif" style="color:var(--lime)">Destinations.</span></h1>
          <p class="dest-hero-desc">Discover India's most memorable motorcycle routes — from Himalayan passes to coastal highways.</p>
        </div>
        <div class="dest-hero-badge-wrap">
          <span class="badge" style="background:var(--lime);color:#070a0f;font-weight:800;letter-spacing:0.04em;box-shadow:0 4px 16px rgba(255,184,0,0.3)">21 CURATED ROUTES AVAILABLE</span>
        </div>
      </div>
    </section>
    
    <section class="section dest-main-section"><div class="container">
      <div class="dest-filter-section">
        <!-- 4 Primary Category Tabs (Default: Mountain & Himalayan) -->
        <div class="dest-cat-bar">
          <button class="dest-cat-chip ${currentDestCat==='mountain'?'active':''}" data-dest-cat="mountain" type="button">🏔️ Mountain & Himalayan (${counts.mountain})</button>
          <button class="dest-cat-chip ${currentDestCat==='coastal'?'active':''}" data-dest-cat="coastal" type="button">🌊 Coastal & Beach (${counts.coastal})</button>
          <button class="dest-cat-chip ${currentDestCat==='desert'?'active':''}" data-dest-cat="desert" type="button">🏜️ Desert & Heritage (${counts.desert})</button>
          <button class="dest-cat-chip ${currentDestCat==='forest'?'active':''}" data-dest-cat="forest" type="button">🌲 Forest & Valleys (${counts.forest})</button>
        </div>

        <!-- Secondary Best Time to Ride Filter -->
        <div class="dest-season-wrap">
          <span class="dest-season-label">📅 Best Time to Ride:</span>
          <div class="dest-season-bar">
            <button class="dest-season-chip ${currentDestSeason==='all'?'active':''}" data-dest-season="all" type="button">All Seasons</button>
            <button class="dest-season-chip ${currentDestSeason==='jan-mar'?'active':''}" data-dest-season="jan-mar" type="button">Jan – Mar</button>
            <button class="dest-season-chip ${currentDestSeason==='apr-jun'?'active':''}" data-dest-season="apr-jun" type="button">Apr – Jun</button>
            <button class="dest-season-chip ${currentDestSeason==='jul-sep'?'active':''}" data-dest-season="jul-sep" type="button">Jul – Sep</button>
            <button class="dest-season-chip ${currentDestSeason==='oct-dec'?'active':''}" data-dest-season="oct-dec" type="button">Oct – Dec</button>
            <button class="dest-season-chip ${currentDestSeason==='year-round'?'active':''}" data-dest-season="year-round" type="button">Year-Round</button>
          </div>
        </div>
      </div>

      <!-- Dynamic Category Header & Introduction with Synchronized Page Navigation -->
      <div class="dest-section-header">
        <div class="dest-section-header-left">
          <h2 class="dest-section-title" id="dest-section-title">${meta.title}</h2>
          <p class="dest-section-desc" id="dest-section-desc">${meta.subtitle}</p>
        </div>
        <div class="dest-pagination-bar">
          <button class="dest-page-arrow" id="dest-page-prev" type="button" aria-label="Previous Category" ${currentDestIndex <= 0 ? 'disabled' : ''}>←</button>
          <div class="dest-page-numbers">
            <button class="dest-page-num ${currentDestCat==='mountain'?'active':''}" data-dest-page="1" type="button" aria-label="Page 1: Mountain & Himalayan">1</button>
            <button class="dest-page-num ${currentDestCat==='coastal'?'active':''}" data-dest-page="2" type="button" aria-label="Page 2: Coastal & Beach">2</button>
            <button class="dest-page-num ${currentDestCat==='desert'?'active':''}" data-dest-page="3" type="button" aria-label="Page 3: Desert & Heritage">3</button>
            <button class="dest-page-num ${currentDestCat==='forest'?'active':''}" data-dest-page="4" type="button" aria-label="Page 4: Forest & Valleys">4</button>
          </div>
          <button class="dest-page-arrow" id="dest-page-next" type="button" aria-label="Next Category" ${currentDestIndex >= 3 ? 'disabled' : ''}>→</button>
        </div>
      </div>

      <!-- 3-Column Responsive Destination Grid -->
      <div class="dest-grid-wrapper">
        <div class="dest-grid" id="dest-grid">
          ${filtered.length ? filtered.map(renderDestinationCard).join('') : `
            <div class="dest-empty-notice" style="grid-column:1/-1">
              <h3>No routes match this season in ${meta.name}.</h3>
              <p>Try selecting "All Seasons" to view all ${counts[currentDestCat]} routes in this category.</p>
            </div>
          `}
        </div>
      </div>

      <!-- Rider CTA Section -->
      <div class="dest-cta-section">
        <span class="eyebrow" style="color:var(--lime);margin:0 0 6px 0">🗺️ PERSONALIZED ROUTE PLANNING</span>
        <h2 style="font-family:var(--font-serif);margin:0 0 10px 0;font-size:clamp(24px,4vw,34px)">Not sure where to ride?</h2>
        <p class="muted" style="max-width:560px;margin:0 0 20px 0;font-size:14px;line-height:1.6">Tell us your riding style, terrain preference and trip goals. We'll help you choose a route and the right bike.</p>
        <button class="btn btn-primary" data-action="build-my-ride" type="button" style="padding:12px 28px;font-size:14px">Build My Ride →</button>
      </div>
    </div></section>`;
  }

  function renderTripCostSimulator(bike) {
    const defaultRate = bike ? bike.price : 1499;
    return `<div class="cost-simulator-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="eyebrow" style="margin:0">📊 TRIP COST SIMULATOR</span>
          <h3 style="margin:2px 0">Dynamic Trip Financial Estimator</h3>
        </div>
        <span class="badge ghost">Real-time Telemetry</span>
      </div>

      <div class="sim-controls-grid">
        <div>
          <label style="font-size:11px;font-weight:800">Trip Duration: <strong id="sim-days-val" style="color:var(--lime-dark)">3 Days</strong></label>
          <input type="range" id="sim-days-range" min="1" max="14" value="3" style="width:100%">
        </div>
        <div>
          <label style="font-size:11px;font-weight:800">Daily Rate: <strong id="sim-rate-val" style="color:var(--lime-dark)">${money(defaultRate)}/day</strong></label>
          <input type="range" id="sim-rate-range" min="500" max="3500" step="100" value="${defaultRate}" style="width:100%">
        </div>
      </div>

      <div class="sim-cost-breakdown">
        <div class="sim-cost-tile"><span>Rental</span><strong id="sim-rental">${money(defaultRate * 3)}</strong></div>
        <div class="sim-cost-tile"><span>Fuel</span><strong id="sim-fuel">${money(1520)}</strong></div>
        <div class="sim-cost-tile"><span>Tolls</span><strong id="sim-tolls">${money(400)}</strong></div>
        <div class="sim-cost-tile"><span>Food Estimate</span><strong id="sim-food">${money(1800)}</strong></div>
        <div class="sim-cost-tile"><span>Hotel Estimate</span><strong id="sim-hotel">${money(3200)}</strong></div>
        <div class="sim-cost-tile"><span>Activities</span><strong id="sim-activities">${money(1000)}</strong></div>
      </div>

      <div class="sim-total-box">
        <div>
          <span style="font-size:11px;color:#cbd5e1">TOTAL ESTIMATED TRIP COST</span>
          <strong style="display:block;font-size:11px;color:#cbd5e1">Includes Rental, Fuel, Tolls & Stay</strong>
        </div>
        <div class="sim-total-val" id="sim-total-cost">${money(defaultRate * 3 + 1520 + 400 + 1800 + 3200 + 1000)}</div>
      </div>
    </div>`;
  }

  function setupTripCostSimulatorListeners() {
    const daysSlider = document.querySelector('#sim-days-range');
    const rateSlider = document.querySelector('#sim-rate-range');
    if (!daysSlider || !rateSlider) return;

    const updateSim = () => {
      const days = Number(daysSlider.value);
      const rate = Number(rateSlider.value);

      document.querySelector('#sim-days-val').textContent = `${days} Day${days===1?'':'s'}`;
      document.querySelector('#sim-rate-val').textContent = `${money(rate)}/day`;

      const rental = days * rate;
      const fuel = Math.round(days * 500);
      const tolls = Math.round(days * 130);
      const food = Math.round(days * 600);
      const hotel = Math.round(days * 1050);
      const activities = Math.round(days * 330);
      const total = rental + fuel + tolls + food + hotel + activities;

      document.querySelector('#sim-rental').textContent = money(rental);
      document.querySelector('#sim-fuel').textContent = money(fuel);
      document.querySelector('#sim-tolls').textContent = money(tolls);
      document.querySelector('#sim-food').textContent = money(food);
      document.querySelector('#sim-hotel').textContent = money(hotel);
      document.querySelector('#sim-activities').textContent = money(activities);
      document.querySelector('#sim-total-cost').textContent = money(total);
    };

    daysSlider.addEventListener('input', updateSim);
    rateSlider.addEventListener('input', updateSim);
  }

  function renderEcoRideScore(bike) {
    const d = bike ? (bike.dna || {}) : {};
    const score = d.mileage || 84;
    const lSaved = ((100 - score) * 0.08).toFixed(1);

    return `<div class="eco-score-card">
      <div class="eco-score-header">
        <div>
          <span class="eyebrow" style="margin:0;color:#047857">🌱 ECO RIDE SCORE</span>
          <h3 style="margin:2px 0">Vehicle Efficiency Genome</h3>
        </div>
        <div class="eco-score-val">${score} / 100 🌱</div>
      </div>
      <p style="margin:0;font-size:12px;color:var(--ink)">
        "Choosing this vehicle could reduce estimated fuel consumption by ~<strong>${lSaved}L</strong> compared with higher displacement alternatives."
      </p>
      <small class="muted" style="display:block;margin-top:6px;font-size:10px">
        Calculated from fuel efficiency, vehicle kerb weight, trip distance profile, and estimated CO2 emissions.
      </small>
    </div>`;
  }

  function renderRoutePersonalitySelector() {
    return `<div class="route-personality-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="eyebrow" style="margin:0">🧭 ROUTE PERSONALITY</span>
          <h3 style="margin:2px 0">Choose Your Trip Style</h3>
        </div>
        <span class="badge ghost">Chandigarh → Manali</span>
      </div>

      <div class="route-personality-grid">
        <div class="route-personality-chip selected" data-route="Fastest">
          <strong>⚡ Fastest</strong>
          <span>5h 20m · Expressway</span>
        </div>
        <div class="route-personality-chip" data-route="Scenic">
          <strong>🏔️ Scenic</strong>
          <span>6h 40m · Mountain Pass</span>
        </div>
        <div class="route-personality-chip" data-route="Nature">
          <strong>🍃 Nature</strong>
          <span>7h 10m · Forest & River</span>
        </div>
        <div class="route-personality-chip" data-route="Foodie">
          <strong>☕ Foodie</strong>
          <span>8h · Dhaba Trail</span>
        </div>
      </div>
    </div>`;
  }

  function openWeekendEscapeModal() {
    const escapes = [
      { name: 'Kasauli Pine Trail', dist: '58 km', bike: 'Meteor 350', budget: 3200, weather: '21°C Pleasant 🌲', diff: 'Easy', time: '1h 45m', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
      { name: 'Shimla Ridge Circuit', dist: '112 km', bike: 'Classic 350', budget: 4800, weather: '18°C Alpine 🌄', diff: 'Moderate', time: '3h 10m', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tirthan Valley Escapes', dist: '240 km', bike: 'Himalayan 450', budget: 7500, weather: '15°C Crisp 🏔️', diff: 'Intermediate', time: '5h 30m', img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80' }
    ];

    openModal(`<div class="modal" style="width:min(780px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="eyebrow">🎯 "I HAVE A WEEKEND" AI ESCAPE GENERATOR</span>
    <h2 style="margin:4px 0">Starting from Chandigarh — 3 Curated Weekend Escapes</h2>
    
    <div class="weekend-escape-grid">
      ${escapes.map(e => `
        <div class="weekend-escape-card">
          <img src="${e.img}" style="width:100%;height:110px;object-fit:cover;border-radius:10px;margin-bottom:10px">
          <span class="badge" style="background:var(--lime);color:#070a0f">${e.diff}</span>
          <h3 style="margin:6px 0 2px">${e.name}</h3>
          <p style="font-size:11px;color:var(--ink-soft);margin-bottom:8px"><strong>${e.dist}</strong> · Est. ${e.time}</p>
          
          <div style="font-size:11px;line-height:1.6;margin-bottom:12px;background:var(--surface);padding:8px;border-radius:8px;border:1px solid var(--line)">
            <div>🏍️ Bike: <strong>${e.bike}</strong></div>
            <div>💰 Budget: <strong>${money(e.budget)}</strong></div>
            <div>🌤️ Weather: <strong>${e.weather}</strong></div>
          </div>

          <a class="btn btn-primary btn-sm" style="width:100%" href="${link('bikes')}?q=${encodeURIComponent(e.bike)}">Book This Escape →</a>
        </div>
      `).join('')}
    </div></div>`);
  }

  function openQuickBookModeModal() {
    const bike = bikes[0]; // Activa 6G
    openModal(`<div class="modal" style="width:min(540px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span class="badge" style="background:var(--lime);color:#070a0f">⚡ 1-CLICK QUICK BOOK MODE</span>
      <span style="font-size:11px;font-weight:800">RETURNING RIDER SHORTCUT</span>
    </div>
    <h2>Book Your Usual Ride</h2>
    
    <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:14px;margin:14px 0;display:flex;gap:12px;align-items:center">
      <img src="${bikeImg(bike)}" width="80" height="60" style="object-fit:cover;border-radius:8px">
      <div>
        <span class="badge ghost">${bike.type}</span>
        <h3 style="margin:2px 0">${bike.name}</h3>
        <span style="font-size:11px;color:var(--ink-soft)">Preferred Hub: <strong>Bengaluru City Hub</strong> · ${money(bike.price)}/day</span>
      </div>
    </div>

    <div style="background:rgba(255,184,0,0.1);border-left:4px solid var(--lime-dark);padding:10px 14px;border-radius:0 10px 10px 0;font-size:12px;font-weight:700;margin-bottom:16px">
      ⚡ Pre-filled from your previous booking: Dates <strong>19 Aug – 22 Aug</strong> · Payment via <strong>Saved UPI VPA</strong>.
    </div>

    <a class="btn btn-primary" style="width:100%" href="${bookHref(bike.id)}">1-Click Confirm Reservation (${money(bike.price * 3)}) →</a>
    </div>`);
  }

  function renderWhyThisBike(bike) {
    const d = bike.dna || { comfort: 92, adventure: 97, city: 82, beginner: 74, longRide: 95, mileage: 84 };
    const matchVal = bike.aiMatch || '94% Match';

    const reasons = [
      `Fits your ${money(1500)} daily budget`,
      bike.type === 'Scooter' ? 'Optimized for smooth city commute & underseat storage' : (bike.type === 'Adventure' ? 'Excellent for mountain roads & offroad passes' : 'Optimized for smooth highway cruising & city commute'),
      `High rider comfort score (${d.comfort}% ergonomics rating)`,
      'Strong braking stability & chassis control',
      'Suitable for multi-day rental touring'
    ];

    return `<div class="why-recommend-card">
      <div class="why-match-header">
        <div>
          <span class="eyebrow" style="margin:0">💡 AI "WHY THIS VEHICLE?"</span>
          <h3 style="margin:2px 0">Why We Recommend This</h3>
        </div>
        <div class="why-match-score">${matchVal}</div>
      </div>

      <div class="why-reason-list">
        ${reasons.map(r => `
          <div class="why-reason-item">
            <span class="why-reason-icon">✓</span>
            <span>${r}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function openWhyThisBikeModal(bike) {
    openModal(`<div class="modal" style="width:min(580px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <img src="${bikeImg(bike)}" width="70" height="50" style="object-fit:cover;border-radius:8px">
      <div>
        <span class="badge ghost">${bike.type}</span>
        <h2 style="margin:2px 0">${bike.name}</h2>
      </div>
    </div>
    ${renderWhyThisBike(bike)}
    <a class="btn btn-primary" style="width:100%;margin-top:14px" href="${bookHref(bike.id)}">Reserve ${bike.name} →</a>
    </div>`);
  }

  function parseNaturalLanguageQuery(queryStr) {
    const q = queryStr.toLowerCase();
    let priceCap = 3500;
    const priceMatch = q.match(/(?:under|below|max|budget|within)\s*(?:₹|\$)?\s*(\d[\d,]*)/i);
    if (priceMatch) {
      priceCap = Number(priceMatch[1].replace(/,/g, ''));
    }

    let isScooter = q.includes('activa') || q.includes('scooter') || q.includes('jupiter') || q.includes('burgman') || q.includes('vespa');
    let isComfortable = q.includes('comfortable') || q.includes('comfort');
    let isPowerful = q.includes('powerful') || q.includes('fast') || q.includes('speed');
    let isBeginner = q.includes('beginner') || q.includes('easy');
    let isLadakh = q.includes('ladakh') || q.includes('spiti') || q.includes('mountain') || q.includes('offroad');

    let filtered = bikes.filter(b => b.price <= priceCap);

    if (isScooter) {
      filtered = filtered.filter(b => b.type === 'Scooter');
    }
    if (isLadakh) {
      filtered = filtered.filter(b => b.type === 'Adventure' || (b.dna && b.dna.adventure >= 85));
    }
    if (isComfortable) {
      filtered = filtered.filter(b => b.dna && b.dna.comfort >= 85);
    }
    if (isPowerful) {
      filtered = filtered.filter(b => parseInt(b.power) >= 30);
    }
    if (isBeginner) {
      filtered = filtered.filter(b => b.dna && b.dna.beginner >= 80);
    }

    if (!filtered.length) filtered = bikes.slice(0, 4);

    let parsedSummary = [];
    if (priceCap < 3500) parsedSummary.push(`Budget ≤ ${money(priceCap)}`);
    if (isScooter) parsedSummary.push(`Category: Automatic Scooter / Activa`);
    if (isLadakh) parsedSummary.push(`Terrain: High Altitude / Mountain Pass`);
    if (isComfortable) parsedSummary.push(`Rider Genome: High Comfort (≥85%)`);
    if (isPowerful) parsedSummary.push(`Engine: High Output Power (≥30 PS)`);
    if (isBeginner) parsedSummary.push(`Rider Genome: Beginner Friendly (≥80%)`);
    if (!parsedSummary.length) parsedSummary.push(`Keyword Query: "${queryStr}"`);

    return { filtered, summary: parsedSummary.join(' · '), queryStr };
  }

  function renderNaturalLanguageSearchBar() {
    return `<div class="nl-search-container">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="eyebrow" style="margin:0">🗣️ NATURAL LANGUAGE AI SEARCH</span>
        <span class="badge" style="background:var(--lime);color:#070a0f">Neural Query Engine</span>
      </div>
      <div class="nl-search-input-wrap">
        <input class="nl-search-input" id="nl-search-input" placeholder="Type a request e.g. 'Find me an Activa for city commute under ₹700'...">
        <button class="btn btn-primary" id="nl-search-btn" type="button">Ask AI ✨</button>
      </div>

      <div class="nl-prompt-chips">
        <button class="nl-prompt-chip" data-nl="Find me an Activa for city commute under ₹700." type="button">"Find me an Activa for city commute under ₹700."</button>
        <button class="nl-prompt-chip" data-nl="I want a Royal Enfield for Ladakh mountain roads." type="button">"I want a Royal Enfield for Ladakh mountain roads."</button>
        <button class="nl-prompt-chip" data-nl="Show me BMW and Triumph motorcycles." type="button">"Show me BMW and Triumph motorcycles."</button>
      </div>

      <div id="ai-parsed-intent-box"></div>
    </div>`;
  }

  function openRiderProfilePersonaModal() {
    openModal(`<div class="modal" style="width:min(580px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="eyebrow">🧠 RIDER PROFILE INTELLIGENCE</span>
    <h2 style="margin:4px 0">What kind of rider are you?</h2>
    
    <div class="persona-grid">
      <div class="persona-chip ${currentRiderPersona==='City Explorer'?'selected':''}" data-persona="City Explorer">🏙️ City Explorer</div>
      <div class="persona-chip ${currentRiderPersona==='Mountain Rider'?'selected':''}" data-persona="Mountain Rider">🏔️ Mountain Rider</div>
      <div class="persona-chip ${currentRiderPersona==='Coastal Cruiser'?'selected':''}" data-persona="Coastal Cruiser">🌊 Coastal Cruiser</div>
      <div class="persona-chip ${currentRiderPersona==='Performance Rider'?'selected':''}" data-persona="Performance Rider">🔥 Performance Rider</div>
      <div class="persona-chip ${currentRiderPersona==='Weekend Explorer'?'selected':''}" data-persona="Weekend Explorer">🌄 Weekend Explorer</div>
      <div class="persona-chip ${currentRiderPersona==='Long Distance Rider'?'selected':''}" data-persona="Long Distance Rider">🛣️ Long Distance Rider</div>
    </div></div>`);

    document.querySelectorAll('.persona-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentRiderPersona = chip.dataset.persona;
        localStorage.setItem('rideos-rider-persona', currentRiderPersona);
        toast(`Persona updated: ${currentRiderPersona}`);
        closeModal();
        render();
      });
    });
  }

  function openSOSEmergencyModal() {
    openModal(`<div class="modal" style="width:min(640px,94vw);border:2px solid var(--coral)"><button class="icon-btn modal-close" data-close>×</button>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span class="badge" style="background:var(--coral);color:#fff">🆘 SMART EMERGENCY DISPATCH</span>
      <span style="font-size:11px;font-weight:800;color:var(--coral)">LIVE GPS CONNECTED</span>
    </div>
    <h2 style="margin:4px 0">SOS Emergency Mode Active</h2>
    
    <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:14px;margin:14px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><span>📍 Live GPS Location</span><strong style="display:block;font-size:13px">32.2432° N, 77.1892° E</strong><small class="muted">Solang Valley Pass Highway</small></div>
      <div><span>🏥 Nearest Hospital</span><strong style="display:block;font-size:13px">Lady Willingdon Hospital</strong><small class="muted">2.4 km away (7 mins)</small></div>
      <div><span>🚓 Nearest Police Station</span><strong style="display:block;font-size:13px">Manali Police Station</strong><small class="muted">1.8 km away (5 mins)</small></div>
      <div><span>⛽ Nearest Fuel Station</span><strong style="display:block;font-size:13px">Indian Oil Kullu Bypass</strong><small class="muted">3.1 km away (9 mins)</small></div>
    </div>

    <div style="background:rgba(244,63,94,0.1);border-left:4px solid var(--coral);padding:12px;border-radius:0 10px 10px 0;margin-bottom:14px">
      <strong>📞 Emergency Hotline:</strong> <a href="tel:+911800743367" style="color:var(--coral);font-weight:800">+91 1800-RIDE-OS (+91 1800-7433-67)</a>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn btn-primary" type="button" onclick="alert('Trip location live tracking link copied to clipboard!')">🔗 Share Live Trip Location</button>
      <button class="btn btn-outline modal-close" data-close type="button">Cancel Emergency Signal</button>
    </div></div>`);
  }

  function openAvailabilityAlertModal(bike) {
    const alts = bikes.filter(b => b.available && b.id !== bike.id && (b.type === bike.type || b.brand === bike.brand)).slice(0, 2);
    openModal(`<div class="modal" style="width:min(580px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="eyebrow">🔔 SMART AVAILABILITY ALERTS</span>
    <h2 style="margin:4px 0">${bike.name} is Unavailable</h2>
    
    <div style="margin:16px 0;padding:14px;background:var(--paper);border-radius:14px;border:1px solid var(--line)">
      <strong>Get Notified When Available:</strong>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input placeholder="Enter mobile or email" class="filter-select" style="flex:1" value="vihan@example.com">
        <button class="btn btn-primary btn-sm" type="button" onclick="alert('Notification alert set! We will SMS you when ${bike.name} opens.')">Notify Me →</button>
      </div>
    </div>

    <h3 style="margin:14px 0 8px">Closest In-Stock Alternatives Recommended by AI</h3>
    <div style="display:grid;gap:8px">
      ${alts.map(a => `
        <div class="alternative-bike-tile">
          <img src="${bikeImg(a)}" width="60" height="45" style="object-fit:cover;border-radius:6px">
          <div style="flex:1">
            <strong>${a.name}</strong>
            <span style="display:block;font-size:11px;color:var(--ink-soft)">${a.type} · ${money(a.price)}/day</span>
          </div>
          <a class="btn btn-primary btn-sm" href="${bookHref(a.id)}">Book Alternative →</a>
        </div>
      `).join('')}
    </div></div>`);
  }

  function renderTripCommandCenter() {
    const user = getAuthUser();
    const safetyScore = user ? (user.safetyScore || 87) : 87;
    return `<div class="upcoming-ride-card card">
      <div class="upcoming-ride-main">
        <div class="upcoming-ride-info">
          <span class="badge" style="background: var(--lime); color: #070a0f;">🧭 UPCOMING RIDE</span>
          <h3 class="upcoming-bike-name">Himalayan 450 Summit</h3>
          <p class="upcoming-route">Chandigarh → Manali</p>
          <p class="upcoming-dates">📅 19 Aug — 22 Aug</p>
          
          <div class="upcoming-details-grid">
            <div class="upcoming-detail">
              <span>📍 Pickup Hub</span>
              <strong>Chandigarh</strong>
            </div>
            <div class="upcoming-detail">
              <span>🔑 Digital Key</span>
              <strong class="code-font">RDS-KEY-8812</strong>
            </div>
            <div class="upcoming-detail">
              <span>🛡️ Safety Score</span>
              <strong class="safety-score-good">${safetyScore} / 100</strong>
            </div>
          </div>
          
          <div class="upcoming-actions">
            <button class="btn btn-primary btn-sm" type="button" data-action="ai-assistant">View Journey</button>
            <button class="btn btn-outline btn-sm" type="button" data-action="quick-book">Manage Booking</button>
          </div>
        </div>
        
        <div class="upcoming-ride-media">
          <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80" alt="Himalayan 450" class="upcoming-bike-img">
          
          <div class="upcoming-countdown-container">
            <span class="countdown-label">RIDE STARTS IN</span>
            <div class="countdown-timer-value">Loading...</div>
          </div>
          
          <div class="upcoming-sos-container">
            <button class="sos-hold-btn" id="sos-btn" type="button">
              <span class="sos-progress-fill" id="sos-fill"></span>
              <span>🆘 Hold SOS (3s)</span>
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  function renderAIPackingAssistant() {
    const items = [
      { id: 'helmet', label: 'Certified ECE/ISI Helmet', done: true },
      { id: 'gloves', label: 'Leather Riding Gloves', done: true },
      { id: 'jacket', label: 'Waterproof Riding Jacket', done: true },
      { id: 'powerbank', label: '20,000mAh Power Bank', done: true },
      { id: 'firstaid', label: 'Emergency First-Aid Kit', done: true },
      { id: 'water', label: 'Insulated Water Bottle', done: true },
      { id: 'sunglasses', label: 'UV Protective Sunglasses', done: false },
      { id: 'thermal', label: 'Thermal Base Layer', done: false }
    ];
    const doneCount = items.filter(i => i.done).length;
    const progressPercent = (doneCount / items.length) * 100;
    return `<div class="packing-card card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <span class="eyebrow" style="margin:0">🎒 AI PACKING ASSISTANT</span>
          <h3 style="margin:4px 0 0; font-family: var(--font-serif);">Your Expedition Packing List</h3>
        </div>
        <span class="badge ghost" id="packing-count-badge">${doneCount} / ${items.length} Completed</span>
      </div>
      <div class="packing-progress-container" style="margin-top: 14px; margin-bottom: 14px;">
        <div class="packing-progress-bar-wrap">
          <div class="packing-progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
      <div class="packing-grid">
        ${items.map(item => `
          <div class="packing-check-item ${item.done ? 'done' : ''}" data-item="${item.id}">
            <div class="packing-check-left">
              <span class="packing-check-circle">${item.done ? '✓' : ''}</span>
              <span class="packing-item-text">${item.label}</span>
            </div>
            <span class="packing-status-badge ${item.done ? 'done' : 'pending'}">${item.done ? 'Done' : 'Pending'}</span>
          </div>
        `).join('')}
      </div>
      <div class="ai-recommend-box">
        <span>🏔️ Weather Alert:</span> "Mountain weather expected to drop below 10°C near Atal Tunnel. Add warm thermal clothing."
      </div>
    </div>`;
  }

  function renderSmartGarage() {
    const list = bikes.filter(x => wishes().includes(x.id));
    let garageContent = `
      <div class="garage-price-alert" style="margin-bottom: 20px;">
        <span>📉 <strong>AI Price Telemetry Alert:</strong> "Activa 6G & Himalayan 450 prices are currently ₹100 lower than your previous search."</span>
      </div>
      <div class="bike-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:20px; width: 100%;">
        ${list.length ? list.map(bikeCard).join('') : `
          <div class="card empty-state" style="grid-column:1/-1; text-align: center; padding: 40px 24px;">
            <h3 style="font-family:var(--font-serif)">Your Garage is currently empty</h3>
            <p class="muted" style="margin-bottom: 16px; font-size:13px">Click the heart icon (♡) on any motorcycle or scooter in the fleet to store it in your garage.</p>
            <a class="btn btn-primary" href="${link('bikes')}" style="display: inline-flex; width: auto; justify-content: center;">Explore Fleet Catalog</a>
          </div>
        `}
      </div>
    `;
    return dashboardWrap('wishlist', `
      <div class="garage-section" style="width: 100%;">
        <div style="margin-bottom:24px;">
          <h2 style="margin:0;font-family:var(--font-serif)">Your Garage ❤️</h2>
          <p class="muted" style="margin:4px 0 0;font-size:14px">Your curated shortlist of saved motorcycles & scooters with live price drop telemetry.</p>
        </div>
        ${garageContent}
      </div>
    `);
  }

  function openAICompareModal(a, b) {
    const sA = a.stars || { comfort:'⭐⭐⭐⭐⭐', mountain:'⭐⭐⭐⭐⭐', beginner:'⭐⭐⭐⭐', mileage:'⭐⭐⭐⭐' };
    const sB = b.stars || { comfort:'⭐⭐⭐⭐', mountain:'⭐⭐⭐⭐', beginner:'⭐⭐⭐', mileage:'⭐⭐⭐' };

    let verdictText = `For your trip, <strong>${a.name}</strong> is recommended because it offers better comfort and lower fuel consumption.`;
    if (a.id === 'himalayan' && b.id === 'duke') {
      verdictText = `For your Manali trip, <strong>Himalayan 450</strong> is recommended because it offers better long-distance comfort and higher ground clearance.`;
    }

    openModal(`<div class="modal" style="width:min(640px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="eyebrow">🆚 AI DECISION INTELLIGENCE</span>
    <h2 style="margin:4px 0">${a.name} vs ${b.name}</h2>
    
    <div class="ai-verdict-banner">
      <span>💡 <strong>AI Verdict:</strong> ${verdictText}</span>
    </div>

    <table class="star-matrix-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th style="width:38%">${a.name}</th>
          <th style="width:38%">${b.name}</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Comfort</td><td class="star-stars">${sA.comfort}</td><td class="star-stars">${sB.comfort}</td></tr>
        <tr><td>Mountain</td><td class="star-stars">${sA.mountain}</td><td class="star-stars">${sB.mountain}</td></tr>
        <tr><td>Beginner</td><td class="star-stars">${sA.beginner}</td><td class="star-stars">${sB.beginner}</td></tr>
        <tr><td>Mileage</td><td class="star-stars">${sA.mileage}</td><td class="star-stars">${sB.mileage}</td></tr>
        <tr><td>Daily Price</td><td><strong>${money(a.price)}</strong></td><td><strong>${money(b.price)}</strong></td></tr>
      </tbody>
    </table>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px">
      <a class="btn btn-primary btn-sm" href="${bookHref(a.id)}">Reserve ${a.name} →</a>
      <a class="btn btn-outline btn-sm" href="${bookHref(b.id)}">Reserve ${b.name} →</a>
    </div></div>`);
  }

  function openVerifiedInfoModal(bikeName = 'Vehicle') {
    openModal(`<div class="modal" style="width:min(540px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="badge" style="background:rgba(16,185,129,0.18);color:#047857;margin-bottom:4px">🔐 RIDE OS TRUST CHARTER</span>
    <h2>Why is this vehicle verified?</h2>
    
    <div class="verified-check-list">
      <div class="verified-check-item"><span class="verified-check-icon">✓</span><div class="verified-check-info"><strong>Identity verified</strong><span>Owner identity & papers authenticated.</span></div></div>
      <div class="verified-check-item"><span class="verified-check-icon">✓</span><div class="verified-check-info"><strong>Vehicle documents verified</strong><span>Zero-dep insurance & RC active.</span></div></div>
      <div class="verified-check-item"><span class="verified-check-icon">✓</span><div class="verified-check-info"><strong>Condition checked</strong><span>32-point diagnostics verified.</span></div></div>
      <div class="verified-check-item"><span class="verified-check-icon">✓</span><div class="verified-check-info"><strong>Recent inspection</strong><span>Test-driven within 48 hours.</span></div></div>
    </div>

    <button class="btn btn-primary modal-close" data-close style="width:100%;margin-top:16px">Got it, Thanks! →</button></div>`);
  }

  function openARPreviewModal(bikeId) {
    const b = getBike(bikeId), imgSrc = bikeImg(b);
    openModal(`<div class="modal" style="width:min(680px,94vw)"><button class="icon-btn modal-close" data-close>×</button>
    <span class="eyebrow">🔍 WebAR Spatial Intelligence</span>
    <h2 style="margin:4px 0">See ${b.name} in AR</h2>
    <div class="ar-preview-shell" id="ar-shell">
      <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80" class="ar-camera-bg" alt="Camera Feed Simulation">
      <div class="ar-grid-overlay"></div>
      <img src="${imgSrc}" class="ar-bike-model" id="ar-model" alt="${b.name}">
      <div class="ar-controls-bar">
        <button class="btn btn-sm btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3)" id="ar-zoom-in" type="button">🔍 Zoom +</button>
        <button class="btn btn-sm btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3)" id="ar-zoom-out" type="button">🔍 Zoom -</button>
        <button class="btn btn-sm btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3)" id="ar-rotate-btn" type="button">🔄 Flip View</button>
      </div>
    </div></div>`);

    let scale = 1, flip = false; const model = document.querySelector('#ar-model');
    document.querySelector('#ar-zoom-in')?.addEventListener('click', () => { scale = Math.min(scale + 0.15, 1.6); if (model) model.style.transform = `scale(${scale}) ${flip?'scaleX(-1)':''}`; });
    document.querySelector('#ar-zoom-out')?.addEventListener('click', () => { scale = Math.max(scale - 0.15, 0.6); if (model) model.style.transform = `scale(${scale}) ${flip?'scaleX(-1)':''}`; });
    document.querySelector('#ar-rotate-btn')?.addEventListener('click', () => { flip = !flip; if (model) model.style.transform = `scale(${scale}) ${flip?'scaleX(-1)':''}`; });
  }

  function renderBikeDNA(bike) {
    const d = bike.dna || { comfort: 92, adventure: 97, city: 82, beginner: 74, longRide: 95, mileage: 84, bestFor: 'Mountain + Long Distance' };
    return `<div class="bike-dna-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span class="eyebrow" style="margin:0">🧬 VEHICLE DNA TELEMETRY</span>
        <span class="badge ghost">Rider Performance Genome</span>
      </div>
      <h3 style="margin:2px 0 10px">Vehicle Capability Profile</h3>
      
      <div class="dna-grid">
        <div class="dna-bar-item"><div class="dna-bar-head"><span>Comfort</span><strong>${d.comfort}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.comfort}%"></div></div></div>
        <div class="dna-bar-item"><div class="dna-bar-head"><span>Adventure</span><strong>${d.adventure}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.adventure}%"></div></div></div>
        <div class="dna-bar-item"><div class="dna-bar-head"><span>City Maneuverability</span><strong>${d.city}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.city}%"></div></div></div>
        <div class="dna-bar-item"><div class="dna-bar-head"><span>Beginner Friendly</span><strong>${d.beginner}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.beginner}%"></div></div></div>
        <div class="dna-bar-item"><div class="dna-bar-head"><span>Long Ride Endurance</span><strong>${d.longRide}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.longRide}%"></div></div></div>
        <div class="dna-bar-item"><div class="dna-bar-head"><span>Mileage Efficiency</span><strong>${d.mileage}%</strong></div><div class="dna-bar-track"><div class="dna-bar-fill" style="width:${d.mileage}%"></div></div></div>
      </div>

      <div class="dna-best-for-box">
        <span>🏆 Best for:</span>
        <span><strong>${d.bestFor}</strong></span>
      </div>
    </div>`;
  }

  function bikeCard(bike, i=0) {
    const saved = wishes().includes(bike.id);
    const compared = comparisons().includes(bike.id);
    const availability = bike.available ? '<span class="availability available">Live Pickup</span>' : `<button class="btn btn-outline btn-sm" style="padding:2px 6px;font-size:9px;min-height:22px" data-action="avail-alert" data-id="${bike.id}">Notify Me</button>`;
    const imgSrc = bikeImg(bike);
    return `<article class="bike-card card reveal delay-${i%3}" data-bike="${bike.id}"><div class="bike-photo"><a href="${bikeHref(bike.id)}"><img loading="lazy" src="${imgSrc}" alt="${bike.name}"></a><button class="icon-btn heart ${saved?'active':''}" type="button" data-action="wish" data-id="${bike.id}">${saved?'♥':'♡'}</button></div><div class="bike-info"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span class="badge ghost">${bike.type}</span>${availability}</div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span class="ai-badge" data-action="why-this-bike" data-id="${bike.id}">✦ ${bike.aiMatch}</span><span class="verified-ride-badge" data-action="verified-info" data-name="${bike.name}">✓ VERIFIED RIDE</span></div><h3><a href="${bikeHref(bike.id)}">${bike.name}</a></h3><div class="specs-pills"><span class="spec-pill">${bike.engine}</span><span class="spec-pill">${bike.power}</span><span class="spec-pill">${bike.transmission}</span></div><div class="bike-meta"><span>★ ${bike.rating} · Verified Proof</span><span>Deposit: ${money(bike.deposit)}</span></div><div class="bike-price"><span><strong>${money(bike.price)}</strong> <small>/ day</small></span><span class="bike-actions"><button class="btn btn-outline btn-sm" data-action="quick" data-id="${bike.id}">Specs</button><button class="btn btn-outline btn-sm ${compared?'active':''}" data-action="compare" data-id="${bike.id}">${compared?'Added':'VS'}</button></span></div></div></article>`;
  }

  const faqData = [
    ['What documents are needed to reserve a motorcycle or Activa?','Bring a valid Indian or International driving licence, one photo ID (Aadhaar or Passport) and your security deposit card.'],
    ['How does the AI Ride Assistant help plan trips?','Our AI Ride Assistant analyzes terrain difficulty, real-time weather forecasts, altitude challenges, and fuel stops to match you with the safest vehicle for your journey.'],
    ['Is rider helmet and insurance included?','Yes. Every booking includes an ISI/ECE certified helmet and full comprehensive damage protection.'],
    ['Can I request delivery or pickup at my hotel/airport?','Yes, doorstep delivery to hotel or airport hub is available in Bengaluru, Goa, Jaipur, Manali, and Kochi.'],
    ['What is the refund policy on security deposits?','Security deposits are pre-authorized digitally and automatically released within 24 hours of successful vehicle return check.']
  ];

  const faqMarkup = ([q,a], i=0) => `<article class="faq-item" id="faq-item-${i}"><button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-ans-${i}"><span class="faq-q-text">${q}</span><span class="faq-icon-wrap" aria-hidden="true"><span class="faq-icon-symbol">+</span></span></button><div class="faq-answer" id="faq-ans-${i}" role="region" aria-labelledby="faq-item-${i}"><div class="faq-answer-inner"><p>${a}</p></div></div></article>`;

  function home() {
    const recName = currentRiderPersona==='City Explorer'?'Honda Activa 6G':currentRiderPersona==='Coastal Cruiser'?'Meteor 350':currentRiderPersona==='Performance Rider'?'KTM Duke 390':'Himalayan 450';
    return `<section class="hero"><div class="container"><div class="hero-content reveal">
      <h1>Where Peak<br><span class="caps-serif">ALTITUDE MEETS</span><br><span class="serif-gold-underline">Pure Freedom.</span></h1>
      <p class="hero-copy">Recommended for your persona: <strong>${recName}</strong>. 33+ Superbikes, Activas & Adventure Tourers, AI route intelligence, 32-point inspection, and instant keyless pickup.</p>
      
      <div class="quick-trip-chips">
        <button class="trip-chip" data-action="weekend-escape" type="button">🎯 I Have a Weekend</button>
        <button class="trip-chip" data-city="Bengaluru" data-type="Scooter" type="button">🛵 Activa City Commute</button>
        <button class="trip-chip" data-city="Leh" data-type="Adventure" type="button">🏔️ Leh Ladakh</button>
        <button class="trip-chip" data-city="Goa" data-type="Roadster" type="button">🌴 Goa Coast</button>
        <button class="trip-chip" data-action="build-my-ride" type="button">🗺️ Build My Ride AI</button>
      </div>

      <div class="hero-stats"><div><strong>4.98/5</strong><span>Rider Score</span></div><div><strong>50,000+</strong><span>Escapes Logged</span></div><div><strong>100%</strong><span>32-Point Check</span></div></div>
    </div>
    <div class="search-shell glass reveal delay-1">
      <form class="search-form" id="search-form">
        <div class="field"><label>Pickup City <span class="badge-micro">Live</span></label><select id="city"><option value="Bengaluru">Bengaluru</option><option value="Goa">Goa Coast</option><option value="Manali">Manali & Alps</option><option value="Leh">Leh Ladakh</option><option value="Jaipur">Jaipur Desert</option><option value="Kochi">Kochi Backwaters</option></select></div>
        <div class="field"><label>Pickup Date</label><input id="start" type="date" min="${today}" value="${today}" required></div>
        <div class="field"><label>Return Date</label><input id="end" type="date" min="${today}" required></div>
        <div class="field"><label>Category</label><select id="category"><option value="all">All Styles</option><option value="Scooter">Scooter / Activa</option><option value="Adventure">Adventure</option><option value="Roadster">Roadster</option><option value="Cruiser">Cruiser</option><option value="Sport">Sport</option></select></div>
        <div class="field"><label>Transmission</label><select id="trans"><option value="any">Any Gear</option><option value="Automatic">Automatic (Activa)</option><option value="Manual">Manual</option></select></div>
        <div class="search-actions">
          <button class="btn btn-search" type="submit">Search Fleet →</button>
          <button class="btn-voice" type="button" id="voice-search-btn" title="Voice Search">🎙️</button>
        </div>
      </form>
      <div class="booking-bar-meta">
        <span class="meta-item"><span class="weather-pill" id="city-weather-pill">☀️ Manali: 16°C · Great Road Quality</span></span>
        <span class="meta-item">🛡️ Free Certified Helmet Included</span>
        <span class="meta-item">⚡ Instant Keyless Lock Pickups</span>
        <span class="meta-item">Est. Rental: <strong class="est-price" id="est-rental-val">${money(599)}</strong> / day</span>
      </div>
    </div>
    </div></section>

    <!-- Curated Fleet Showcase -->
    <section class="section"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">Curated Luxury Fleet</span><h2>Choose your machine for the <span class="serif">road ahead.</span></h2></div><a class="view-link" href="${link('bikes')}">Explore All (${bikes.length})</a></div><div class="bike-grid">${bikes.slice(0,4).map(bikeCard).join('')}</div></div></section>

    <!-- Expedition Zones -->
    <section class="section" style="background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">Expedition Zones</span><h2>Curated routes. <span class="serif">Unmatched vistas.</span></h2></div><a class="view-link" href="${link('destinations')}">View All Expeditions (${destinations.length})</a></div><div class="destination-grid">${destinations.slice(0,3).map(d => `<a href="${link('destinations')}#${d.id}" class="dest-card"><img src="${d.img}" alt="${d.name}" class="dest-card-bg"><div class="dest-overlay"></div><div class="dest-content"><h3 class="dest-title">${d.name}</h3><div class="dest-subtitle">${d.desc}</div><div class="dest-tags"><span class="dest-tag">${d.season}</span><span class="dest-tag">${d.weather}</span><span class="dest-tag">Difficulty: ${d.difficulty}</span></div></div></a>`).join('')}</div></div></section>`;
  }

  function renderPerformanceChart(bike) {
    return `<div class="perf-graph-container"><div class="perf-graph-header"><h4>Engine Telemetry (Power & Torque Curve)</h4><div class="perf-legend"><span class="legend-power">Power (${bike.power})</span><span class="legend-torque">Torque (${bike.torque})</span></div></div><svg class="perf-svg" viewBox="0 0 400 140"><path d="M 30 110 Q 100 80, 200 40 T 370 20" fill="none" stroke="var(--lime)" stroke-width="3"/><path d="M 30 100 Q 120 40, 240 50 T 370 70" fill="none" stroke="var(--cyber)" stroke-width="3"/><line x1="30" y1="120" x2="370" y2="120" stroke="var(--line)" stroke-width="1"/><text x="30" y="135" fill="var(--ink-soft)" font-size="10">2K RPM</text><text x="130" y="135" fill="var(--ink-soft)" font-size="10">4K RPM</text><text x="230" y="135" fill="var(--ink-soft)" font-size="10">6K RPM</text><text x="330" y="135" fill="var(--ink-soft)" font-size="10">9K RPM</text></svg></div>`;
  }

  function details() {
    const bike = getBike(query.get('bike'));
    const imgSrc = bikeImg(bike);
    const gallery = Array.from(new Set([(bike.gallery && bike.gallery.length) ? bike.gallery : imgSrc].flat().filter(Boolean)));
    const thumbsMarkup = gallery.length > 1 ? `<div class="gallery-thumbs">${gallery.map((img,n)=>`<button class="gallery-thumb ${n===0?'active':''}" data-img="${img}"><img src="${img}" alt="View ${n+1}"></button>`).join('')}</div>` : '';
    return `<section class="section-tight"><div class="container"><nav class="breadcrumbs"><a href="${link('home')}">Home</a><span>/</span><a href="${link('bikes')}">Explore Fleet</a><span>/</span><span>${bike.name}</span></nav><div class="detail-layout" style="margin-top:25px"><div><div class="gallery-main" id="main-gallery"><img src="${gallery[0]}" alt="${bike.name}"></div>${thumbsMarkup}<div class="detail-gallery-actions" style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-outline" data-action="ar-preview" data-id="${bike.id}">🔍 See This Vehicle in AR</button></div></div><div><div class="detail-title"><div><span class="eyebrow">${bike.brand} · ${bike.type}</span><h1>${bike.name}</h1><p class="rating">★ ${bike.rating} <b>Excellent</b> · 120 verified rider reviews <span class="verified-ride-badge" data-action="verified-info" data-name="${bike.name}">✓ VERIFIED RIDE</span></p></div><button class="icon-btn" data-action="wish" data-id="${bike.id}">♡</button></div><div class="detail-price"><span><strong>${money(bike.price)}</strong> <small>per 24 hours</small></span><span class="badge">Instant Pickup</span></div><div class="perks"><span class="perk"><b>⌁ Free Helmet</b>Certified Helmet</span><span class="perk"><b>◈ ${money(bike.deposit)}</b>Deposit</span><span class="perk"><b>✓ Inspected</b>32-Point Check</span></div><form class="booking-mini" id="detail-form"><div class="booking-mini-field"><label for="detail-start">Pickup Date</label><input id="detail-start" name="start" type="date" min="${today}" value="${today}" required class="detail-date-input"></div><div class="booking-mini-field"><label for="detail-end">Return Date</label><input id="detail-end" name="end" type="date" min="${today}" required class="detail-date-input"></div><button class="btn btn-primary" type="submit">Reserve ${bike.name} →</button></form></div></div>${renderWhyThisBike(bike)}${renderEcoRideScore(bike)}${renderRoutePersonalitySelector()}${renderTripCostSimulator(bike)}${renderBikeDNA(bike)}${renderPerformanceChart(bike)}<div class="details-tabs"><div class="tab-buttons"><button class="active" data-tab="spec">Specifications</button><button data-tab="accessories">Accessories</button><button data-tab="about">About Vehicle</button></div><div class="tab-panel" id="tab-panel"><div class="specs">${[['Engine',bike.engine],['Power',bike.power],['Torque',bike.torque],['Transmission',bike.transmission],['Seat Height',bike.seat],['Curb Weight',bike.weight],['Top Speed',bike.topSpeed],['Fuel Capacity',bike.fuelCap],['Brakes','Dual ABS / CBS']].map(x=>`<div class="spec"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</div></div></div></div></section>`;
  }

  function priceSummary(bike, extrasTotal=0) {
    const baseRental = bike.price, sanitization = 149, gst = Math.round((baseRental + extrasTotal + sanitization) * .18), total = baseRental + extrasTotal + sanitization + gst, imgSrc = bikeImg(bike);

    return `<div class="summary-bike"><img src="${imgSrc}" alt=""><span><strong>${bike.name}</strong><span>${bike.type} · Live Pickup</span></span></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px"><h3 style="margin:0;font-size:15px">💰 Smart Transparent Pricing</h3><span class="no-hidden-fee-badge">✓ Zero Hidden Charges</span></div>
    <div class="summary-line" id="sum-rental-line"><span>Your Trip (1 day × ${money(bike.price)})</span><strong>${money(bike.price)}</strong></div>
    <div class="summary-line"><span>Rider Helmet</span><span style="color:var(--emerald);font-weight:800">Included Free</span></div>
    <div class="summary-line" id="sum-extras-line"><span>Insurance & Selected Extras</span><strong>${money(extrasTotal)}</strong></div>
    <div class="summary-line"><span>Sanitization & Prep</span><span>${money(149)}</span></div>
    <div class="summary-line" id="sum-gst-line"><span>Taxes (18% GST)</span><span>${money(gst)}</span></div>
    <div class="coupon"><input id="coupon" placeholder="Coupon Code (WANDER20)"><button type="button" data-action="coupon">Apply</button></div>
    <div class="summary-line total"><span>Total Payable</span><span id="total">${money(total)}</span></div>
    <div class="deposit-disclosure"><span>Refundable Deposit: <strong>${money(bike.deposit)}</strong></span><small style="color:var(--emerald)">100% Refundable in 24h</small></div>`;
  }

  function updatePriceSummary(discount) {
    const form = document.querySelector('#smart-booking-form'), summary = document.querySelector('.summary-card');
    if (!form || !summary) return;
    if (discount !== undefined) summary.dataset.discount = discount;
    const startVal = form.querySelector('[name=start]')?.value, endVal = form.querySelector('[name=end]')?.value;
    if (!startVal || !endVal) return;
    const start = new Date(startVal), end = new Date(endVal);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return;
    const bike = getBike(query.get('bike')), days = Math.max(1, Math.ceil((end - start) / 86400000));
    let extrasTotal = 0;
    document.querySelectorAll('.extra-card.selected').forEach(card => { extrasTotal += Number(card.dataset.price || 0) * days; });

    const rental = bike.price * days, reduction = Math.round(rental * Number(summary.dataset.discount || 0));
    const service = 149, gst = Math.round((rental - reduction + extrasTotal + service) * .18), total = rental - reduction + extrasTotal + service + gst;
    
    const lineRental = document.querySelector('#sum-rental-line'), lineExtras = document.querySelector('#sum-extras-line'), lineGst = document.querySelector('#sum-gst-line'), lineTotal = document.querySelector('#total');

    if (lineRental) lineRental.innerHTML = `<span>Your Trip (${days} day${days===1?'':'s'} × ${money(bike.price)})</span><strong>${money(rental)}</strong>`;
    if (lineExtras) lineExtras.innerHTML = `<span>Insurance & Selected Extras</span><strong>${money(extrasTotal)}</strong>`;
    if (lineGst) lineGst.innerHTML = `<span>Taxes (18% GST)</span><span>${money(gst)}</span>`;
    if (lineTotal) lineTotal.textContent = money(total);
  }

  function booking() {
    const bike = getBike(query.get('bike')), cityParam = query.get('city') || 'Indiranagar Hub, Bengaluru', daysParam = Number(query.get('days') || 1);
    const dStart = new Date(today), dEnd = new Date(dStart.getTime() + (daysParam * 86400000)), endStr = dEnd.toISOString().split('T')[0];

    return `<section class="section-tight"><div class="container">
      <div class="smart-stepper" id="smart-stepper">
        <div class="stepper-item active" data-step-target="1"><span class="step-num">01</span><span>Your Ride</span></div>
        <span class="stepper-arrow">→</span>
        <div class="stepper-item" data-step-target="2"><span class="step-num">02</span><span>Your Extras</span></div>
        <span class="stepper-arrow">→</span>
        <div class="stepper-item" data-step-target="3"><span class="step-num">03</span><span>Confirm & Pay</span></div>
      </div>
      <div class="booking-layout">
        <form class="form-card card" id="smart-booking-form">
          <div class="step-panel" id="step-panel-1">
            <span class="eyebrow">STEP 01 OF 03</span>
            <h2 style="margin:4px 0 12px">Your Ride (Vehicle + Dates)</h2>
            <div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;gap:12px;align-items:center;margin-bottom:16px">
              <img src="${bikeImg(bike)}" width="80" height="60" style="object-fit:cover;border-radius:8px">
              <div><span class="badge ghost">${bike.type}</span><h3 style="margin:2px 0">${bike.name}</h3><span style="font-size:11px;color:var(--ink-soft)">${bike.engine} · ${bike.power} · <strong>${money(bike.price)}</strong>/day</span></div>
            </div>
            <div class="form-grid">
              <div class="form-control"><label>Pickup Date</label><input name="start" type="date" min="${today}" value="${today}" required></div>
              <div class="form-control"><label>Return Date (${daysParam} Day${daysParam===1?'':'s'})</label><input name="end" type="date" min="${today}" value="${endStr}" required></div>
              <div class="form-control"><label>Pickup Time Slot</label><select><option>9:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>6:00 PM</option></select></div>
              <div class="form-control"><label>Pickup Hub Location</label><select><option value="${cityParam}" selected>${cityParam}</option><option>Indiranagar Hub, Bengaluru</option><option>Airport Delivery Hub</option><option>Koramangala Hub</option></select></div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:flex-end"><button class="btn btn-primary" type="button" id="btn-to-step-2">Next: Add Extras →</button></div>
          </div>

          <div class="step-panel" id="step-panel-2" style="display:none">
            <span class="eyebrow">STEP 02 OF 03</span>
            <h2 style="margin:4px 0 6px">Customize Your Extras</h2>
            <div class="extras-grid">
              <div class="extra-card selected" data-extra="helmet" data-price="0"><div class="extra-info"><strong>⌁ ISI/ECE Certified Rider Helmet</strong><span>Included Free</span></div><span class="extra-toggle">✓</span></div>
              <div class="extra-card" data-extra="pillion-helmet" data-price="179"><div class="extra-info"><strong>🪖 Pillion Rider Helmet</strong><span>+${money(179)} / day</span></div><span class="extra-toggle">+</span></div>
              <div class="extra-card" data-extra="insurance" data-price="199"><div class="extra-info"><strong>🛡️ Full Comprehensive Protection</strong><span>Zero-deductible damage cover & 24/7 Assist (+${money(199)}/day)</span></div><span class="extra-toggle">+</span></div>
              <div class="extra-card" data-extra="luggage" data-price="299"><div class="extra-info"><strong>🧳 Waterproof Luggage Saddlebags</strong><span>50L Dual side panniers (+${money(299)}/day)</span></div><span class="extra-toggle">+</span></div>
              <div class="extra-card" data-extra="phone-mount" data-price="149"><div class="extra-info"><strong>📱 Vibration-Dampened Phone Mount</strong><span>Universal mount + USB fast charger (+${money(149)}/day)</span></div><span class="extra-toggle">+</span></div>
            </div>
            <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center"><button class="btn btn-outline" type="button" id="btn-back-to-step-1">← Back to Ride</button><button class="btn btn-primary" type="button" id="btn-to-step-3">Next: Confirm & Pay →</button></div>
          </div>

          <div class="step-panel" id="step-panel-3" style="display:none">
            <span class="eyebrow">STEP 03 OF 03</span>
            <h2 style="margin:4px 0 6px">Rider Credentials & Payment</h2>
            <div class="form-grid">
              <div class="form-control"><label>Full Name</label><input required placeholder="Your Full Name"></div>
              <div class="form-control"><label>Mobile Phone</label><input required pattern="[0-9+ -]{10,}" placeholder="+91 98765 43210"></div>
              <div class="form-control full"><label>Email Address</label><input type="email" required placeholder="you@example.com"></div>
            </div>
            <hr>
            <div class="policy-badge-box">
              <div class="policy-card"><span>🛡️</span><strong>100% Refundable Deposit</strong><small>Released in 24 hours</small></div>
              <div class="policy-card"><span>🔄</span><strong>Free Cancellation</strong><small>Up to 24h prior</small></div>
              <div class="policy-card"><span>⚡</span><strong>Keyless Unlock</strong><small>Instant app pickup</small></div>
            </div>
            <div class="form-control full" style="margin-top:12px"><label>Choose Encrypted Payment Mode</label><div class="payment-options"><label class="payment-option"><input type="radio" name="pay" checked> Instant UPI</label><label class="payment-option"><input type="radio" name="pay"> Credit/Debit Card</label><label class="payment-option"><input type="radio" name="pay"> Net Banking</label></div></div>
            <div class="form-control full" style="margin-top:10px"><label>UPI VPA ID / Card Holder</label><input required placeholder="username@upi"></div>
            <label class="check-inline" style="margin-top:14px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700"><input type="checkbox" required checked> I possess a valid two-wheeler driving licence.</label>
            <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center"><button class="btn btn-outline" type="button" id="btn-back-to-step-2">← Back to Extras</button><button class="btn btn-primary" type="submit">Confirm & Pay Reservation →</button></div>
          </div>
        </form>
        <aside class="summary-card card">${priceSummary(bike)}</aside>
      </div>
    </div></section>`;
  }

  function checkout() {
    const bike = getBike(query.get('bike'));
    return `<section class="section-tight"><div class="container"><div class="stepper"><span class="step active" data-step="1">Select Ride</span><span class="step active" data-step="2">Rider Details</span><span class="step active" data-step="3">Payment</span><span class="step" data-step="4">Confirmed</span></div><div class="booking-layout"><form class="form-card card" id="checkout-form"><span class="eyebrow">Encrypted Payment</span><h2>Confirm Reservation.</h2><div class="form-grid"><div class="form-control full"><label>Payment Mode</label><div class="payment-options"><label class="payment-option"><input type="radio" name="pay" checked> Instant UPI</label><label class="payment-option"><input type="radio" name="pay"> Credit/Debit Card</label><label class="payment-option"><input type="radio" name="pay"> Net Banking</label></div></div><div class="form-control full"><label>UPI VPA ID</label><input required placeholder="username@upi"></div></div><hr><button class="btn btn-primary" type="submit">Pay & Confirm Ride →</button></form><aside class="summary-card card">${priceSummary(bike)}</aside></div></div></section>`;
  }

  function about() {
    return `
      <div class="brand-story-page">
        <!-- 1. Full-Width Cinematic Hero with Proper Centered Container -->
        <section class="brand-story-hero">
          <div class="brand-story-hero-overlay"></div>
          <div class="brand-story-container">
            <div class="brand-story-hero-content">
              <nav class="breadcrumbs brand-story-breadcrumbs">
                <span class="brand-story-bread-bar"></span>
                <a href="${link('home')}">Home</a><span>/</span><span>Brand Story</span>
              </nav>
              <h1 class="brand-story-hero-title">Engineered for the <span class="serif brand-hero-accent">scenic detour.</span></h1>
              <p class="brand-story-hero-desc">${currentBrand} was created to deliver world-class motorcycle and scooter rental experiences with uncompromised quality, 32-point inspection, and AI route intelligence.</p>
            </div>
          </div>
        </section>

        <!-- 2. Clean Editorial Philosophy & The RYVON Standard (NO dark rectangle) -->
        <section class="brand-story-philosophy">
          <div class="brand-story-container">
            <div class="brand-story-philosophy-grid">
              <div class="brand-story-phil-left">
                <div class="brand-story-eyebrow-row">
                  <span class="brand-story-gold-bar"></span>
                  <span class="eyebrow brand-story-eyebrow">OUR PHILOSOPHY</span>
                </div>
                <h2 class="brand-story-heading">Built for the ride <span class="serif">beyond the obvious.</span></h2>
                <p class="brand-story-p">${currentBrand} is built around a simple idea: renting a motorcycle should feel like the beginning of an adventure, not a transaction.</p>
                <p class="brand-story-p muted">From high-altitude mountain passes to coastal highways, we make it easier to choose the right machine and the right road.</p>
              </div>
              <div class="brand-story-phil-right">
                <div class="brand-story-standard-panel">
                  <div class="brand-story-standard-top">
                    <span class="brand-story-standard-tag">✦ THE RYVON STANDARD</span>
                    <span class="brand-story-standard-sub">Fleet Charter</span>
                  </div>
                  <div class="brand-story-standard-list">
                    <div class="brand-story-std-item">
                      <span class="brand-story-std-num">01</span>
                      <div class="brand-story-std-content">
                        <strong>32-POINT INSPECTION</strong>
                        <span>Checked before handover.</span>
                      </div>
                    </div>
                    <div class="brand-story-std-item">
                      <span class="brand-story-std-num">02</span>
                      <div class="brand-story-std-content">
                        <strong>VERIFIED RIDES</strong>
                        <span>Condition & readiness verified.</span>
                      </div>
                    </div>
                    <div class="brand-story-std-item">
                      <span class="brand-story-std-num">03</span>
                      <div class="brand-story-std-content">
                        <strong>SMART ROUTES</strong>
                        <span>Intelligence for better journeys.</span>
                      </div>
                    </div>
                    <div class="brand-story-std-item">
                      <span class="brand-story-std-num">04</span>
                      <div class="brand-story-std-content">
                        <strong>READY TO RIDE</strong>
                        <span>Streamlined digital pickup.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Why RYVON Specification Cards -->
        <section class="brand-story-why">
          <div class="brand-story-container">
            <div class="brand-story-why-header">
              <div>
                <div class="brand-story-eyebrow-row">
                  <span class="brand-story-gold-bar"></span>
                  <span class="eyebrow brand-story-eyebrow">THE RYVON STANDARD</span>
                </div>
                <h2 class="brand-story-why-title">Why ${currentBrand}?</h2>
              </div>
              <p class="brand-story-why-desc">Engineered for better rides, from pickup to the open road.</p>
            </div>
            <div class="brand-story-why-grid">
              <div class="brand-story-why-card">
                <div class="brand-story-card-accent"></div>
                <span class="brand-story-card-idx">01</span>
                <strong>32-POINT</strong>
                <span>Inspection</span>
              </div>
              <div class="brand-story-why-card">
                <div class="brand-story-card-accent"></div>
                <span class="brand-story-card-idx">02</span>
                <strong>VERIFIED</strong>
                <span>Ride readiness</span>
              </div>
              <div class="brand-story-why-card">
                <div class="brand-story-card-accent"></div>
                <span class="brand-story-card-idx">03</span>
                <strong>SMART</strong>
                <span>Route intelligence</span>
              </div>
              <div class="brand-story-why-card">
                <div class="brand-story-card-accent"></div>
                <span class="brand-story-card-idx">04</span>
                <strong>READY</strong>
                <span>Seamless pickup</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Compact Premium CTA Strip -->
        <section class="brand-story-cta">
          <div class="brand-story-container">
            <div class="brand-story-cta-strip">
              <div class="brand-story-cta-text">
                <span class="eyebrow brand-story-cta-eyebrow">START YOUR DETOUR</span>
                <h3>Your next detour is waiting.</h3>
                <p>Explore the fleet and find your next ride.</p>
              </div>
              <div class="brand-story-cta-action">
                <a class="btn btn-primary brand-story-cta-btn" href="${link('bikes')}">Explore Fleet →</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function contact() {
    return `
      <div class="contact-hub-page">
        <!-- 1. Hero Section -->
        <section class="contact-hub-hero">
          <div class="contact-hub-hero-overlay"></div>
          <div class="contact-hub-container">
            <div class="contact-hub-hero-content">
              <nav class="breadcrumbs contact-breadcrumbs">
                <span class="contact-bread-bar"></span>
                <a href="${link('home')}">Home</a><span>/</span><span>Contact Command</span>
              </nav>
              <h1 class="contact-hero-title">24/7 Ride <span class="serif contact-hero-accent">Command Hub.</span></h1>
              <p class="contact-hero-desc">Our telematics and support team is ready to assist with reservations, route tips, and roadside assistance.</p>
              <div class="contact-hero-chips">
                <span class="contact-chip"><span class="contact-chip-dot"></span> 24/7 Support</span>
                <span class="contact-chip"><span class="contact-chip-dot"></span> Route Guidance</span>
                <span class="contact-chip"><span class="contact-chip-dot"></span> Roadside Help</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Main Contact 3-Column Section -->
        <section class="contact-hub-main">
          <div class="contact-hub-container">
            <div class="contact-hub-grid">
              
              <!-- LEFT: Send a Message Form -->
              <div class="contact-card contact-form-card">
                <div class="contact-card-header">
                  <span class="eyebrow contact-card-eyebrow">INSTANT DISPATCH</span>
                  <h2 class="contact-card-title">Send a Message</h2>
                </div>
                <form id="contact-form" class="contact-form">
                  <div class="contact-form-group">
                    <label for="contact-name">Full Name</label>
                    <input type="text" id="contact-name" name="name" required placeholder="Captain Rider" class="contact-input">
                  </div>
                  <div class="contact-form-group">
                    <label for="contact-email">Email Address</label>
                    <input type="email" id="contact-email" name="email" required placeholder="rider@domain.com" class="contact-input">
                  </div>
                  <div class="contact-form-group">
                    <label for="contact-message">Message</label>
                    <textarea id="contact-message" name="message" required rows="3" placeholder="How can our Ride Command assist you today?" class="contact-input contact-textarea"></textarea>
                  </div>
                  <button class="btn btn-primary contact-submit-btn" type="submit">Send Message →</button>
                  <p class="contact-security-note">🔒 Encrypted telematics channel. Instant dispatch confirmation.</p>
                </form>
              </div>

              <!-- CENTER: Direct Assistance -->
              <div class="contact-card contact-info-card">
                <div class="contact-card-header">
                  <span class="eyebrow contact-card-eyebrow">COMMAND CHANNELS</span>
                  <h2 class="contact-card-title">Direct Assistance</h2>
                </div>
                <div class="contact-info-list">
                  <div class="contact-info-item">
                    <div class="contact-info-icon">📞</div>
                    <div class="contact-info-text">
                      <span class="contact-info-label">Hotline</span>
                      <strong class="contact-info-val">+91 1800-RIDE-OS</strong>
                      <span class="contact-info-sub">Mon–Sun, 24/7 Emergency Line</span>
                    </div>
                  </div>
                  <div class="contact-info-item">
                    <div class="contact-info-icon">✉️</div>
                    <div class="contact-info-text">
                      <span class="contact-info-label">Email Support</span>
                      <strong class="contact-info-val">support@rideos.com</strong>
                      <span class="contact-info-sub">Priority response in ~15 mins</span>
                    </div>
                  </div>
                  <div class="contact-info-item">
                    <div class="contact-info-icon">📍</div>
                    <div class="contact-info-text">
                      <span class="contact-info-label">Headquarters</span>
                      <strong class="contact-info-val">Indiranagar Tech Corridor</strong>
                      <span class="contact-info-sub">Bengaluru, KA 560038, India</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- RIGHT: Ride with Confidence (Dark Feature Card) -->
              <div class="contact-card contact-assurance-card">
                <div class="contact-assurance-badge">✦ FLEET ASSURANCE</div>
                <h2 class="contact-assurance-title">Ride with Confidence.</h2>
                <p class="contact-assurance-desc">Every rental is backed by real-time telemetry, transparent pricing, and 24/7 on-ground roadside assistance.</p>
                
                <ul class="contact-assurance-list">
                  <li class="contact-assurance-item">
                    <span class="contact-assurance-check">✓</span>
                    <span>Verified & insured fleet</span>
                  </li>
                  <li class="contact-assurance-item">
                    <span class="contact-assurance-check">✓</span>
                    <span>32-point inspection</span>
                  </li>
                  <li class="contact-assurance-item">
                    <span class="contact-assurance-check">✓</span>
                    <span>Real-time telematics</span>
                  </li>
                  <li class="contact-assurance-item">
                    <span class="contact-assurance-check">✓</span>
                    <span>Expert travel support</span>
                  </li>
                </ul>

                <div class="contact-assurance-status">
                  <span class="status-pulse-dot"></span>
                  <span>24/7 Dispatch Online</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    `;
  }

  const faqs = () => `<section class="faq-hero"><div class="container faq-hero-container"><nav class="breadcrumbs"><a href="${link('home')}">Home</a><span>/</span><span>FAQs & Charter</span></nav><h1 class="faq-hero-title">Safety & Rental <span class="serif">Charter.</span></h1><p class="faq-hero-desc">Everything you need to know about our fleet, security deposits, and roadside support.</p></div></section><section class="faq-section"><div class="faq-container"><div class="faq-intro-header"><span class="eyebrow">CHARTER</span><h2 class="faq-intro-title">Clear Policies.</h2><p class="faq-intro-desc">Everything you need to know before booking, collecting, and riding with ${currentBrand}.</p></div><div class="faq-accordion" role="region" aria-label="Frequently Asked Questions">${faqData.map(faqMarkup).join('')}</div></div></section>`;
  
  function auth(kind) {
    const isLogin = kind === 'login';
    return `<section class="auth-fullscreen">
      <div class="auth-bg-overlay"></div>
      <div class="container auth-center-container">
        <div class="auth-card-glass">
          <div class="auth-card-head">
            <span class="auth-badge">✦ RIDER CIRCLE ACCESS</span>
            <h2>${isLogin ? 'Member Sign In' : 'Create Account'}</h2>
            <p>${isLogin ? 'Enter your credentials to manage active bookings, digital keys & telemetry.' : 'Register your rider profile to unlock 24/7 keyless access & member rewards.'}</p>
          </div>

          <form id="auth-form" class="auth-form-centered">
            ${!isLogin ? `
              <div class="field-wrap">
                <label>Full Name</label>
                <div class="input-with-icon">
                  <span class="input-icon">👤</span>
                  <input type="text" required placeholder="Captain Rider" id="auth-fullname">
                </div>
              </div>
            ` : ''}

            <div class="field-wrap">
              <label>Email Address or Username</label>
              <div class="input-with-icon">
                <span class="input-icon">📧</span>
                <input type="email" required placeholder="you@example.com" id="auth-email">
              </div>
            </div>

            <div class="field-wrap">
              <label>Password</label>
              <div class="input-with-icon">
                <span class="input-icon">🔒</span>
                <input type="password" required placeholder="••••••••" id="auth-password">
              </div>
            </div>

            ${isLogin ? `
              <div class="auth-options-row">
                <label class="remember-check">
                  <input type="checkbox" checked>
                  <span>Remember me</span>
                </label>
                <a href="#" class="forgot-gold-link">Forgot password?</a>
              </div>
            ` : ''}

            <button class="btn btn-gold-solid btn-full" type="submit">
              ${isLogin ? 'Sign In to Dashboard →' : 'Register Rider Profile →'}
            </button>
          </form>

          <div class="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div class="social-login-grid">
            <button class="social-login-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#ea4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/><path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#fbbc05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"/><path fill="#34a853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/></svg>
              <span>Google</span>
            </button>
            <button class="social-login-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.98 1.07.08 2.16-.57 2.81-1.38z"/></svg>
              <span>Apple ID</span>
            </button>
          </div>

          <div class="auth-switch-footer">
            ${isLogin ? `
              <span>New to ${currentBrand}?</span>
              <a href="${link('register')}" class="switch-link">Create Account →</a>
            ` : `
              <span>Already registered?</span>
              <a href="${link('login')}" class="switch-link">Sign In →</a>
            `}
          </div>
        </div>
      </div>
    </section>`;
  }
  function renderDashboardHeader() {
    const user = getAuthUser();
    if (!user) return '';
    return `<div class="dashboard-header-card card">
      <div class="dashboard-header-left">
        ${userAvatar(user, 'dashboard-header-avatar')}
        <div class="dashboard-header-text">
          <span class="eyebrow" style="margin:0">⚡ RIDER COMMAND CENTER</span>
          <h2>Welcome back, ${displayName(user).split(' ')[0]}</h2>
          <p class="dashboard-header-subtext">Your next ride is ready. System check 100% complete.</p>
          <span class="dashboard-header-email">${escapeHTML(user.email)}</span>
        </div>
      </div>
      <div class="dashboard-header-right">
        <a href="${link('profile')}" class="btn btn-outline btn-sm">👤 Edit Profile</a>
      </div>
    </div>`;
  }

  function renderDashboardStats() {
    const user = getAuthUser();
    if (!user) return '';
    const completed = user.completedTrips || 0;
    const distance = completed * 240 + (completed ? 110 : 0);
    const score = user.safetyScore || 100;
    const wishesCount = wishes().length;
    
    return `<div class="dashboard-stats-grid">
      <article class="stat-card card">
        <div class="stat-icon">🏁</div>
        <div class="stat-info">
          <span>Total Rides</span>
          <strong>${completed} Rides</strong>
        </div>
      </article>
      <article class="stat-card card">
        <div class="stat-icon">🛣️</div>
        <div class="stat-info">
          <span>Distance Covered</span>
          <strong>${distance} km</strong>
        </div>
      </article>
      <article class="stat-card card">
        <div class="stat-icon">🛡️</div>
        <div class="stat-info">
          <span>Rider Safety Score</span>
          <strong>${score} / 100</strong>
        </div>
      </article>
      <article class="stat-card card">
        <div class="stat-icon">❤️</div>
        <div class="stat-info">
          <span>Saved in Fleet</span>
          <strong>${wishesCount} Saved</strong>
        </div>
      </article>
    </div>`;
  }

  function renderRecentJourneys() {
    return `<div class="card recent-journeys-card" style="padding:24px">
      <div class="card-header-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;font-family:var(--font-serif)">Recent Journeys</h3>
        <a href="${link('booking-history')}" class="gold-link" style="font-size:13px;font-weight:600">View All →</a>
      </div>
      <div class="recent-journeys-container">
        <div class="journey-row">
          <div class="journey-info">
            <strong>Honda Activa 6G Deluxe</strong>
            <span>Bengaluru City Commute</span>
          </div>
          <div class="journey-meta">
            <span>12 Aug — 15 Aug</span>
            <span class="code-font">RDS-2026-8812</span>
          </div>
          <div class="journey-status">
            <span class="badge status-completed">Completed</span>
          </div>
        </div>
        <div class="journey-row">
          <div class="journey-info">
            <strong>Triumph Speed 400</strong>
            <span>Konkan Marine Drive</span>
          </div>
          <div class="journey-meta">
            <span>02 Jun — 05 Jun</span>
            <span class="code-font">RDS-2026-4401</span>
          </div>
          <div class="journey-status">
            <span class="badge status-completed">Completed</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  function dashboardWrap(active, content) {
    return `
      <nav class="dashboard-nav">
        <div class="dashboard-nav-container">
          <a class="dashboard-nav-item ${active==='dash'?'active':''}" href="${link('dashboard')}"><span class="nav-item-icon">📊</span> Overview</a>
          <a class="dashboard-nav-item ${active==='history'?'active':''}" href="${link('booking-history')}"><span class="nav-item-icon">📖</span> Journey Logs</a>
          <a class="dashboard-nav-item ${active==='profile'?'active':''}" href="${link('profile')}"><span class="nav-item-icon">👤</span> Rider Profile</a>
          <a class="dashboard-nav-item ${active==='wishlist'?'active':''}" href="${link('wishlist')}"><span class="nav-item-icon">🏍️</span> Saved Fleet</a>
          <a class="dashboard-nav-item logout-link" href="#"><span class="nav-item-icon">🚪</span> Sign Out</a>
        </div>
      </nav>
      <section class="section-tight" style="min-height: 60vh;">
        <div class="container dashboard-container">
          <div class="dashboard-content-grid">
            ${content}
          </div>
        </div>
      </section>
    `;
  }
  
  function dash() {
    const user = getAuthUser();
    if (!user) return '';
    
    const savedBikes = wishes().map(getBike).slice(0, 2);
    let savedFleetMarkup = '';
    
    if (savedBikes.length > 0) {
      savedFleetMarkup = `
        <div class="dashboard-saved-fleet-card card">
          <div class="card-header-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="margin:0;font-family:var(--font-serif)">Saved Fleet</h3>
            <a href="${link('wishlist')}" class="gold-link" style="font-size:13px;font-weight:600">View All →</a>
          </div>
          <div class="bike-grid-compact">
            ${savedBikes.map(bikeCard).join('')}
          </div>
        </div>
      `;
    } else {
      savedFleetMarkup = `
        <div class="dashboard-saved-fleet-card card empty-state" style="padding:24px;text-align:center">
          <h3 style="margin:0 0 8px 0;font-family:var(--font-serif)">Saved Fleet</h3>
          <p class="muted" style="margin-bottom:16px;font-size:13px">No saved rides yet. Explore the fleet and save your favorites.</p>
          <a class="btn btn-primary" href="${link('bikes')}" style="display:inline-flex;width:auto;justify-content:center">Explore Fleet →</a>
        </div>
      `;
    }

    return dashboardWrap('dash', `
      ${renderDashboardHeader()}
      ${renderDashboardStats()}
      
      <div class="dashboard-main-grid">
        <div class="dashboard-main-left">
          ${renderTripCommandCenter()}
        </div>
        <div class="dashboard-main-right">
          ${renderAIPackingAssistant()}
        </div>
      </div>

      <div class="dashboard-lower-grid">
        <div class="dashboard-lower-left">
          ${renderRecentJourneys()}
        </div>
        <div class="dashboard-lower-right">
          ${savedFleetMarkup}
        </div>
      </div>
    `);
  }

  function history() {
    const user = getAuthUser();
    if (!user) return '';
    return dashboardWrap('history', `
      <div class="booking-history-section" style="width: 100%;">
        <h2 style="margin-bottom:20px;font-family:var(--font-serif)">Journey Logs</h2>
        <div class="journey-logs-list">
          <div class="journey-log-card card">
            <div class="journey-log-header">
              <span class="journey-log-id">RDS-2026-8812</span>
              <span class="badge status-completed">Verified Return</span>
            </div>
            <div class="journey-log-body">
              <div class="journey-log-col">
                <span>Bike</span>
                <strong>Honda Activa 6G Deluxe</strong>
              </div>
              <div class="journey-log-col">
                <span>Route</span>
                <strong>Bengaluru City Commute</strong>
              </div>
              <div class="journey-log-col">
                <span>Dates</span>
                <strong>12 Aug — 15 Aug</strong>
              </div>
              <div class="journey-log-col">
                <span>Duration</span>
                <strong>3 Days</strong>
              </div>
            </div>
          </div>
          <div class="journey-log-card card">
            <div class="journey-log-header">
              <span class="journey-log-id">RDS-2026-4401</span>
              <span class="badge status-completed">Verified Return</span>
            </div>
            <div class="journey-log-body">
              <div class="journey-log-col">
                <span>Bike</span>
                <strong>Triumph Speed 400</strong>
              </div>
              <div class="journey-log-col">
                <span>Route</span>
                <strong>Konkan Marine Drive</strong>
              </div>
              <div class="journey-log-col">
                <span>Dates</span>
                <strong>02 Jun — 05 Jun</strong>
              </div>
              <div class="journey-log-col">
                <span>Duration</span>
                <strong>3 Days</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  function profile() {
    const user = getAuthUser();
    if (!user) return '';
    return dashboardWrap('profile', `
      <div class="profile-header-card card" style="display:flex;align-items:center;gap:20px;padding:24px;margin-bottom:24px;flex-wrap:wrap">
        <div class="profile-avatar-large-wrap">
          ${userAvatar(user, 'profile-avatar-large')}
        </div>
        <div class="profile-header-info">
          <h2 style="margin:0;font-family:var(--font-serif)">${displayName(user)}</h2>
          <p class="muted" style="margin:4px 0">${escapeHTML(user.email)}</p>
          <span class="member-since-tag" style="font-size:11px;color:var(--gold,#f59e0b);font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Member Since: ${escapeHTML(user.memberSince || 'Aug 2026')}</span>
        </div>
      </div>

      <div class="card" style="padding:24px;width:100%">
        <h3 style="margin:0 0 20px 0;font-family:var(--font-serif)">Rider Information</h3>
        <form id="profile-form" style="display:grid;gap:15px">
          <div class="field-wrap" style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12px;font-weight:700;color:#cbd5e1">Full Name</label>
            <input type="text" id="profile-name" value="${displayName(user)}" required style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:10px;border-radius:8px;color:#fff;font-size:13px">
          </div>
          <div class="field-wrap" style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12px;font-weight:700;color:#cbd5e1">Email Address</label>
            <input type="email" id="profile-email" value="${escapeHTML(user.email)}" required readonly style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:10px;border-radius:8px;color:#64748b;font-size:13px;cursor:not-allowed">
            <small style="color:#64748b;font-size:11px">Email address cannot be changed</small>
          </div>
          <div class="field-wrap" style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12px;font-weight:700;color:#cbd5e1">Phone Number</label>
            <input type="text" id="profile-phone" value="${escapeHTML(user.phone || '')}" placeholder="+91 XXXXX XXXXX" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:10px;border-radius:8px;color:#fff;font-size:13px">
          </div>
          <div class="field-wrap" style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12px;font-weight:700;color:#cbd5e1">License Number</label>
            <input type="text" id="profile-license" value="${escapeHTML(user.licenseNumber || '')}" placeholder="e.g. KA-01-2024-XXXXXX" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:10px;border-radius:8px;color:#fff;font-size:13px">
          </div>
          <div class="field-wrap" style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12px;font-weight:700;color:#cbd5e1">Profile Image URL</label>
            <input type="url" id="profile-avatar-url" value="${escapeHTML(user.avatar || '')}" placeholder="https://example.com/your-photo.jpg" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:10px;border-radius:8px;color:#fff;font-size:13px">
          </div>
          <button class="btn btn-gold-solid" type="submit" style="justify-content:center;width:auto;align-self:start;margin-top:10px">Save Profile Changes</button>
        </form>
      </div>
    `);
  }

  const pages={home,bikes:bikesPage,destinations:destinationsPage,details,booking,checkout,about,contact,faq:faqs,login:()=>auth('login'),register:()=>auth('register'),dashboard:dash,history,profile,wishlist:renderSmartGarage};

  function dismissToast(note) { if (!note || !note.isConnected) return; note.style.animation = 'toast-out .3s forwards'; setTimeout(() => note.remove(), 300); }
  function toast(text) {
    const region = document.querySelector('.toast-region');
    if (!region) return;
    const note=document.createElement('div'); note.className='toast';
    note.innerHTML = `<span class="toast-icon">✓</span><span>${text}</span><span class="toast-bar"></span>`;
    note.addEventListener('click', () => dismissToast(note));
    region.append(note); setTimeout(()=>dismissToast(note),3400);
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.rate = 1.0; uttr.pitch = 1.0;
      window.speechSynthesis.speak(uttr);
    }
  }

  function generateAITripItinerary(data) {
    const start = data.start || 'Chandigarh', dest = data.dest || 'Manali', days = Number(data.days || 3), budget = Number(data.budget || 15000), level = data.level || 'Intermediate', pref = data.pref || 'Mountain Offroad';
    let routeTitle = `${start.toUpperCase()} → ${dest.toUpperCase()}`, legs = [], recBike = bikes[0];
    let hotels = ['Lake View Retreat', 'The Himalayan Luxury Resort', 'Solang Valley Alpine Huts'], fuels = ['HP Swarghat Highway Station', 'Indian Oil Kullu Hub', 'BPCL Manali Bypass'], foods = ['Giani Da Dhaba Swarghat', 'Highway Bistro Mandi', "Johnson's Cafe Manali"], points = ['Pandoh Dam Viewpoint', 'Hanogi Mata Temple Pass', 'Atal Tunnel South Portal', 'Solang Ropeway Summit'], packing = ['ECE/ISI Certified Helmet', 'Waterproof Riding Jacket', 'Thermal Base Layers', 'Riding Gloves & Boots', 'Rain Cover', 'Smartphone USB Mount', 'Hydration Pack', 'Emergency First Aid Kit'];
    let aiConditions = { statusBadge: '🟢 Excellent riding conditions', temp: '19°C', rainProb: '12%', roadCondition: 'Good / Asphalt', visibility: 'Excellent (10 km)', recommendation: 'Start before 8:00 AM to avoid traffic near Mandi.' };
    let aiSafety = { overallScore: 87, subscores: [ { label: 'Road quality', score: 91 }, { label: 'Weather', score: 84 }, { label: 'Traffic', score: 79 }, { label: 'Visibility', score: 95 }, { label: 'Terrain', score: 86 } ], tip: 'Safety Tip: Heavy rain expected after 6 PM. Consider returning before 5 PM.' };

    if (start.toLowerCase().includes('chandigarh') && dest.toLowerCase().includes('manali')) {
      recBike = bikes[7]; // Himalayan
      legs = [
        { day: 1, title: 'Chandigarh → Bilaspur', dist: '190 km', time: '4h 30m', desc: 'Smooth highway cruise via Swarghat ghat roads.' },
        { day: 2, title: 'Bilaspur → Manali', dist: '210 km', time: '5h', desc: 'Scenic mountain climb along Beas River and Mandi Tunnels.' },
        { day: 3, title: 'Manali → Solang Valley & Atal Tunnel', dist: '45 km', time: '2h', desc: 'High altitude pass drive to Atal Tunnel portal.' }
      ];
    } else {
      recBike = pref.includes('Mountain') ? bikes[7] : bikes[0];
      for (let i = 1; i <= days; i++) legs.push({ day: i, title: `Leg ${i}: ${start} → Waypoint ${i}`, dist: `${120 + i * 40} km`, time: `${3 + i}h`, desc: `Curated ${pref} leg.` });
    }

    return { routeTitle, days, budget, level, pref, legs, recBike, hotels, fuels, foods, points, packing, aiConditions, aiSafety };
  }

  function closeModal() {
    const root = document.querySelector('.modal-root');
    if (root) {
      root.classList.remove('open');
      root.innerHTML = '';
    }
  }

  function openBuildMyRideModal() {
    openModal(`<div class="modal build-ride-modal">
      <button class="icon-btn modal-close" data-close aria-label="Close modal">×</button>
      <span class="eyebrow" style="color:var(--lime-dark)">🗺️ Intelligent Mobility Engine</span>
      <h2 style="margin:4px 0 6px;font-family:var(--font-serif)">Build My Ride — AI Trip Generator</h2>
      <p style="color:var(--ink-soft);font-size:12.5px;margin:0 0 16px">Custom multiday route intelligence, terrain recommendations, and telemetry forecasting.</p>
      
      <form id="build-ride-form" class="build-ride-form">
        <div class="bmr-form-grid">
          <div class="bmr-field-group">
            <label for="bmr-start">Starting City</label>
            <input id="bmr-start" name="start" value="Chandigarh" placeholder="e.g. Chandigarh, Bengaluru" required class="bmr-control">
          </div>
          <div class="bmr-field-group">
            <label for="bmr-dest">Destination</label>
            <input id="bmr-dest" name="dest" value="Manali" placeholder="e.g. Manali, Leh, Goa" required class="bmr-control">
          </div>
          <div class="bmr-field-group">
            <label for="bmr-days">Trip Duration (Days)</label>
            <input id="bmr-days" name="days" type="number" value="3" min="1" max="14" required class="bmr-control">
          </div>
          <div class="bmr-field-group">
            <label for="bmr-budget">Total Budget (₹)</label>
            <input id="bmr-budget" name="budget" type="number" value="15000" step="1000" min="2000" max="200000" required class="bmr-control">
          </div>
          <div class="bmr-field-group">
            <label for="bmr-level">Experience Level</label>
            <select id="bmr-level" name="level" class="bmr-control">
              <option value="Intermediate" selected>Intermediate Rider</option>
              <option value="Beginner">Beginner Rider</option>
              <option value="Expert">Expert Tourer</option>
            </select>
          </div>
          <div class="bmr-field-group">
            <label for="bmr-pref">Riding Preference</label>
            <select id="bmr-pref" name="pref" class="bmr-control">
              <option value="Mountain Offroad" selected>Mountain Offroad & Passes</option>
              <option value="Scenic Highway">Scenic Coastal & Forest</option>
              <option value="Fast Highway">Fast Highway Express</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary bmr-submit-btn" type="submit">Generate Complete AI Itinerary ✨</button>
      </form>
      <div id="bmr-results-box" class="bmr-results-box" style="margin-top:16px"></div>
    </div>`);

    const form = document.querySelector('#build-ride-form'), resultsBox = document.querySelector('#bmr-results-box');
    const renderResults = (data) => {
      const itin = generateAITripItinerary(data);
      speakText(`Generated ${itin.days} day AI trip itinerary from ${data.start} to ${data.dest}.`);
      resultsBox.innerHTML = `<div class="voice-parsed-card" style="border-color:var(--lime);border-radius:14px;padding:16px;background:var(--paper)"><div style="display:flex;justify-content:space-between;align-items:center"><span class="badge" style="background:var(--lime);color:#070a0f">🗺️ AI ITINERARY</span><strong style="font-size:16px;color:var(--lime-dark)">${itin.routeTitle}</strong></div><h4 style="margin:16px 0 8px">Day-by-Day Route Timeline (${itin.days} Days)</h4><div class="itinerary-timeline">${itin.legs.map(leg => `<div class="itinerary-day" style="padding:10px 12px;margin-bottom:8px;border-radius:8px;background:var(--surface);border:1px solid var(--line)"><h4 style="margin:0 0 4px;font-size:13px">${leg.title}</h4><p style="margin:0;font-size:12px;color:var(--ink-soft)"><strong>${leg.dist}</strong> · estimated ${leg.time} · <i>${leg.desc}</i></p></div>`).join('')}</div></div>`;
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        renderResults({ start: document.querySelector('#bmr-start')?.value || 'Chandigarh', dest: document.querySelector('#bmr-dest')?.value || 'Manali', days: Number(document.querySelector('#bmr-days')?.value || 3), budget: Number(document.querySelector('#bmr-budget')?.value || 15000), level: document.querySelector('#bmr-level')?.value || 'Intermediate', pref: document.querySelector('#bmr-pref')?.value || 'Mountain Offroad' });
      });
      renderResults({ start: 'Chandigarh', dest: 'Manali', days: 3, budget: 15000, level: 'Intermediate', pref: 'Mountain Offroad' });
    }
  }

  function parseVoiceBookingPrompt(promptText) {
    const t = promptText.toLowerCase(), knownCities = ['Chandigarh', 'Bengaluru', 'Goa', 'Manali', 'Leh', 'Spiti', 'Jaipur', 'Kochi', 'Delhi', 'Mumbai', 'Shimla', 'Rishikesh', 'Pune', 'Udaipur', 'Coorg'];
    let location = knownCities.find(c => t.includes(c.toLowerCase())) || 'Chandigarh', duration = 3;
    const knownBrands = ['Activa', 'Honda', 'TVS', 'Suzuki', 'Yamaha', 'Vespa', 'Royal Enfield', 'Triumph', 'BMW', 'KTM', 'Harley', 'Ducati', 'Kawasaki', 'Scooter', 'Adventure', 'Cruiser', 'Roadster', 'Sport'];
    let brand = knownBrands.find(b => t.includes(b.toLowerCase())) || 'Honda', budget = 1500, matchedBikes = bikes.filter(b => b.price <= budget);
    if (matchedBikes.length < 6) matchedBikes = bikes.slice(0, 6);
    return { location, duration, brand, budget, matchedBikes, rawText: promptText };
  }

  function openVoiceBookingModal() {
    openModal(`<div class="modal" style="width:min(640px,94vw)"><button class="icon-btn modal-close" data-close>×</button><span class="eyebrow">🎙️ ${currentBrand} AI Voice Agent</span><h2 style="margin:4px 0">Conversational AI Voice Assistant</h2><div style="margin:16px 0;text-align:center"><div style="display:inline-flex;align-items:center;gap:12px;padding:12px 24px;border-radius:999px;background:#070a0f;color:#fff;border:1.5px solid var(--lime)"><span style="font-size:22px">🎙️</span><span style="font-weight:800;font-size:13px" id="voice-modal-status">Listening...</span></div></div><button class="sample-voice-chip" type="button" data-prompt="I need a Honda Activa 6G for three days in Bengaluru under ₹700.">"I need a Honda Activa 6G for three days in Bengaluru under ₹700."</button><div id="voice-parsed-output"></div></div>`);
    const processPrompt = (promptText) => {
      const parsed = parseVoiceBookingPrompt(promptText); speakText(`I found ${parsed.matchedBikes.length} vehicles.`);
      const outputEl = document.querySelector('#voice-parsed-output');
      if (outputEl) outputEl.innerHTML = `<div class="voice-parsed-card"><strong>User Prompt:</strong> <i>"${parsed.rawText}"</i></div><div class="bike-grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">${parsed.matchedBikes.map(b => `<div class="card" style="padding:10px"><strong>${b.name}</strong><span>${money(b.price)}/day</span></div>`).join('')}</div>`;
    };
    document.querySelectorAll('.sample-voice-chip').forEach(btn => btn.addEventListener('click', () => processPrompt(btn.dataset.prompt)));
  }

  function openModal(html) {
    const root = document.querySelector('.modal-root');
    if (!root) return;
    root.innerHTML = html;
    root.classList.add('open');

    const handleModalClick = (e) => {
      if (e.target === root || e.target.closest('[data-close]') || e.target.closest('.modal-close')) {
        closeModal();
      }
    };

    if (root._modalHandler) {
      root.removeEventListener('click', root._modalHandler);
    }
    root._modalHandler = handleModalClick;
    root.addEventListener('click', handleModalClick);

    root.querySelectorAll('[data-action]').forEach(bindAction);
  }

  function openCommandPalette() {
    openModal(`<div class="modal cmdk-modal"><button class="icon-btn modal-close" data-close>×</button><span class="eyebrow">Quick Navigation & Search</span><input id="cmdk-input" class="catalog-search" style="width:100%;margin:12px 0" placeholder="Type Activa, bike name, or destination..." autofocus><div id="cmdk-results" class="cmdk-results-list"></div></div>`);
    const input = document.querySelector('#cmdk-input'), results = document.querySelector('#cmdk-results'); if (!input || !results) return;
    const update = () => { const q = input.value.trim().toLowerCase(), matchedBikes = bikes.filter(b => b.name.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q)); results.innerHTML = matchedBikes.map(b => `<a href="${bikeHref(b.id)}" class="cmdk-item"><span>${b.name} (${money(b.price)}/day)</span></a>`).join(''); };
    input.addEventListener('input', update); update();
  }

  function open360Viewer(bikeId) {
    const b = getBike(bikeId), imgSrc = bikeImg(b);
    openModal(`<div class="modal"><button class="icon-btn modal-close" data-close>×</button><span class="eyebrow">360° Interactive Inspection</span><h2>${b.name}</h2><div class="viewer-360-container" id="viewer-360"><img src="${imgSrc}" id="viewer-360-img" class="viewer-360-img"><span class="viewer-360-hint">⇄ Drag left or right to rotate vehicle</span></div></div>`);
    let isDragging = false, startX = 0, currentRot = 0; const imgEl = document.querySelector('#viewer-360-img'), container = document.querySelector('#viewer-360');
    if (container && imgEl) {
      container.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX; });
      window.addEventListener('mousemove', (e) => { if (!isDragging) return; const diff = e.clientX - startX; currentRot = (diff * 0.5) % 360; imgEl.style.transform = `rotateY(${currentRot}deg)`; });
      window.addEventListener('mouseup', () => { isDragging = false; });
    }
  }

  function openAIAssistant() {
    openModal(`<div class="modal"><button class="icon-btn modal-close" data-close>×</button><span class="eyebrow">${currentBrand} AI Intelligence</span><h2>AI Ride Assistant</h2><button class="btn btn-primary" id="btn-run-ai" style="width:100%;margin-top:15px">Run AI Recommendation Engine ✨</button></div>`);
    document.querySelector('#btn-run-ai')?.addEventListener('click', () => {
      toast('AI recommendation engine calculated 99% match for your trip profile!');
      closeModal();
    });
  }

  function bindAction(button) {
    button.addEventListener('click', (e) => {
      const action = button.dataset.action, id = button.dataset.id, bName = button.dataset.name;
      if (action === 'expedition-preview') openExpeditionPreviewModal(id);
      if (action === 'why-this-bike') openWhyThisBikeModal(getBike(id));
      if (action === 'verified-info') openVerifiedInfoModal(bName);
      if (action === 'ar-preview') openARPreviewModal(id);
      if (action === 'persona-picker') openRiderProfilePersonaModal();
      if (action === 'weekend-escape') openWeekendEscapeModal();
      if (action === 'quick-book') openQuickBookModeModal();
      if (action === 'avail-alert') openAvailabilityAlertModal(getBike(id));
      if (action === 'wish') {
        const w = wishes(), has = w.includes(id);
        saveWishes(has ? w.filter(x => x !== id) : [...w, id]);
        document.querySelectorAll('[data-id="' + id + '"][data-action="wish"]').forEach(x => { x.textContent = has ? '♡' : '♥'; x.classList.toggle('active', !has); });
        toast(has ? 'Removed from shortlist.' : 'Saved for your next escape.');
        if (page === 'wishlist') render();
      }
      if (action === 'compare') {
        const selected = comparisons(), has = selected.includes(id);
        if (!has && selected.length === 2) return toast('Compare up to two vehicles at a time.');
        const next = has ? selected.filter(x => x !== id) : [...selected, id];
        saveComparisons(next);
        if (next.length < 2) return toast('Select one more vehicle to compare.');
        const [a, b] = next.map(getBike); openAICompareModal(a, b);
      }
      if (action === 'view360') open360Viewer(id);
      if (action === 'ai-assistant') openAIAssistant();
      if (action === 'voice-booking') openVoiceBookingModal();
      if (action === 'build-my-ride') openBuildMyRideModal();
      if (action === 'cmdk') openCommandPalette();
      if (action === 'quick') {
        const b = getBike(id);
        openModal(`<div class="modal"><button class="icon-btn modal-close" data-close>×</button><h2>${b.name}</h2><a class="btn btn-primary" href="${bookHref(b.id)}">Choose Dates →</a></div>`);
      }
      if (action === 'clear') {
        document.querySelectorAll('#filters input').forEach(x => x.checked = false);
        filter();
      }
      if (action === 'filters') openPanel(document.querySelector('#filters'));
      if (action === 'close-filters') closePanels();
      if (action === 'coupon') { updatePriceSummary(.2); toast('20% Promo Applied!'); }
    });
  }

  function renderFleetPagination(totalPages) {
    if (totalPages <= 1) return '';
    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1;
      const active = pageNumber === fleetCurrentPage;
      return `<button class="btn btn-sm ${active ? 'btn-primary' : 'btn-outline'} fleet-page-btn" type="button" data-fleet-page="${pageNumber}" aria-label="Page ${pageNumber}" aria-current="${active ? 'page' : 'false'}">${pageNumber}</button>`;
    }).join('');
    return `<nav class="fleet-pagination" aria-label="Fleet pagination"><button class="btn btn-outline btn-sm fleet-page-btn fleet-page-nav" type="button" data-fleet-page="${fleetCurrentPage - 1}" aria-label="Previous page" ${fleetCurrentPage === 1 ? 'disabled' : ''}>‹ <span>Previous</span></button>${pageButtons}<button class="btn btn-outline btn-sm fleet-page-btn fleet-page-nav" type="button" data-fleet-page="${fleetCurrentPage + 1}" aria-label="Next page" ${fleetCurrentPage === totalPages ? 'disabled' : ''}><span>Next</span> ›</button></nav>`;
  }

  function renderFleetResults(results, emptyMessage = 'No vehicles match your current filter selection.') {
    const catalog = document.querySelector('#catalog');
    const pagination = document.querySelector('#fleet-pagination');
    if (!catalog) return;

    fleetResults = results;
    const totalPages = Math.ceil(results.length / FLEET_ITEMS_PER_PAGE);
    fleetCurrentPage = totalPages ? Math.min(fleetCurrentPage, totalPages) : 1;
    const start = (fleetCurrentPage - 1) * FLEET_ITEMS_PER_PAGE;
    const pageBikes = results.slice(start, start + FLEET_ITEMS_PER_PAGE);

    catalog.innerHTML = pageBikes.length ? pageBikes.map(bikeCard).join('') : `<div class="card empty-state" style="grid-column:1/-1"><h3>${emptyMessage}</h3><button class="btn btn-outline btn-sm" style="margin-top:10px" data-action="clear">Reset All Filters</button></div>`;
    if (pagination) pagination.innerHTML = renderFleetPagination(totalPages);
    catalog.querySelectorAll('[data-action]').forEach(bindAction);
    document.querySelectorAll('[data-fleet-page]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.disabled) return;
        fleetCurrentPage = Number(button.dataset.fleetPage);
        renderFleetResults(fleetResults, emptyMessage);
        document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    primeImages();
  }

  function filter() {
    const catalog = document.querySelector('#catalog'); if (!catalog) return;
    const priceEl = document.querySelector('#price'), max = priceEl ? Number(priceEl.value) : 3500;
    const term = (document.querySelector('#catalog-search')?.value || '').trim().toLowerCase();
    
    // Check selected brand chip
    const activeBrandChip = document.querySelector('.brand-filter-chip.active');
    const selectedBrand = activeBrandChip ? activeBrandChip.dataset.brandFilter : 'All Brands';

    // Check selected riding style chip
    const activeStyleChip = document.querySelector('.riding-style-chip.active');
    const selectedStyle = activeStyleChip ? activeStyleChip.dataset.styleFilter : 'all';

    // Check rating
    const ratingSelect = document.querySelector('#rating');
    const minRating = ratingSelect ? Number(ratingSelect.value) : 0;

    // Check availability
    const availOnly = document.querySelector('#available')?.checked || false;

    // Check category checkboxes
    const catCheckboxes = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
    // Check brand checkboxes
    const brandCheckboxes = Array.from(document.querySelectorAll('.filter-brand:checked')).map(cb => cb.value);
    // Check transmission checkboxes
    const transCheckboxes = Array.from(document.querySelectorAll('.filter-transmission:checked')).map(cb => cb.value);

    let out = bikes.filter((bike) => {
      const matchPrice = bike.price <= max;
      const matchSearch = !term || `${bike.name} ${bike.brand} ${bike.type}`.toLowerCase().includes(term);
      const matchBrandChip = selectedBrand === 'All Brands' || bike.brand === selectedBrand;
      const matchRating = Number(bike.rating) >= minRating;
      const matchAvail = !availOnly || bike.available;
      const matchCatCheck = !catCheckboxes.length || catCheckboxes.includes(bike.type);
      const matchBrandCheck = !brandCheckboxes.length || brandCheckboxes.includes(bike.brand);
      const matchTransCheck = !transCheckboxes.length || transCheckboxes.includes(bike.transmission);
      
      let matchStyle = true;
      if (selectedStyle === 'scooter') matchStyle = bike.type === 'Scooter';
      if (selectedStyle === 'mountain') matchStyle = bike.type === 'Adventure' || (bike.dna && bike.dna.adventure >= 85);
      if (selectedStyle === 'city') matchStyle = bike.type === 'Scooter' || (bike.dna && bike.dna.city >= 88);
      if (selectedStyle === 'cruiser') matchStyle = bike.type === 'Cruiser' || (bike.dna && bike.dna.comfort >= 90);
      if (selectedStyle === 'track') matchStyle = bike.type === 'Sport' || (bike.dna && (bike.dna.bestFor.includes('Track') || bike.dna.bestFor.includes('Supersport')));

      return matchPrice && matchSearch && matchBrandChip && matchRating && matchAvail && matchCatCheck && matchBrandCheck && matchTransCheck && matchStyle;
    });

    // Sort order
    const sortVal = document.querySelector('#sort')?.value || 'popular';
    if (sortVal === 'low') out.sort((a, b) => a.price - b.price);
    if (sortVal === 'high') out.sort((a, b) => b.price - a.price);
    if (sortVal === 'rating') out.sort((a, b) => Number(b.rating) - Number(a.rating));

    const countEl = document.querySelector('#result-count');
    if (countEl) countEl.textContent = `Showing ${out.length} vehicles`;

    fleetCurrentPage = 1;
    renderFleetResults(out);
  }

  function openPanel(panel) {
    if (!panel) return;
    panel.classList.add('open');
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closePanels() {
    document.querySelectorAll('.nav-links.open, #filters.open').forEach((el) => el.classList.remove('open'));
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function syncMobileChrome() {
    const ctaBar = document.querySelector('.mobile-cta');
    if (ctaBar && page === 'details') {
      const bike = getBike(query.get('bike'));
      ctaBar.innerHTML = `<span class="cta-price"><strong>${money(bike.price)}</strong><span>per day</span></span><button type="button" class="btn btn-primary">Reserve →</button>`;
    }
  }

  function primeImages() {
    document.querySelectorAll('img[loading="lazy"]:not(.loaded)').forEach((img) => {
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    });
  }

  const voiceAiLogoSVG = `<svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="voice-ai-logo-svg">
    <rect x="5" y="11" width="2" height="6" rx="1" fill="#38bdf8" class="wave-bar bar-1"/>
    <rect x="8" y="8" width="2" height="12" rx="1" fill="#ffb800" class="wave-bar bar-2"/>
    <rect x="11.5" y="5" width="5" height="10" rx="2.5" fill="url(#ai-mic-core)" />
    <path d="M9.5 12C9.5 14.4853 11.5147 16.5 14 16.5C16.4853 16.5 18.5 14.4853 18.5 12" stroke="url(#ai-mic-core)" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M14 16.5V20.5M11 20.5H17" stroke="url(#ai-mic-core)" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="18" y="8" width="2" height="12" rx="1" fill="#ffb800" class="wave-bar bar-3"/>
    <rect x="21" y="11" width="2" height="6" rx="1" fill="#38bdf8" class="wave-bar bar-4"/>
    <path d="M17.5 4.5L18.2 6.2L19.9 6.9L18.2 7.6L17.5 9.3L16.8 7.6L15.1 6.9L16.8 6.2L17.5 4.5Z" fill="#ffe066"/>
    <defs>
      <linearGradient id="ai-mic-core" x1="11.5" y1="5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fff5cc"/>
        <stop offset="0.4" stop-color="#ffd700"/>
        <stop offset="0.8" stop-color="#ff9900"/>
        <stop offset="1" stop-color="#d97706"/>
      </linearGradient>
    </defs>
  </svg>`;

  function renderFloatingVoiceBtn() {
    let btn = document.querySelector('.voice-booking-float');
    if (!btn) {
      btn = document.createElement('button'); btn.className = 'voice-booking-float catchy-ai-btn'; btn.type = 'button'; btn.dataset.action = 'voice-booking';
      btn.innerHTML = `<span class="ai-live-tag"><span class="live-dot"></span>LIVE AI</span>${voiceAiLogoSVG}<span class="btn-text-wrap"><strong class="btn-title">Voice AI</strong><small class="btn-sub">Speak & Rent 🎙️</small></span>`; document.body.appendChild(btn); bindAction(btn);
    }
  }

  function setupSmartBookingWizard() {
    const form = document.querySelector('#smart-booking-form'); if (!form) return;
    const goToStep = (stepNum) => {
      document.querySelectorAll('.step-panel').forEach(p => p.style.display = 'none');
      const targetPanel = document.querySelector(`#step-panel-${stepNum}`); if (targetPanel) targetPanel.style.display = 'block';
      document.querySelectorAll('#smart-stepper .stepper-item').forEach(item => {
        const s = Number(item.dataset.stepTarget); item.classList.remove('active', 'done');
        if (s === stepNum) item.classList.add('active'); else if (s < stepNum) item.classList.add('done');
      });
      window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    document.querySelector('#btn-to-step-2')?.addEventListener('click', () => goToStep(2));
    document.querySelector('#btn-back-to-step-1')?.addEventListener('click', () => goToStep(1));
    document.querySelector('#btn-to-step-3')?.addEventListener('click', () => goToStep(3));
    document.querySelector('#btn-back-to-step-2')?.addEventListener('click', () => goToStep(2));

    document.querySelectorAll('.extra-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.extra === 'helmet') return;
        card.classList.toggle('selected');
        const toggleIcon = card.querySelector('.extra-toggle'); if (toggleIcon) toggleIcon.textContent = card.classList.contains('selected') ? '✓' : '+';
        updatePriceSummary();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault(); const b = getBike(query.get('bike'));
      openModal(`<div class="modal success"><button class="icon-btn modal-close" data-close>×</button><div class="success-mark">✓</div><span class="eyebrow">Reservation Confirmed</span><h2>See you on the road!</h2><p>Your ${b.name} is reserved. Digital key code sent.</p><a class="btn btn-primary" style="margin-top:20px;width:100%" href="${link('dashboard')}">View Member Dashboard →</a></div>`);
    });
  }

  function setupDestinationsPageInteractions() {
    const grid = document.querySelector('#dest-grid');
    const titleEl = document.querySelector('#dest-section-title');
    const descEl = document.querySelector('#dest-section-desc');
    const badgeEl = document.querySelector('#dest-count-badge');
    const prevArrow = document.querySelector('#dest-page-prev');
    const nextArrow = document.querySelector('#dest-page-next');
    if (!grid) return;

    const updateDestinationsView = () => {
      const counts = getCategoryCounts();
      const meta = destCategoryMeta[currentDestCat] || destCategoryMeta.mountain;
      const filtered = getFilteredDestinations();
      const currentIdx = Math.max(0, DEST_CATEGORIES.indexOf(currentDestCat));

      if (titleEl) titleEl.textContent = meta.title;
      if (descEl) descEl.textContent = meta.subtitle;
      if (badgeEl) badgeEl.textContent = `${filtered.length} ${meta.labelPlural}`;

      // Synchronize category tabs
      document.querySelectorAll('.dest-cat-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.destCat === currentDestCat);
      });

      // Synchronize numbered page buttons
      document.querySelectorAll('.dest-page-num').forEach(numBtn => {
        numBtn.classList.toggle('active', parseInt(numBtn.dataset.destPage) === currentIdx + 1);
      });

      // Synchronize arrow disabled states
      if (prevArrow) prevArrow.disabled = (currentIdx <= 0);
      if (nextArrow) nextArrow.disabled = (currentIdx >= DEST_CATEGORIES.length - 1);

      // Render destination cards
      grid.innerHTML = filtered.length ? filtered.map(renderDestinationCard).join('') : `
        <div class="dest-empty-notice" style="grid-column:1/-1">
          <h3>No routes match this season in ${meta.name}.</h3>
          <p>Try selecting "All Seasons" to view all ${counts[currentDestCat]} routes in this category.</p>
        </div>
      `;

      grid.style.animation = 'none';
      void grid.offsetWidth;
      grid.style.animation = 'destGridFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) both';

      grid.querySelectorAll('[data-action]').forEach(bindAction);
      primeImages();
    };

    // Category chips
    document.querySelectorAll('.dest-cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        currentDestCat = chip.dataset.destCat || 'mountain';
        updateDestinationsView();
      });
    });

    // Numbered page buttons (1, 2, 3, 4)
    document.querySelectorAll('.dest-page-num').forEach(numBtn => {
      numBtn.addEventListener('click', () => {
        const page = parseInt(numBtn.dataset.destPage);
        if (page >= 1 && page <= DEST_CATEGORIES.length) {
          currentDestCat = DEST_CATEGORIES[page - 1];
          updateDestinationsView();
        }
      });
    });

    // Previous Arrow Button (←)
    prevArrow?.addEventListener('click', () => {
      const currentIdx = DEST_CATEGORIES.indexOf(currentDestCat);
      if (currentIdx > 0) {
        currentDestCat = DEST_CATEGORIES[currentIdx - 1];
        updateDestinationsView();
      }
    });

    // Next Arrow Button (→)
    nextArrow?.addEventListener('click', () => {
      const currentIdx = DEST_CATEGORIES.indexOf(currentDestCat);
      if (currentIdx < DEST_CATEGORIES.length - 1) {
        currentDestCat = DEST_CATEGORIES[currentIdx + 1];
        updateDestinationsView();
      }
    });

    // Season chips
    document.querySelectorAll('.dest-season-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.dest-season-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentDestSeason = chip.dataset.destSeason || 'all';
        updateDestinationsView();
      });
    });
  }

  function bind() {
    primeImages(); syncMobileChrome(); renderFloatingVoiceBtn(); setupSmartBookingWizard(); setupTripCostSimulatorListeners(); setupDestinationsPageInteractions(); applyTheme(currentTheme);

    // Header Mobile Navigation Drawer Listeners
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle?.addEventListener('click', (event) => { event.stopPropagation(); openPanel(document.querySelector('.nav-links')); });
    document.querySelectorAll('.mobile-close-btn, .nav-links a').forEach(el => el?.addEventListener('click', closePanels));
    if (document.__ryvonMobileMenuOutside) document.removeEventListener('click', document.__ryvonMobileMenuOutside);
    document.__ryvonMobileMenuOutside = (event) => {
      const menu = document.querySelector('.nav-links');
      if (menu?.classList.contains('open') && !menu.contains(event.target) && !menuToggle?.contains(event.target)) closePanels();
    };
    document.addEventListener('click', document.__ryvonMobileMenuOutside);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePanels(); });

    document.querySelector('.currency-picker-mobile')?.addEventListener('change', (e) => changeCurrency(e.target.value));

    // Theme Toggles
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('rideos-theme', nextTheme);
        applyTheme(nextTheme);
        toast(`Theme set to ${nextTheme === 'dark' ? 'Dark Graphite' : 'Light Ivory'}`);
      });
    });

    // Details Page Gallery Thumbnails
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const mainImg = document.querySelector('#main-gallery img');
        if (mainImg) mainImg.src = thumb.dataset.img;
      });
    });

    // Details Page Tabs
    document.querySelectorAll('.tab-buttons button').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.tab-buttons button').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        const tabKey = tabBtn.dataset.tab, panel = document.querySelector('#tab-panel');
        if (panel) {
          if (tabKey === 'spec') {
            const bike = getBike(query.get('bike'));
            panel.innerHTML = `<div class="specs">${[['Engine',bike.engine],['Power',bike.power],['Torque',bike.torque],['Transmission',bike.transmission],['Seat Height',bike.seat],['Curb Weight',bike.weight],['Top Speed',bike.topSpeed],['Fuel Capacity',bike.fuelCap],['Brakes','Dual ABS / CBS']].map(x=>`<div class="spec"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</div>`;
          } else if (tabKey === 'accessories') {
            panel.innerHTML = `<div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px"><h4 style="margin:0 0 10px">Included Accessories</h4><ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.8"><li>✓ Certified ECE/ISI Helmet</li><li>✓ Smartphone Vibration-Dampened Mount</li><li>✓ 24/7 GPS Live Location Telemetry</li><li>✓ Zero-Deductible Insurance Cover</li></ul></div>`;
          } else {
            panel.innerHTML = `<div style="background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px"><h4 style="margin:0 0 8px">Vehicle Charter</h4><p style="margin:0;font-size:12px;color:var(--ink-soft);line-height:1.6">Inspected with our 32-point diagnostics check within 48 hours. Guaranteed 100% roadworthy condition with full battery & fuel prep.</p></div>`;
          }
        }
      });
    });

    // Mini Booking Form on Detail Page
    const detailForm = document.querySelector('#detail-form');
    if (detailForm) {
      detailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const b = getBike(query.get('bike'));
        const s = detailForm.querySelector('[name=start]')?.value;
        const end = detailForm.querySelector('[name=end]')?.value;
        location.href = `${link('booking')}?bike=${b.id}&start=${s}&end=${end}`;
      });
    }

    // Home Page Hero Search Form
    const searchForm = document.querySelector('#search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = document.querySelector('#city')?.value || 'Bengaluru';
        const cat = document.querySelector('#category')?.value || 'all';
        location.href = `${link('bikes')}?city=${encodeURIComponent(city)}&cat=${encodeURIComponent(cat)}`;
      });
    }

    // User Profile Dropdown Event Bindings
    const avatarBtn = document.querySelector('.user-avatar-btn');
    const dropdownMenu = document.querySelector('.user-dropdown-menu');
    if (avatarBtn && dropdownMenu) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('show');
        dropdownMenu.classList.toggle('show', !isOpen);
        avatarBtn.setAttribute('aria-expanded', !isOpen);
        dropdownMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
      });

      // Keyboard support: Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
          dropdownMenu.classList.remove('show');
          avatarBtn.setAttribute('aria-expanded', 'false');
          dropdownMenu.setAttribute('aria-hidden', 'true');
          avatarBtn.focus();
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Close on clicking outside
      const handleOutsideClick = (e) => {
        if (!avatarBtn.contains(e.target) && !dropdownMenu.contains(e.target) && dropdownMenu.classList.contains('show')) {
          dropdownMenu.classList.remove('show');
          avatarBtn.setAttribute('aria-expanded', 'false');
          dropdownMenu.setAttribute('aria-hidden', 'true');
        }
      };
      document.addEventListener('click', handleOutsideClick);
    }

    // Google / Apple Login Button Interactivity (OAuth Setup Disclaimer)
    document.querySelectorAll('.social-login-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const brand = btn.textContent.trim();
        openModal(`
          <div class="modal auth-disclaimer-modal" style="max-width: 440px; padding: 24px;">
            <button class="icon-btn modal-close" data-close>×</button>
            <span class="eyebrow" style="color: var(--gold, #f59e0b);">✦ CONFIGURATION REQUIRED</span>
            <h3 style="margin: 8px 0 12px; font-family: var(--font-serif);">${brand} Sign-In Offline</h3>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
              Google & Apple ID authentication require a registered OAuth Client ID, redirect URI verification, and a hosted secure server (HTTPS/localhost origin), which are not supported under local <code>file:///</code> protocols.
            </p>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; line-height: 1.5; margin-bottom: 20px;">
              // Configure OAuth client in assets/js/app.js<br>
              // google.accounts.oauth2.initCodeClient({<br>
              //   client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',<br>
              //   scope: 'email profile',<br>
              //   callback: (resp) => handleOAuthCallback(resp)<br>
              // });
            </div>
            <button class="btn btn-gold-solid btn-full modal-close" data-close>Got it, proceed</button>
          </div>
        `);
      });
    });

    // Logout Click Trigger
    document.querySelectorAll('.logout-link').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        toast('Logged out successfully.');
        setTimeout(() => { location.href = link('home'); }, 800);
      });
    });

    // Auth Forms Submission Validation and Persistence
    const authForm = document.querySelector('#auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Remove previous error messages
        document.querySelectorAll('.auth-error-msg').forEach(el => el.remove());
        
        const isLogin = document.body.dataset.page === 'login';
        const emailInput = document.querySelector('#auth-email');
        const passwordInput = document.querySelector('#auth-password');
        const nameInput = document.querySelector('#auth-fullname');
        const rememberCheck = document.querySelector('.remember-check input');
        
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const passwordVal = passwordInput ? passwordInput.value : '';
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const rememberMe = rememberCheck ? rememberCheck.checked : true;
        
        const showError = (msg) => {
          const err = document.createElement('div');
          err.className = 'auth-error-msg';
          err.style.color = '#ef4444';
          err.style.fontSize = '12px';
          err.style.marginTop = '12px';
          err.style.textAlign = 'center';
          err.style.fontWeight = '600';
          err.textContent = msg;
          authForm.appendChild(err);
        };
        
        if (!emailVal || !passwordVal) {
          showError('Please fill in all required fields.');
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
          showError('Please enter a valid email address.');
          return;
        }
        
        const users = getUsers();
        
        if (isLogin) {
          // LOGIN FLOW
          const user = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase());
          if (!user) {
            showError('Account not found. Please register or check your credentials.');
            return;
          }
          
          if (user.password !== passwordVal) {
            showError('Incorrect password. Please try again.');
            return;
          }
          
          // Successful Login
          saveAuthUser(user, rememberMe);
          migrateGuestData(user);
          toast('Welcome back, ' + displayName(user) + '!');
          setTimeout(() => { location.href = link('dashboard'); }, 800);
          
        } else {
          // REGISTRATION FLOW
          if (!nameVal) {
            showError('Please enter your full name.');
            return;
          }
          
          if (passwordVal.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
          }
          
          const userExists = users.some(u => u.email.toLowerCase() === emailVal.toLowerCase());
          if (userExists) {
            showError('An account with this email is already registered.');
            return;
          }
          
          // Create User
          const newUser = {
            name: nameVal,
            email: emailVal.toLowerCase(),
            password: passwordVal,
            avatar: '', // initially letter initial
            licenseNumber: '',
            phone: '',
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            completedTrips: 0,
            activeReservations: 0,
            points: 0,
            safetyScore: 100
          };
          
          users.push(newUser);
          localStorage.setItem('ryvon-users', JSON.stringify(users));
          
          // Authenticate session
          saveAuthUser(newUser, true);
          migrateGuestData(newUser);
          toast('Registration successful! Welcome to RYVON.');
          setTimeout(() => { location.href = link('dashboard'); }, 800);
        }
      });
    }

    // Profile Form Submission Handler
    const profileForm = document.querySelector('#profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getAuthUser();
        if (!user) return;
        
        const nameInput = document.querySelector('#profile-name');
        const phoneInput = document.querySelector('#profile-phone');
        const licenseInput = document.querySelector('#profile-license');
        const avatarInput = document.querySelector('#profile-avatar-url');
        
        const newName = nameInput ? nameInput.value.trim() : user.name;
        const newPhone = phoneInput ? phoneInput.value.trim() : user.phone;
        const newLicense = licenseInput ? licenseInput.value.trim() : user.licenseNumber;
        const newAvatar = avatarInput ? avatarInput.value.trim() : user.avatar;
        
        if (!newName) {
          toast('Name cannot be empty.');
          return;
        }
        
        user.name = newName;
        user.phone = newPhone;
        user.licenseNumber = newLicense;
        user.avatar = newAvatar;
        
        // Save to active session (respecting current storage type)
        const rememberMe = localStorage.getItem(AUTH_USER_KEY) !== null;
        saveAuthUser(user, rememberMe);
        
        // Update user database
        const users = getUsers();
        const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (idx !== -1) {
          users[idx].name = newName;
          users[idx].phone = newPhone;
          users[idx].licenseNumber = newLicense;
          users[idx].avatar = newAvatar;
          localStorage.setItem('ryvon-users', JSON.stringify(users));
        }
        
        toast('Profile updated successfully!');
        render();
      });
    }

    // Contact Page Form Handler
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.querySelector('#contact-name');
        const name = nameInput ? nameInput.value.trim() : 'Rider';
        toast(`Thank you, ${name}! Your dispatch request has been received by 24/7 Ride Command.`);
        contactForm.reset();
      });
    }

    // Accordion FAQ Items
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const ans = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // Close all other open items
        document.querySelectorAll('.faq-item').forEach(other => {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-question');
          const otherAns = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = '0';
        });

        // If it was closed, open it; if it was open, it's now closed
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          if (ans) ans.style.maxHeight = (ans.scrollHeight + 20) + 'px';
        }
      });
    });

    // Brand Filter Chips
    document.querySelectorAll('.brand-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.brand-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filter();
      });
    });

    // Riding Style Chips
    document.querySelectorAll('.riding-style-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.riding-style-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filter();
      });
    });


    // Route Personality Chips
    document.querySelectorAll('.route-personality-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.route-personality-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        toast(`Route personality selected: ${chip.dataset.route}`);
      });
    });

    // Natural Language Search Engine
    const nlInput = document.querySelector('#nl-search-input');
    const nlBtn = document.querySelector('#nl-search-btn');
    const catalogEl = document.querySelector('#catalog');
    const parsedBox = document.querySelector('#ai-parsed-intent-box');

    const executeNLSearch = (promptStr) => {
      if (!promptStr || !promptStr.trim()) return;
      const res = parseNaturalLanguageQuery(promptStr);
      speakText(`Found ${res.filtered.length} vehicles matching your request.`);
      
      if (parsedBox) {
        parsedBox.innerHTML = `<div class="ai-parsed-intent-banner">
          <span>💡 <strong>AI Parsed Intent:</strong> ${res.summary}</span>
          <span style="font-size:11px;color:var(--lime-dark)">Showing ${res.filtered.length} Matches</span>
        </div>`;
      }

      if (catalogEl) {
        const countEl = document.querySelector('#result-count');
        if (countEl) countEl.textContent = `Showing ${res.filtered.length} vehicles`;
        fleetCurrentPage = 1;
        renderFleetResults(res.filtered, 'No vehicles match your AI request.');
      }
    };

    // Cinematic home hero carousel: keyboard, arrows, auto-advance, and intentional touch swipes.
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
      const track = heroCarousel.querySelector('.hero-carousel-track');
      const slides = Array.from(heroCarousel.querySelectorAll('.hero-slide'));
      const dots = Array.from(document.querySelectorAll('.hero-carousel-dot'));
      let activeSlide = 0;
      let startX = null;
      let timer;
      const goToSlide = (next) => {
        activeSlide = (next + slides.length) % slides.length;
        track.style.transform = `translate3d(${-activeSlide * 100}%, 0, 0)`;
        dots.forEach((dot, index) => {
          const isActive = index === activeSlide;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', String(isActive));
        });
      };
      const restartAuto = () => {
        window.clearInterval(timer);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = window.setInterval(() => goToSlide(activeSlide + 1), 6500);
      };
      document.querySelector('.hero-carousel-next')?.addEventListener('click', () => { goToSlide(activeSlide + 1); restartAuto(); });
      document.querySelector('.hero-carousel-prev')?.addEventListener('click', () => { goToSlide(activeSlide - 1); restartAuto(); });
      dots.forEach((dot, index) => dot.addEventListener('click', () => { goToSlide(index); restartAuto(); }));
      // Handle click events on trip chips to switch slides
      const tripChips = Array.from(document.querySelectorAll('.quick-trip-chips .trip-chip'));
      if (tripChips.length >= 3) {
        tripChips.forEach((chip, index) => {
          if (index < 3) {
            chip.addEventListener('click', () => {
              goToSlide(index);
              restartAuto();
            });
          }
        });
      }
      heroCarousel.addEventListener('pointerdown', (event) => { startX = event.clientX; }, { passive: true });
      heroCarousel.addEventListener('pointerup', (event) => {
        if (startX === null) return;
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 48) { goToSlide(activeSlide + (distance < 0 ? 1 : -1)); restartAuto(); }
        startX = null;
      }, { passive: true });
      heroCarousel.addEventListener('pointercancel', () => { startX = null; }, { passive: true });
      document.addEventListener('keydown', (event) => {
        if (!heroCarousel.matches(':hover') || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight') { goToSlide(activeSlide + 1); restartAuto(); }
        if (event.key === 'ArrowLeft') { goToSlide(activeSlide - 1); restartAuto(); }
      });
      restartAuto();
    }

    // Hero Photo Switcher
    document.querySelectorAll('.hero-photo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.hero-photo-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const heroEl = document.querySelector('.hero');
        if (heroEl) {
          heroEl.style.setProperty('--hero-bg-url', `url("${chip.dataset.bg}")`);
        }
      });
    });

    if (nlBtn && nlInput) {
      nlBtn.addEventListener('click', () => executeNLSearch(nlInput.value));
      nlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') executeNLSearch(nlInput.value); });
    }

    document.querySelectorAll('.nl-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.nl;
        if (nlInput) nlInput.value = val;
        executeNLSearch(val);
      });
    });

    // Map Node Pins
    document.querySelectorAll('[data-map-pin]').forEach(pin => {
      pin.addEventListener('click', () => {
        const k = pin.dataset.mapPin; openIndiaMapPinModal(k);
      });
    });

    // Client-side live countdown timer initialization
    const countdownVal = document.querySelector('.countdown-timer-value');
    if (countdownVal) {
      if (window.__countdownIntervalId) {
        window.clearInterval(window.__countdownIntervalId);
      }
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      targetDate.setHours(targetDate.getHours() + 14);
      targetDate.setMinutes(targetDate.getMinutes() + 38);
      targetDate.setSeconds(targetDate.getSeconds() + 42);
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        if (distance < 0) {
          countdownVal.textContent = "Ride Started!";
          window.clearInterval(window.__countdownIntervalId);
          window.__countdownIntervalId = null;
          return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((distance % (1000 * 60)) / 1000);
        countdownVal.innerHTML = `
          <div class="countdown-unit">
            <span class="countdown-num">${days}</span>
            <span class="countdown-lbl">DAYS</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-num">${hours.toString().padStart(2, '0')}</span>
            <span class="countdown-lbl">HOURS</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-num">${mins.toString().padStart(2, '0')}</span>
            <span class="countdown-lbl">MINS</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-num">${secs.toString().padStart(2, '0')}</span>
            <span class="countdown-lbl">SECS</span>
          </div>
        `;
      };
      updateTimer();
      window.__countdownIntervalId = window.setInterval(updateTimer, 1000);
    }

    // Packing Checklist items
    document.querySelectorAll('.packing-check-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('done');
        const isDone = item.classList.contains('done');
        const circle = item.querySelector('.packing-check-circle');
        const status = item.querySelector('.packing-status-badge');
        if (circle) {
          circle.textContent = isDone ? '✓' : '';
        }
        if (status) {
          status.textContent = isDone ? 'Done' : 'Pending';
          status.className = `packing-status-badge ${isDone ? 'done' : 'pending'}`;
        }
        const totalDone = document.querySelectorAll('.packing-check-item.done').length;
        const countBadge = document.querySelector('#packing-count-badge');
        if (countBadge) {
          countBadge.textContent = `${totalDone} / 8 Completed`;
        }
        const barFill = document.querySelector('.packing-progress-bar-fill');
        if (barFill) {
          barFill.style.width = `${(totalDone / 8) * 100}%`;
        }
      });
    });

    // SOS Hold Button
    const sosBtn = document.querySelector('#sos-btn');
    if (sosBtn) {
      let holdTimer = null, count = 0; const fill = document.querySelector('#sos-fill');
      const startHold = () => { count = 0; holdTimer = setInterval(() => { count += 10; if (fill) fill.style.width = count + '%'; if (count >= 100) { clearInterval(holdTimer); if (fill) fill.style.width = '0%'; openSOSEmergencyModal(); } }, 30); };
      const endHold = () => { clearInterval(holdTimer); if (fill) fill.style.width = '0%'; };
      sosBtn.addEventListener('mousedown', startHold); sosBtn.addEventListener('mouseup', endHold); sosBtn.addEventListener('mouseleave', endHold); sosBtn.addEventListener('touchstart', startHold); sosBtn.addEventListener('touchend', endHold);
    }

    // Currency Switcher
    const changeCurrency = (val) => { currentCurrency = val; localStorage.setItem('rideos-currency', currentCurrency); render(); toast(`Currency set to ${currentCurrency}`); };

    document.querySelector('#currency-picker')?.addEventListener('change', (e) => changeCurrency(e.target.value));
    document.querySelector('#voice-search-btn')?.addEventListener('click', openVoiceBookingModal);

    // Filters Controls
    document.querySelector('#price')?.addEventListener('input', filter);
    document.querySelector('#catalog-search')?.addEventListener('input', filter);
    document.querySelector('#sort')?.addEventListener('change', filter);
    document.querySelector('#rating')?.addEventListener('change', filter);
    document.querySelector('#available')?.addEventListener('change', filter);
    document.querySelectorAll('.filter-type, .filter-brand, .filter-transmission').forEach(cb => cb.addEventListener('change', filter));

    // View Switch buttons
    document.querySelectorAll('.view-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const isList = btn.dataset.view === 'list';
        const catalog = document.querySelector('#catalog');
        if (catalog) {
          if (isList) {
            catalog.style.gridTemplateColumns = '1fr';
          } else {
            catalog.style.gridTemplateColumns = '';
          }
        }
      });
    });

    document.querySelectorAll('[data-action]').forEach(bindAction);
    if (page === 'bikes' && document.querySelector('#catalog')) renderFleetResults(bikes);
  }

  function render() {
    if (window.__countdownIntervalId) {
      window.clearInterval(window.__countdownIntervalId);
      window.__countdownIntervalId = null;
    }
    page = document.body ? (document.body.dataset.page || 'home') : 'home';
    const headerEl = document.querySelector('#site-header'); if (headerEl) { headerEl.className='site-header'; headerEl.innerHTML=header(); }
    const footerEl = document.querySelector('#site-footer'); if (footerEl) { footerEl.className='site-footer'; footerEl.innerHTML=footer(); }
    const appEl = document.querySelector('#app');
    // index.html owns its hand-crafted homepage markup. Do not replace it with the legacy JS template.
    if (appEl && !(page === 'home' && appEl.dataset.staticHome === 'true')) {
      appEl.innerHTML = (pages[page] || home)();
    }
    bind();
  }

  function initPreloader() {
    const loader = document.getElementById('ryvon-loader');
    if (!loader) return;

    const isHome = document.body.dataset.page === 'home';
    const minActiveTime = isHome ? 2200 : 1700; // 2.2s for home, 1.7s for subpages
    const fadeDuration = isHome ? 600 : 500;    // 0.6s for home, 0.5s for subpages

    setTimeout(() => {
      loader.classList.add('fade-out');
      loader.style.transition = 'opacity ' + (fadeDuration / 1000) + 's ease-in-out, visibility ' + (fadeDuration / 1000) + 's ease-in-out';
      setTimeout(() => {
        loader.remove();
      }, fadeDuration);
    }, minActiveTime);
  }

  function guardRoute() {
    const loggedIn = !!getAuthUser();
    const protectedPages = ['dashboard', 'history', 'profile', 'wishlist'];
    const authPages = ['login', 'register'];
    const currentPage = document.body ? (document.body.dataset.page || 'home') : 'home';
    
    if (protectedPages.includes(currentPage) && !loggedIn) {
      location.href = link('login');
      return false;
    }
    if (authPages.includes(currentPage) && loggedIn) {
      location.href = link('dashboard');
      return false;
    }
    return true;
  }

  function initApp() {
    initPreloader();
    try {
      if (guardRoute()) {
        render();
      }
    } catch (err) {
      console.error('RYVON application initialization error:', err);
      // Failsafe: ensure preloader is dismissed on error so page is usable
      const loader = document.getElementById('ryvon-loader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 400);
      }
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initApp); } else { initApp(); }
})();
