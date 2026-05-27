/* ─────────────────────────────────────────────────────────
   data.js — All questions, neighborhoods, static data
   ───────────────────────────────────────────────────────── */

var QUESTIONS = [
  /* ── Part 1 · Vibe & Space ── */
  {
    key: 'occupants',
    category: 'The Squad & The Zoo',
    question: "Who's joining you on this adventure?",
    type: 'radio',
    options: [
      { value: 'solo',     label: 'Just me',              hint: 'Flying solo' },
      { value: 'partner',  label: 'Me + partner',         hint: null },
      { value: 'roommate', label: 'Me + roommates',       hint: null },
      { value: 'family',   label: 'Family (kids included)', hint: null },
    ]
  },
  {
    key: 'pets',
    category: 'The Squad & The Zoo',
    question: "Any furry, feathered, or scaly roommates?",
    type: 'radio_cond',
    condType: 'dogDetails',
    options: [
      { value: 'none',  label: 'Nope, pet-free', hint: null },
      { value: 'dog',   label: 'Dog',            hint: 'Toronto condos can be strict — breed & weight matter!' },
      { value: 'cat',   label: 'Cat',            hint: null },
      { value: 'other', label: 'Other (birds, fish…)', hint: null },
    ]
  },
  {
    key: 'wfhStyle',
    category: 'The Footprint',
    question: "How do you use your space?",
    type: 'radio',
    options: [
      { value: 'office',  label: 'Office 5 days a week',  hint: 'Home is for living, not working' },
      { value: 'desk',    label: 'Work from home / hybrid', hint: 'I need a dedicated workspace' },
      { value: 'commute', label: 'Always on the move',    hint: 'Home is base camp' },
    ]
  },
  {
    key: 'bedrooms',
    category: 'The Footprint',
    question: "Based on that, how many bedrooms are we hunting for?",
    type: 'pills',
    options: [
      { value: 'studio', label: 'Studio' },
      { value: '1b',     label: '1 Bed'  },
      { value: '1b1d',   label: '1+Den'  },
      { value: '2b',     label: '2 Bed'  },
      { value: '3b',     label: '3+ Bed' },
    ]
  },
  {
    key: 'sqft',
    category: 'The Footprint',
    question: "Square footage expectations?",
    type: 'radio',
    options: [
      { value: 'small',  label: 'Compact & cozy', hint: 'Under 600 sq ft' },
      { value: 'medium', label: 'Mid-size',        hint: '600–900 sq ft'   },
      { value: 'large',  label: 'Spacious',        hint: '900+ sq ft'      },
    ]
  },
  {
    key: 'archStyle',
    category: 'The Architecture',
    question: "What's your architectural aesthetic?",
    type: 'radio',
    options: [
      { value: 'modern',    label: 'Modern / Contemporary', hint: 'Clean lines, glass, steel' },
      { value: 'character', label: 'Character / Heritage',  hint: 'Exposed brick, original details' },
      { value: 'townhouse', label: 'Townhouse',             hint: 'Multi-level with outdoor space' },
      { value: 'loft',      label: 'Industrial Loft',       hint: 'High ceilings, open concept' },
    ]
  },
  {
    key: 'slidingDoors',
    category: 'The Architecture',
    question: "The Great Toronto Condo Debate: how do you feel about glass sliding doors for bedrooms?",
    type: 'radio',
    options: [
      { value: 'love',     label: 'Love them',     hint: 'Open concept all day' },
      { value: 'hate',     label: 'Hard no',       hint: 'I need solid walls and real privacy' },
      { value: 'whatever', label: 'Whatever works', hint: 'Not a dealbreaker either way' },
    ]
  },
  {
    key: 'neighborhoods',
    category: 'Your Turf',
    question: "Where is your turf? Name your top 3 target neighbourhoods.",
    type: 'neighborhoods',
    hint: 'Select up to 3'
  },
  {
    key: 'transit',
    category: 'Your Turf',
    question: "How allergic are you to a commute?",
    type: 'radio',
    options: [
      { value: 'subway', label: 'Subway only',       hint: 'Max 5 min walk to a station' },
      { value: 'bus',    label: 'TTC is fine',        hint: 'Buses and streetcars work for me' },
      { value: 'drive',  label: 'I drive everywhere', hint: 'Parking is non-negotiable' },
    ]
  },
  {
    key: 'amenities',
    category: 'Your Turf',
    question: "Your 'Cheat Codes' for living — what are your must-have amenities?",
    type: 'chips_fixed',
    options: [
      { value: 'gym',        label: 'Gym' },
      { value: 'concierge',  label: 'Concierge' },
      { value: 'pool',       label: 'Pool' },
      { value: 'rooftop',    label: 'Rooftop' },
      { value: 'cowork',     label: 'Co-working' },
    ]
  },
  {
    key: 'monthlyBudget',
    category: 'The Bottom Line',
    question: "What is your absolute maximum monthly budget?",
    type: 'slider',
    min: 1500, max: 6000, step: 50, defaultVal: 2500,
    format: function(v) { return '$' + v.toLocaleString() + '/mo'; }
  },
  {
    key: 'dealbreakers',
    category: 'The Bottom Line',
    question: "Any absolute dealbreakers we should avoid like the plague?",
    type: 'textarea',
    placeholder: 'e.g. No carpet, no basement, must have in-suite laundry, no co-signers…'
  },

  /* ── Part 2 · Reality Check ── */
  {
    key: 'exitStrategy',
    category: 'Timeline & Tactics',
    question: "Toronto landlords move fast. What's your current exit strategy?",
    type: 'radio',
    options: [
      { value: 'notice60', label: 'Giving 60+ days notice', hint: 'Already in motion' },
      { value: 'm2m',      label: 'Month-to-month',         hint: 'I can leave anytime' },
      { value: 'nonotice', label: 'No notice yet',          hint: null, flagKey: true },
    ]
  },
  {
    key: 'leaseDuration',
    category: 'Timeline & Tactics',
    question: "How long are we dropping anchor?",
    type: 'radio',
    options: [
      { value: '1yr',   label: '1 Year',                    hint: 'Standard Toronto lease' },
      { value: 'short', label: 'Short-term (less than a year)', hint: null, flagKey: true },
    ]
  },
  {
    key: 'firstRodeo',
    category: 'Timeline & Tactics',
    question: "Is this your first rodeo in the Toronto rental market?",
    type: 'radio',
    options: [
      { value: 'yes', label: "Yep, first time",       hint: "Welcome! It's a wild ride" },
      { value: 'no',  label: "Nope, been around",     hint: "You know how this goes" },
    ]
  },
  {
    key: 'exclusivity',
    category: 'Timeline & Tactics',
    question: "Are we exclusive?",
    type: 'radio',
    options: [
      { value: 'exclusive', label: "Yes, you're my agent",    hint: "Let's do this together" },
      { value: 'shopping',  label: "Still looking around",    hint: null, flagKey: true },
    ]
  },
  {
    key: 'immigrationStatus',
    category: 'The Paper Trail',
    question: "Status in Canada?",
    type: 'radio_cond',
    condType: 'visaExpiry',
    options: [
      { value: 'citizen',     label: 'Canadian Citizen / PR', hint: null },
      { value: 'workpermit',  label: 'Work Permit',            hint: null, cond: true },
      { value: 'studentvisa', label: 'Student Visa',           hint: null, cond: true },
    ]
  },
  {
    key: 'combinedSalary',
    category: 'The Paper Trail',
    question: "Fueling the lifestyle: what is the combined total base salary of everyone on the lease?",
    type: 'slider',
    min: 30000, max: 400000, step: 5000, defaultVal: 80000,
    format: function(v) { return '$' + Math.round(v / 1000) + 'k/yr'; }
  },
  {
    key: 'employmentStatus',
    category: 'The Paper Trail',
    question: "The Career Check: are you currently on probation, starting a new job, or on a fixed-term contract?",
    type: 'radio_cond',
    condType: 'contractEndDate',
    options: [
      { value: 'permanent', label: 'Permanent / Full-time',    hint: 'Rock solid' },
      { value: 'newjob',    label: 'Starting a new job soon',  hint: null, flagKey: true },
      { value: 'contract',  label: 'Fixed-term contract',      hint: null, flagKey: true, cond: true },
    ]
  },
  {
    key: 'creditScore',
    category: 'The Paper Trail',
    question: "The Adulting Score: do you know your Canadian credit score?",
    type: 'radio',
    options: [
      { value: '700plus',    label: '700+',       hint: 'Excellent — landlords love you' },
      { value: '600to699',   label: '600–699',    hint: 'Good to go' },
      { value: 'under600',   label: 'Under 600',  hint: null, flagKey: true },
    ]
  },

  /* ── Part 3 · Day-to-Day Reality ── */
  {
    key: 'sunlight',
    category: 'Sensory & Environment',
    question: "What is your relationship with sunlight?",
    type: 'radio',
    options: [
      { value: 'dark',  label: 'Give me the cave',        hint: 'I work nights / prefer shade' },
      { value: 'south', label: 'Sun worshipper',           hint: 'South-facing, maximum light' },
      { value: 'east',  label: 'Morning light is enough', hint: 'East or west-facing is perfect' },
    ]
  },
  {
    key: 'noiseTolerance',
    category: 'Sensory & Environment',
    question: "Rate your city noise tolerance.",
    type: 'radio',
    options: [
      { value: 'silent', label: 'Dead quiet only',      hint: 'I can hear a pin drop' },
      { value: 'normal', label: 'City ambient is fine', hint: "Traffic noise doesn't bother me" },
      { value: 'loud',   label: 'Bring it on',          hint: 'I can sleep through a concert' },
    ]
  },
  {
    key: 'thermostat',
    category: 'Sensory & Environment',
    question: "The Thermostat Wars: how do you run?",
    type: 'radio',
    options: [
      { value: 'hot',     label: 'Always cold',    hint: 'Crank the heat year-round' },
      { value: 'cold',    label: 'Always hot',     hint: 'AC is non-negotiable' },
      { value: 'neutral', label: 'Happy medium',   hint: 'Whatever the season brings' },
    ]
  },
  {
    key: 'culinary',
    category: 'Spatial Footprint',
    question: "What is your culinary persona?",
    type: 'radio',
    options: [
      { value: 'chef',      label: 'Home chef',        hint: 'I need real counter space and good appliances' },
      { value: 'assembler', label: 'I assemble meals', hint: 'Microwave + toaster does the job' },
      { value: 'ubereats',  label: 'UberEats VIP',     hint: 'Kitchen is purely decorative' },
    ]
  },
  {
    key: 'bulkyBaggage',
    category: 'Spatial Footprint',
    question: "What bulky baggage is moving with you?",
    type: 'chips_fixed',
    options: [
      { value: 'light',    label: 'Travelling light'  },
      { value: 'bike',     label: 'Bike(s)'           },
      { value: 'sports',   label: 'Sports gear'       },
      { value: 'wardrobe', label: 'Oversized wardrobe'},
    ]
  },
  {
    key: 'deliveries',
    category: 'Daily Rhythm',
    question: "How heavy is your delivery footprint?",
    type: 'radio',
    options: [
      { value: 'daily',      label: 'Daily packages',     hint: 'I basically live on Amazon' },
      { value: 'occasional', label: 'A few times a week', hint: 'The standard modern human' },
      { value: 'rarely',     label: 'Rarely',             hint: 'I prefer to shop in person' },
    ]
  },
  {
    key: 'morningRoutine',
    category: 'Daily Rhythm',
    question: "What's the most crucial part of your morning routine?",
    type: 'radio',
    options: [
      { value: 'shower', label: 'Long shower',       hint: 'Hot water pressure is everything' },
      { value: 'coffee', label: 'Coffee ritual',     hint: 'I need proper kitchen time' },
      { value: 'gym',    label: 'Morning workout',   hint: 'Building gym is a dealbreaker' },
      { value: 'out',    label: 'Out the door fast', hint: '5 minutes flat' },
    ]
  },
  {
    key: 'saturdayVibe',
    category: 'Social Battery & Community',
    question: "It's a Saturday night. What's the vibe?",
    type: 'radio',
    options: [
      { value: 'host',     label: 'Hosting at mine',   hint: 'I need space for people' },
      { value: 'out',      label: 'Out on the town',   hint: 'Walk to restaurants and bars' },
      { value: 'recharge', label: 'Solo recharge',     hint: 'Cozy night in, just me' },
    ]
  },
  {
    key: 'thirdSpace',
    category: 'Social Battery & Community',
    question: "Besides home and work, where is your 'Third Space'?",
    type: 'radio',
    options: [
      { value: 'gym',   label: 'The gym'            },
      { value: 'parks', label: 'Parks & outdoors'   },
      { value: 'bars',  label: 'Bars & restaurants' },
      { value: 'cafes', label: 'Coffee shops'       },
    ]
  },
];

/* ── SCREENS array (31 items: 0-30) ───────────────────────── */
var SCREENS = [
  // Part 1 (0-11)
  { type: 'question', qIdx: 0  },
  { type: 'question', qIdx: 1  },
  { type: 'question', qIdx: 2  },
  { type: 'question', qIdx: 3  },
  { type: 'question', qIdx: 4  },
  { type: 'question', qIdx: 5  },
  { type: 'question', qIdx: 6  },
  { type: 'question', qIdx: 7  },
  { type: 'question', qIdx: 8  },
  { type: 'question', qIdx: 9  },
  { type: 'question', qIdx: 10 },
  { type: 'question', qIdx: 11 },
  // Transition 1 (12)
  { type: 'transition', tIdx: 0 },
  // Part 2 (13-20)
  { type: 'question', qIdx: 12 },
  { type: 'question', qIdx: 13 },
  { type: 'question', qIdx: 14 },
  { type: 'question', qIdx: 15 },
  { type: 'question', qIdx: 16 },
  { type: 'question', qIdx: 17 },
  { type: 'question', qIdx: 18 },
  { type: 'question', qIdx: 19 },
  // Transition 2 (21)
  { type: 'transition', tIdx: 1 },
  // Part 3 (22-30)
  { type: 'question', qIdx: 20 },
  { type: 'question', qIdx: 21 },
  { type: 'question', qIdx: 22 },
  { type: 'question', qIdx: 23 },
  { type: 'question', qIdx: 24 },
  { type: 'question', qIdx: 25 },
  { type: 'question', qIdx: 26 },
  { type: 'question', qIdx: 27 },
  { type: 'question', qIdx: 28 },
];

/* ── Transitions config ────────────────────────────────────── */
var TRANSITIONS = [
  {
    partNum: 1,
    title: "Now for the Reality Check",
    desc: "Great foundation. Now let's make sure we can deliver on it. A few questions on your timeline, paperwork, and financial profile.",
    nextPartLabel: "Part 2 · Reality Check",
    icon: "📋"
  },
  {
    partNum: 2,
    title: "Almost there — Day-to-Day Reality",
    desc: "Last stretch. These final questions dial in the small details that separate a fine apartment from your actual home.",
    nextPartLabel: "Part 3 · Day-to-Day Reality",
    icon: "🌅"
  },
];

/* ── Category AI messages ──────────────────────────────────── */
var CATEGORY_MESSAGES = {
  "The Squad & The Zoo":        "Learning who's coming with you...",
  "The Footprint":              "Mapping your ideal space...",
  "The Architecture":           "Noting your style preferences...",
  "Your Turf":                  "Locating your neighbourhood...",
  "The Bottom Line":            "Setting your budget range...",
  "Timeline & Tactics":         "Checking your move readiness...",
  "The Paper Trail":            "Reviewing your application...",
  "Sensory & Environment":      "Capturing your comfort needs...",
  "Spatial Footprint":          "Understanding your storage...",
  "Daily Rhythm":               "Learning your daily patterns...",
  "Social Battery & Community": "Understanding your lifestyle...",
};

/* ── Flag messages ─────────────────────────────────────────── */
var FLAG_MESSAGES = {
  exitStrategy: {
    nonotice: "Heads up — if you want to move next month, we need to talk about your current lease. Let's make sure you're not breaking it by mistake."
  },
  leaseDuration: {
    short: "Short-term is incredibly difficult in the standard market. We may need furnished/serviced options — which are significantly pricier."
  },
  exclusivity: {
    shopping: "Totally fine! To protect both of us, let's get a brief representation agreement signed before we start booking showings."
  },
  employmentStatus: {
    newjob:   "This can make landlords nervous. Let's talk about whether a guarantor or extra upfront rent months would help.",
    contract: "This can make landlords nervous. Let's talk about whether a guarantor or extra upfront rent months would help."
  },
  creditScore: {
    under600: "No worries — a guarantor or prepaying 2–3 months of rent is done all the time. Let's talk options."
  },
};

/* ── Toronto Neighbourhood scores (static JSON) ─────────────── */
var NEIGHBORHOOD_SCORES = {
  "Roncesvalles":      { transit: 80, parks: 84, quiet: 65, dining: 78, safety: 85 },
  "High Park":         { transit: 72, parks: 96, quiet: 74, dining: 58, safety: 87 },
  "Junction":          { transit: 74, parks: 62, quiet: 60, dining: 72, safety: 78 },
  "Leslieville":       { transit: 76, parks: 72, quiet: 62, dining: 85, safety: 82 },
  "Riverdale":         { transit: 78, parks: 88, quiet: 68, dining: 70, safety: 84 },
  "Kensington":        { transit: 86, parks: 55, quiet: 30, dining: 92, safety: 68 },
  "Little Italy":      { transit: 82, parks: 60, quiet: 52, dining: 88, safety: 76 },
  "Dundas West":       { transit: 84, parks: 58, quiet: 50, dining: 80, safety: 74 },
  "Bloorcourt":        { transit: 88, parks: 62, quiet: 55, dining: 78, safety: 78 },
  "Trinity Bellwoods": { transit: 82, parks: 80, quiet: 48, dining: 90, safety: 76 },
  "Parkdale":          { transit: 80, parks: 65, quiet: 45, dining: 74, safety: 68 },
  "Corktown":          { transit: 78, parks: 65, quiet: 52, dining: 80, safety: 80 },
  "Cabbagetown":       { transit: 76, parks: 70, quiet: 68, dining: 68, safety: 82 },
  "Annex":             { transit: 90, parks: 76, quiet: 58, dining: 86, safety: 84 },
  "Harbord Village":   { transit: 84, parks: 68, quiet: 60, dining: 82, safety: 82 },
  "Ossington":         { transit: 82, parks: 56, quiet: 40, dining: 92, safety: 74 },
  "King West":         { transit: 88, parks: 48, quiet: 28, dining: 95, safety: 76 },
  "Liberty Village":   { transit: 82, parks: 62, quiet: 42, dining: 84, safety: 80 },
  "Distillery District": { transit: 75, parks: 68, quiet: 55, dining: 86, safety: 83 },
  "Yorkville":         { transit: 92, parks: 70, quiet: 64, dining: 94, safety: 91 },
  "Canary District":   { transit: 72, parks: 88, quiet: 68, dining: 66, safety: 87 },
};

var NEIGHBORHOOD_SCORES_DEFAULT = { transit: 78, parks: 68, quiet: 55, dining: 78, safety: 80 };

/* ── Toronto neighbourhood list ───────────────────────────── */
var NEIGHBORHOODS = [
  "Roncesvalles","High Park","Junction","Leslieville","Riverdale",
  "Kensington","Little Italy","Dundas West","Bloorcourt","Trinity Bellwoods",
  "Parkdale","Corktown","Cabbagetown","Annex","Harbord Village",
  "Ossington","King West","Liberty Village","Distillery District",
  "Yorkville","Canary District"
];

/* ── Bedroom type details for Slide 2 ────────────────────────── */
var BEDROOM_DETAILS = {
  studio: { typeName: 'Studio',      size: '~420 sq ft' },
  '1b':   { typeName: '1 Bedroom',   size: '~580 sq ft' },
  '1b1d': { typeName: '1 Bed + Den', size: '~680 sq ft' },
  '2b':   { typeName: '2 Bedrooms',  size: '~850 sq ft' },
  '3b':   { typeName: '3+ Bedrooms', size: '~1,100 sq ft' },
};
