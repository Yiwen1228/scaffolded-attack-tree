import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:5000';

const SYNONYMS = {
  "Steal Credentials": ["steal credentials", "credential theft", "steal password", "password theft", "steal login", "obtain credentials", "credential stealing", "steal username", "steal account", "phishing", "brute force"],
  "Phishing Attack": ["phishing", "phishing attack", "spear phishing", "email phishing", "fake login page", "phishing email", "social engineering"],
  "Brute Force Password": ["brute force", "brute force password", "password guessing", "dictionary attack", "brute force attack", "guess password", "password cracking"],
  "SQL Injection": ["sql injection", "sqli", "database injection", "inject sql", "sql attack", "database attack"],
  "Session Hijacking": ["session hijacking", "hijack session", "steal session", "session theft", "cookie theft", "steal cookie", "session attack"],
  "Modify Grades": ["modify grades", "change grades", "alter grades", "tamper grades", "edit grades", "grade tampering", "grade manipulation"],
  "Steal Personal Data": ["steal personal data", "data theft", "steal data", "exfiltrate data", "steal user data", "personal data theft", "data breach", "data exfiltration"],
  "Denial of Service": ["denial of service", "dos", "ddos", "service disruption", "flood attack", "overload server", "service unavailable"],
  "Man in the Middle": ["man in the middle", "mitm", "intercept traffic", "traffic interception", "intercept communication", "network interception"],
  "Fraudulent Transfer": ["fraudulent transfer", "steal money", "unauthorised transfer", "unauthorized transfer", "transfer money", "financial fraud", "money theft"],
  "Steal Financial Data": ["steal financial data", "steal payment data", "credit card theft", "steal card details", "payment fraud", "steal bank details", "financial data theft"],
  "Access Patient Records": ["access patient records", "steal patient data", "patient data theft", "medical record theft", "steal medical data", "medical data breach"],
  "Modify Patient Records": ["modify patient records", "alter patient data", "tamper medical records", "change medical data", "edit patient records", "medical record tampering"],
  "Ransomware Attack": ["ransomware", "ransomware attack", "encrypt files", "file encryption attack", "file ransomware"],
  "Insider Threat": ["insider threat", "malicious insider", "rogue employee", "disgruntled employee", "internal threat"],
  "Steal Payment Info": ["steal payment info", "steal credit card", "payment data theft", "card skimming", "steal checkout data", "payment fraud"],
  "Fake Reviews": ["fake reviews", "review manipulation", "review fraud", "manipulate reviews", "false reviews"],
  "Price Manipulation": ["price manipulation", "alter price", "change price", "manipulate product price", "price tampering"],
  "Account Takeover": ["account takeover", "take over account", "hijack account", "steal account access", "account compromise"],
  "Control Device": ["control device", "take control", "device hijacking", "remote control", "hijack device", "device takeover"],
  "Eavesdrop": ["eavesdrop", "listen in", "spy on user", "intercept audio", "intercept video", "monitor user", "surveillance"],
  "Disable Device": ["disable device", "turn off device", "brick device", "shut down device", "device disruption"],
  "Firmware Attack": ["firmware attack", "malicious firmware", "firmware exploit", "corrupt firmware", "firmware compromise"],
  "Network Intrusion": ["network intrusion", "network attack", "intrude network", "break into network", "network breach"]
};

// Precision-focused matching for detailed, free-form descriptions. A single
// loose keyword is NOT enough on its own (too easy to false-positive) —
// each group below lists words that must ALL appear together somewhere in
// the participant's text. A reference node matches if ANY one full group is
// satisfied. This lets someone write a long, specific sentence and still be
// recognised correctly, without loosening precision to "any one word hits".
const SIGNAL_GROUPS = {
  "Steal Credentials": [["steal", "password"], ["steal", "credential"], ["steal", "login"], ["obtain", "credential"]],
  "Phishing Attack": [["phish"], ["fake", "email"], ["impersonat", "email"], ["fake", "link"], ["spoof", "email"], ["trick", "email"]],
  "Brute Force Password": [["brute"], ["guess", "password"], ["try", "password"], ["automat", "password"], ["dictionary", "attack"]],
  "SQL Injection": [["sql"], ["inject", "database"], ["inject", "query"]],
  "Session Hijacking": [["session", "hijack"], ["steal", "session"], ["steal", "cookie"], ["session", "token"]],
  "Modify Grades": [["change", "grade"], ["alter", "grade"], ["modify", "grade"], ["edit", "grade"], ["tamper", "grade"]],
  "Steal Personal Data": [["steal", "data"], ["steal", "personal"], ["exfiltrat"], ["leak", "data"], ["data", "breach"]],
  "Denial of Service": [["denial"], ["ddos"], ["dos", "attack"], ["flood"], ["overload"], ["overwhelm"]],
  "Man in the Middle": [["man", "middle"], ["mitm"], ["intercept", "traffic"], ["intercept", "communicat"], ["intercept", "network"]],
  "Fraudulent Transfer": [["fraudulent", "transfer"], ["unauthoris", "transfer"], ["unauthoriz", "transfer"], ["steal", "money"], ["transfer", "money"]],
  "Steal Financial Data": [["steal", "financial"], ["steal", "payment"], ["steal", "card"], ["steal", "bank"], ["credit", "card", "theft"]],
  "Access Patient Records": [["patient", "access"], ["patient", "steal"], ["patient", "view"], ["patient", "read"], ["patient", "download"], ["patient", "expose"]],
  "Modify Patient Records": [["patient", "modify"], ["patient", "alter"], ["patient", "change"], ["patient", "tamper"], ["patient", "edit"]],
  "Ransomware Attack": [["ransom"], ["encrypt", "file"], ["encrypt", "data"]],
  "Insider Threat": [["insider"], ["employee", "misuse"], ["employee", "abuse"], ["rogue", "employee"], ["disgruntled"], ["malicious", "employee"]],
  "Steal Payment Info": [["steal", "payment"], ["steal", "card"], ["card", "skim"], ["steal", "checkout"], ["intercept", "payment"]],
  "Fake Reviews": [["fake", "review"], ["false", "review"], ["review", "manipulat"], ["review", "fraud"]],
  "Price Manipulation": [["price", "manipulat"], ["change", "price"], ["alter", "price"], ["price", "tamper"]],
  "Account Takeover": [["account", "takeover"], ["take", "over", "account"], ["hijack", "account"], ["compromise", "account"]],
  "Control Device": [["control", "device"], ["remote", "control"], ["hijack", "device"], ["take", "control"]],
  "Eavesdrop": [["eavesdrop"], ["spy"], ["listen", "in"], ["intercept", "audio"], ["intercept", "video"], ["monitor", "user"]],
  "Disable Device": [["disable", "device"], ["shut", "down"], ["turn", "off", "device"], ["brick", "device"]],
  "Firmware Attack": [["firmware"]],
  "Network Intrusion": [["network", "intrusion"], ["network", "breach"], ["intrude", "network"], ["break", "network"], ["network", "attack"]]
};

// Expanded suggestions with descriptions and example usage
const SUGGESTION_EXPANSIONS = {
  'Credential Theft': {
    description: 'Attacks that steal login credentials (username and password) to gain unauthorised access.',
    usage: 'Add these as children of a "Steal Credentials" node, or directly under the root if they lead to system access.',
    attacks: [
      { name: 'Phishing Attack', explain: 'Sending fake emails to trick users into revealing their password.' },
      { name: 'Brute Force Password', explain: 'Trying thousands of password combinations until one works.' },
      { name: 'Keylogger', explain: 'Malware that records every key the user types, including passwords.' },
      { name: 'Credential Stuffing', explain: 'Using leaked passwords from other websites to log in here.' },
      { name: 'Password Spraying', explain: 'Trying common passwords against many accounts to avoid lockout.' }
    ]
  },
  'Injection Attacks': {
    description: 'Attacks that inject malicious code into the system through user input fields.',
    usage: 'Add these directly under the root node as independent attack paths.',
    attacks: [
      { name: 'SQL Injection', explain: 'Inserting malicious SQL code into a login field to access the database.' },
      { name: 'Cross-Site Scripting', explain: 'Injecting malicious scripts into web pages viewed by other users.' },
      { name: 'Command Injection', explain: 'Running system commands through vulnerable input fields.' },
      { name: 'LDAP Injection', explain: 'Manipulating directory queries to bypass authentication.' }
    ]
  },
  'Session Attacks': {
    description: 'Attacks that hijack or manipulate active user sessions after login.',
    usage: 'Add these as alternative attack paths alongside credential theft — the attacker bypasses login entirely.',
    attacks: [
      { name: 'Session Hijacking', explain: 'Stealing a user\'s session token to impersonate them without their password.' },
      { name: 'Cookie Theft', explain: 'Stealing browser cookies that contain session information.' },
      { name: 'Cross-Site Request Forgery', explain: 'Tricking a logged-in user into performing unintended actions.' },
      { name: 'Session Fixation', explain: 'Forcing a user to use a known session ID that the attacker can then exploit.' }
    ]
  },
  'Data Exfiltration': {
    description: 'Attacks that steal or leak sensitive data from the system.',
    usage: 'Add these as consequences or independent attack goals — what the attacker does with their access.',
    attacks: [
      { name: 'Steal Personal Data', explain: 'Extracting user records such as names, emails, and addresses.' },
      { name: 'Database Dump', explain: 'Downloading the entire database contents.' },
      { name: 'Man in the Middle', explain: 'Intercepting data as it travels between the user and the server.' },
      { name: 'Insider Data Theft', explain: 'A trusted employee exfiltrating data deliberately.' }
    ]
  },
  'DoS Attacks': {
    description: 'Attacks that disrupt or disable the service, making it unavailable to users.',
    usage: 'Add these as independent attack paths — the attacker\'s goal is disruption rather than data theft.',
    attacks: [
      { name: 'Denial of Service', explain: 'Flooding the server with traffic until it crashes.' },
      { name: 'Distributed DoS', explain: 'Using thousands of computers to overwhelm the server simultaneously.' },
      { name: 'Resource Exhaustion', explain: 'Consuming all server memory or CPU until it becomes unresponsive.' },
      { name: 'Application Layer Attack', explain: 'Targeting specific application functions rather than the network.' }
    ]
  },
  'Insider Threat': {
    description: 'Attacks from people who already have legitimate access to the system.',
    usage: 'Add this as an independent attack path — the attacker already has access, so no login attack is needed.',
    attacks: [
      { name: 'Insider Threat', explain: 'A malicious employee abusing their access privileges.' },
      { name: 'Privilege Abuse', explain: 'Using legitimate admin access for unauthorised purposes.' },
      { name: 'Data Theft by Employee', explain: 'An employee copying sensitive data before leaving the organisation.' },
      { name: 'Sabotage', explain: 'Deliberately corrupting or deleting system data.' }
    ]
  },
  'Ransomware': {
    description: 'Attacks that encrypt the system\'s data and demand payment for the decryption key.',
    usage: 'Add this as an independent attack path representing a destructive attack goal.',
    attacks: [
      { name: 'Ransomware Attack', explain: 'Deploying malware that encrypts all files and demands a ransom.' },
      { name: 'File Encryption', explain: 'Encrypting critical system files to render them inaccessible.' },
      { name: 'Backup Destruction', explain: 'Deleting backups before encrypting data to prevent recovery.' },
      { name: 'Data Hostage', explain: 'Threatening to publish stolen data unless a ransom is paid.' }
    ]
  },
  'Network Intrusion': {
    description: 'Attacks that compromise the network infrastructure rather than the application directly.',
    usage: 'Add this as an entry-point attack — the attacker gains network access first, then targets the system.',
    attacks: [
      { name: 'Network Intrusion', explain: 'Breaking into the internal network to access systems directly.' },
      { name: 'Man in the Middle', explain: 'Positioning between the user and server to intercept communications.' },
      { name: 'Packet Sniffing', explain: 'Capturing unencrypted data packets travelling across the network.' },
      { name: 'WiFi Eavesdropping', explain: 'Intercepting data on an unsecured wireless network.' }
    ]
  },
  'Payment Fraud': {
    description: 'Attacks specifically targeting payment processing and financial transactions.',
    usage: 'Add these as children of a payment-related node or directly under the root as independent attack goals.',
    attacks: [
      { name: 'Steal Payment Info', explain: 'Intercepting credit card details during the checkout process.' },
      { name: 'Card Skimming', explain: 'Installing malicious code that copies card details at point of entry.' },
      { name: 'Fraudulent Transfer', explain: 'Initiating unauthorised money transfers after gaining account access.' },
      { name: 'Checkout Manipulation', explain: 'Altering the payment amount or recipient during transaction processing.' }
    ]
  },
  'Account Takeover': {
    description: 'Attacks that result in the attacker gaining full control of a user account.',
    usage: 'Add this as the goal node, with credential theft or session attacks as child methods beneath it.',
    attacks: [
      { name: 'Account Takeover', explain: 'Gaining complete control of a user account through any means.' },
      { name: 'Credential Stuffing', explain: 'Using leaked credentials from other breaches to log in.' },
      { name: 'Phishing Attack', explain: 'Tricking the user into handing over their login details.' },
      { name: 'Brute Force Password', explain: 'Guessing the password through automated attempts.' }
    ]
  }
};

const SCENARIOS = [
  {
    id: 1,
    title: "University Student Portal",
    objective: "Your goal is to identify all the ways an attacker could compromise a university student portal — gaining unauthorised access, stealing or modifying data, or disrupting the service.",
    description: "A university student portal allows students to log in, view grades, and submit assignments. The system stores student personal information, academic records, and assignment submissions.",
    scaffolded: true,
    suggestions: ['Credential Theft', 'Injection Attacks', 'Session Attacks', 'Data Exfiltration', 'DoS Attacks'],
    referenceNodes: ["Compromise Student Portal", "Steal Credentials", "Phishing Attack", "Brute Force Password", "SQL Injection", "Session Hijacking", "Modify Grades", "Steal Personal Data", "Denial of Service"],
    referenceCategories: {
      "Access": ["Steal Credentials", "Phishing Attack", "Brute Force Password", "SQL Injection", "Session Hijacking"],
      "Data Theft": ["Steal Personal Data"],
      "Data Manipulation": ["Modify Grades"],
      "Disruption": ["Denial of Service"]
    },
    exampleTree: [
      { id: 0, label: "Compromise Student Portal", parentId: null, logic: null },
      { id: 1, label: "Steal Credentials", parentId: 0, logic: "OR" },
      { id: 2, label: "Phishing Attack", parentId: 1, logic: "OR" },
      { id: 3, label: "Brute Force Password", parentId: 1, logic: "OR" },
      { id: 4, label: "SQL Injection", parentId: 0, logic: "OR" },
      { id: 5, label: "Session Hijacking", parentId: 0, logic: "OR" },
      { id: 6, label: "Modify Grades", parentId: 0, logic: "OR" },
      { id: 7, label: "Steal Personal Data", parentId: 0, logic: "OR" },
      { id: 8, label: "Denial of Service", parentId: 0, logic: "OR" }
    ]
  },
  {
    id: 2,
    title: "Hospital Patient Records System",
    objective: "Your goal is to identify all the ways an attacker could compromise a hospital patient records system — stealing sensitive medical data, modifying records, or disrupting hospital operations.",
    description: "A hospital patient records system stores sensitive medical information including diagnoses, prescriptions, and treatment histories. Doctors and nurses access records via secure login. The system is connected to the hospital internal network.",
    scaffolded: true,
    suggestions: ['Credential Theft', 'Insider Threat', 'Ransomware', 'Network Intrusion', 'Data Exfiltration'],
    referenceNodes: ["Compromise Hospital System", "Steal Credentials", "SQL Injection", "Access Patient Records", "Modify Patient Records", "Ransomware Attack", "Insider Threat", "Denial of Service", "Network Intrusion"],
    referenceCategories: {
      "Access": ["Steal Credentials", "SQL Injection", "Network Intrusion"],
      "Data Theft": ["Access Patient Records"],
      "Data Manipulation": ["Modify Patient Records"],
      "Disruption": ["Denial of Service", "Ransomware Attack"],
      "Insider": ["Insider Threat"]
    },
    exampleTree: [
      { id: 0, label: "Compromise Hospital System", parentId: null, logic: null },
      { id: 1, label: "Steal Credentials", parentId: 0, logic: "OR" },
      { id: 2, label: "SQL Injection", parentId: 0, logic: "OR" },
      { id: 3, label: "Access Patient Records", parentId: 0, logic: "OR" },
      { id: 4, label: "Modify Patient Records", parentId: 0, logic: "OR" },
      { id: 5, label: "Ransomware Attack", parentId: 0, logic: "OR" },
      { id: 6, label: "Insider Threat", parentId: 0, logic: "OR" },
      { id: 7, label: "Denial of Service", parentId: 0, logic: "OR" },
      { id: 8, label: "Network Intrusion", parentId: 0, logic: "OR" }
    ]
  },
  {
    id: 3,
    title: "E-commerce Platform",
    objective: "Your goal is to identify all the ways an attacker could compromise an e-commerce platform — stealing payment information, manipulating listings, or taking over customer accounts.",
    description: "An e-commerce platform allows customers to browse products, make purchases using credit cards, and leave reviews. The platform stores customer payment details, order histories, and personal addresses.",
    scaffolded: true,
    suggestions: ['Credential Theft', 'Payment Fraud', 'Injection Attacks', 'Session Attacks', 'Account Takeover'],
    referenceNodes: ["Compromise E-commerce Platform", "Steal Payment Info", "SQL Injection", "Account Takeover", "Session Hijacking", "Fake Reviews", "Price Manipulation", "Denial of Service", "Phishing Attack"],
    referenceCategories: {
      "Access": ["SQL Injection", "Account Takeover", "Session Hijacking", "Phishing Attack"],
      "Financial": ["Steal Payment Info"],
      "Manipulation": ["Fake Reviews", "Price Manipulation"],
      "Disruption": ["Denial of Service"]
    },
    exampleTree: [
      { id: 0, label: "Compromise E-commerce Platform", parentId: null, logic: null },
      { id: 1, label: "Steal Payment Info", parentId: 0, logic: "OR" },
      { id: 2, label: "SQL Injection", parentId: 0, logic: "OR" },
      { id: 3, label: "Account Takeover", parentId: 0, logic: "OR" },
      { id: 4, label: "Session Hijacking", parentId: 0, logic: "OR" },
      { id: 5, label: "Fake Reviews", parentId: 0, logic: "OR" },
      { id: 6, label: "Price Manipulation", parentId: 0, logic: "OR" },
      { id: 7, label: "Denial of Service", parentId: 0, logic: "OR" },
      { id: 8, label: "Phishing Attack", parentId: 0, logic: "OR" }
    ]
  },
  {
    id: 4,
    title: "Online Banking Application",
    objective: "Transfer Task: No scaffolding is provided. Apply what you have learned to construct an attack tree independently.",
    description: "An online banking application allows customers to log in, view account balances, transfer money, and pay bills. Customers authenticate using username, password, and two-factor authentication.",
    scaffolded: false,
    suggestions: [],
    referenceNodes: ["Compromise Banking App", "Steal Credentials", "Phishing Attack", "Man in the Middle", "SQL Injection", "Session Hijacking", "Fraudulent Transfer", "Steal Financial Data", "Denial of Service"],
    referenceCategories: {
      "Access": ["Steal Credentials", "Phishing Attack", "SQL Injection", "Session Hijacking", "Man in the Middle"],
      "Financial": ["Fraudulent Transfer", "Steal Financial Data"],
      "Disruption": ["Denial of Service"]
    },
    exampleTree: [
      { id: 0, label: "Compromise Banking App", parentId: null, logic: null },
      { id: 1, label: "Steal Credentials", parentId: 0, logic: "OR" },
      { id: 2, label: "Phishing Attack", parentId: 1, logic: "OR" },
      { id: 3, label: "Man in the Middle", parentId: 0, logic: "OR" },
      { id: 4, label: "SQL Injection", parentId: 0, logic: "OR" },
      { id: 5, label: "Session Hijacking", parentId: 0, logic: "OR" },
      { id: 6, label: "Fraudulent Transfer", parentId: 0, logic: "OR" },
      { id: 7, label: "Steal Financial Data", parentId: 0, logic: "OR" },
      { id: 8, label: "Denial of Service", parentId: 0, logic: "OR" }
    ]
  },
  {
    id: 5,
    title: "Smart Home IoT Device",
    objective: "Transfer Task: No scaffolding is provided. Apply what you have learned to construct an attack tree independently.",
    description: "A smart home IoT device connects to the home Wi-Fi network and is controlled via a mobile app. It records audio and video and sends data to a cloud server.",
    scaffolded: false,
    suggestions: [],
    referenceNodes: ["Compromise Smart Home Device", "Steal Credentials", "Network Intrusion", "Control Device", "Eavesdrop", "Disable Device", "Firmware Attack", "Steal Personal Data", "Denial of Service"],
    referenceCategories: {
      "Access": ["Steal Credentials", "Network Intrusion", "Firmware Attack"],
      "Control": ["Control Device", "Disable Device"],
      "Privacy": ["Eavesdrop", "Steal Personal Data"],
      "Disruption": ["Denial of Service"]
    },
    exampleTree: [
      { id: 0, label: "Compromise Smart Home Device", parentId: null, logic: null },
      { id: 1, label: "Steal Credentials", parentId: 0, logic: "OR" },
      { id: 2, label: "Network Intrusion", parentId: 0, logic: "OR" },
      { id: 3, label: "Control Device", parentId: 0, logic: "OR" },
      { id: 4, label: "Eavesdrop", parentId: 0, logic: "OR" },
      { id: 5, label: "Disable Device", parentId: 0, logic: "OR" },
      { id: 6, label: "Firmware Attack", parentId: 0, logic: "OR" },
      { id: 7, label: "Steal Personal Data", parentId: 0, logic: "OR" },
      { id: 8, label: "Denial of Service", parentId: 0, logic: "OR" }
    ]
  }
];

const TUTORIAL_TREE = [
  { id: 0, label: "Compromise FitTrack Fitness App", parentId: null, logic: null },
  { id: 1, label: "Steal Login Credentials", parentId: 0, logic: "OR" },
  { id: 2, label: "Phishing via Fake Password-Reset Email", parentId: 1, logic: "OR" },
  { id: 3, label: "Credential Stuffing via Leaked Gym Database", parentId: 1, logic: "OR" },
  { id: 4, label: "Exploit Unauthenticated Workout-Data API", parentId: 0, logic: "OR" }
];

// A short, fixed description of the demo scenario, shown above the
// animation so the steps below have concrete context to refer back to.
const TUTORIAL_SCENARIO = "FitTrack is a fitness app that logs users' GPS running routes, lets partner gyms' membership systems log users in with the same email/password, and shows a social feed of recent workouts fetched from a backend API.";

const TUTORIAL_STEPS = [
  { nodeId: 0, caption: "The attacker's goal is to compromise FitTrack specifically — for example, to pull a user's exact GPS running routes, which often reveal their home address (most runs start and end there). This goal becomes the root node." },
  { nodeId: 1, caption: "FitTrack requires an email and password to log in, so gaining valid credentials is the most direct route in — this becomes the first branch, to be broken down into specific methods." },
  { nodeId: 2, caption: "FitTrack genuinely emails password-reset links from \"noreply@fittrack-app.com\". An attacker registers the lookalike domain \"fittrack-security-app.com\" and sends an almost identical reset email — because users already expect this exact kind of email from FitTrack, they're primed to click without checking the sender closely." },
  { nodeId: 3, caption: "FitTrack lets several partner gym chains' membership systems log in with the same email/password. Some of those gym chains have had their own separate customer databases leaked in unrelated breaches — so the attacker doesn't need to trick anyone, just try those leaked email/password pairs directly against FitTrack, relying on people reusing passwords across their gym and fitness apps. This is connected to phishing with OR, since either method alone gets the attacker in." },
  { nodeId: 4, caption: "Separately, FitTrack's app fetches a user's workout history for the social feed from a backend API. An earlier version of this endpoint only checked that a session token was valid — not that it belonged to the specific user being requested — so calling it with a different user's ID returns their exact GPS routes. No password needed at all, so this is a fully independent path to the same goal." }
];

function AnimatedTreeDemo() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setRevealedCount(prev => {
          if (prev >= TUTORIAL_STEPS.length) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  useEffect(() => {
    if (revealedCount >= TUTORIAL_STEPS.length) setPlaying(false);
  }, [revealedCount]);

  const handlePlay = () => {
    if (revealedCount >= TUTORIAL_STEPS.length) setRevealedCount(0);
    setPlaying(true);
  };
  const handlePause = () => setPlaying(false);
  const handleReplay = () => { setRevealedCount(0); setPlaying(true); };

  const visibleIds = TUTORIAL_STEPS.slice(0, revealedCount).map(s => s.nodeId);
  const currentCaption = revealedCount > 0 ? TUTORIAL_STEPS[revealedCount - 1].caption : "Click play to watch the attack tree being built up, step by step.";

  const renderNode = (nodeId, depth = 0) => {
    if (!visibleIds.includes(nodeId)) return null;
    const node = TUTORIAL_TREE.find(n => n.id === nodeId);
    if (!node) return null;
    const children = TUTORIAL_TREE.filter(n => n.parentId === nodeId);
    const isNewest = TUTORIAL_STEPS[revealedCount - 1]?.nodeId === nodeId;
    return (
      <div key={nodeId} style={{ marginLeft: depth * 20, marginTop: 4, animation: isNewest ? 'fadeIn 0.5s ease' : 'none' }}>
        {node.logic && <span style={{ fontSize: 10, background: '#0891b2', color: 'white', padding: '1px 5px', borderRadius: 3, marginRight: 4 }}>{node.logic}</span>}
        <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 6, background: depth === 0 ? '#1e3a5f' : '#1e293b', color: 'white', fontSize: 13, border: isNewest ? '2px solid #f59e0b' : '1px solid #334155' }}>
          {depth === 0 ? '🎯' : '🔴'} {node.label}
        </span>
        {children.length > 0 && <div style={{ borderLeft: '2px solid #334155', marginLeft: 14, paddingLeft: 6 }}>{children.map(child => renderNode(child.id, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>🎬 Animated Demo: How an Attack Tree Gets Built</h3>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>{TUTORIAL_SCENARIO}</p>
      <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, marginBottom: 12, minHeight: 160 }}>
        {revealedCount === 0 ? (
          <p style={{ color: '#475569', fontSize: 13 }}>Click "Play" to start the demonstration</p>
        ) : renderNode(0)}
      </div>
      <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, marginBottom: 12, minHeight: 40 }}>
        <p style={{ color: '#fcd34d', fontSize: 13, lineHeight: 1.6 }}>💬 {currentCaption}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!playing ? (
          <button onClick={handlePlay} style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
            ▶️ {revealedCount >= TUTORIAL_STEPS.length ? 'Play Again' : revealedCount > 0 ? 'Resume' : 'Play'}
          </button>
        ) : (
          <button onClick={handlePause} style={{ padding: '6px 14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
            ⏸️ Pause
          </button>
        )}
        <button onClick={handleReplay} style={{ padding: '6px 14px', background: 'none', border: '1px solid #475569', color: '#94a3b8', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
          🔄 Replay
        </button>
        <span style={{ color: '#475569', fontSize: 11, marginLeft: 4 }}>{revealedCount}/{TUTORIAL_STEPS.length} steps</span>
      </div>
    </div>
  );
}

// Checks the precision signal groups for a reference node: returns the
// first fully-satisfied group (all its words present in the user's text),
// or null if none match. A group must be satisfied in full — a single word
// from a multi-word group is never enough.
function matchSignalGroups(user, referenceNode) {
  const groups = SIGNAL_GROUPS[referenceNode];
  if (!groups) return null;
  return groups.find(group => group.every(word => user.includes(word))) || null;
}

function matchNode(userLabel, referenceNode) {
  const user = userLabel.toLowerCase().trim();
  const ref = referenceNode.toLowerCase().trim();
  if (user === ref) return true;
  if (user.includes(ref) || ref.includes(user)) return true;
  const synonymList = SYNONYMS[referenceNode] || [];
  if (synonymList.some(syn => user.includes(syn) || syn.includes(user))) return true;
  return !!matchSignalGroups(user, referenceNode);
}

// Explains *why* a user's node was judged to match a reference node — used
// to make the scoring transparent instead of a black box (click-to-explain
// in the results view).
function explainMatch(userLabel, referenceNode) {
  const user = userLabel.toLowerCase().trim();
  const ref = referenceNode.toLowerCase().trim();
  if (user === ref) {
    return { type: 'exact', detail: `Your text matches "${referenceNode}" exactly.` };
  }
  if (user.includes(ref) || ref.includes(user)) {
    return { type: 'substring', detail: `Your text "${userLabel}" and the reference term "${referenceNode}" share the same core wording.` };
  }
  const synonymList = SYNONYMS[referenceNode] || [];
  const hitSynonym = synonymList.find(syn => user.includes(syn) || syn.includes(user));
  if (hitSynonym) {
    return { type: 'synonym', detail: `Your text "${userLabel}" was recognised as equivalent to "${referenceNode}" via the known synonym "${hitSynonym}".` };
  }
  const signalGroup = matchSignalGroups(user, referenceNode);
  if (signalGroup) {
    return { type: 'signal', detail: `Your text "${userLabel}" was recognised as "${referenceNode}" because it contains this specific combination of terms: ${signalGroup.join(' + ')}.` };
  }
  return { type: 'unknown', detail: `Matched to "${referenceNode}", but the exact reason could not be determined.` };
}

// Pairs of keywords that, when they appear as separate OR-connected sibling
// nodes, usually indicate the participant meant AND (both are needed
// together) rather than OR (either one is enough). Used for structural
// scaffolding — pointing out likely logic-relationship mistakes.
const AND_HINT_PAIRS = [
  ['username', 'password'], ['email', 'password'], ['card number', 'cvv'],
  ['otp', 'password'], ['token', 'password'], ['pin', 'card'], ['id', 'password']
];

function findLogicIssues(nodes) {
  const issues = [];
  const siblingGroups = {};
  nodes.forEach(n => {
    if (n.parentId === null) return;
    if (!siblingGroups[n.parentId]) siblingGroups[n.parentId] = [];
    siblingGroups[n.parentId].push(n);
  });
  Object.values(siblingGroups).forEach(siblings => {
    if (siblings.length < 2) return;
    if (!siblings.every(s => s.logic === 'OR')) return;
    for (let i = 0; i < siblings.length; i++) {
      for (let j = i + 1; j < siblings.length; j++) {
        const a = siblings[i].label.toLowerCase();
        const b = siblings[j].label.toLowerCase();
        const pairHit = AND_HINT_PAIRS.some(([x, y]) =>
          (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x))
        );
        if (pairHit) {
          issues.push({ nodeIds: [siblings[i].id, siblings[j].id], labels: [siblings[i].label, siblings[j].label] });
        }
      }
    }
  });
  return issues;
}

// A "shallow" node: a direct child of the root that has not been broken
// down any further. Used for structural scaffolding when the whole tree is
// still flat (root + one layer only) — nudging the participant to go one
// level deeper rather than only adding more siblings.
function findShallowNode(nodes) {
  const root = nodes.find(n => n.isRoot) || nodes.find(n => n.parentId === null);
  if (!root) return null;
  const topLevel = nodes.filter(n => n.parentId === root.id);
  return topLevel.find(n => !nodes.some(c => c.parentId === n.id)) || null;
}

// Smart completeness: score across categories
function evaluateTree(nodes, scenario) {
  const userLabels = nodes.map(n => n.label);
  const referenceNodes = scenario.referenceNodes;
  const referenceCategories = scenario.referenceCategories || {};

  // Basic node matching
  const matched = referenceNodes.filter(ref =>
    userLabels.some(label => matchNode(label, ref))
  );

  // Explainable detail per match — which user node matched which reference
  // node, and why (exact / substring / synonym).
  const matchedDetails = referenceNodes
    .map(ref => {
      const hitLabel = userLabels.find(label => matchNode(label, ref));
      if (!hitLabel) return null;
      return { referenceNode: ref, userLabel: hitLabel, explanation: explainMatch(hitLabel, ref) };
    })
    .filter(Boolean);

  // Category coverage
  const categoryScores = {};
  Object.entries(referenceCategories).forEach(([cat, catNodes]) => {
    const catMatched = catNodes.filter(ref =>
      userLabels.some(label => matchNode(label, ref))
    );
    categoryScores[cat] = {
      matched: catMatched.length,
      total: catNodes.length,
      percentage: Math.round((catMatched.length / catNodes.length) * 100)
    };
  });

  const totalCategories = Object.keys(referenceCategories).length;
  const coveredCategories = Object.values(categoryScores).filter(s => s.matched > 0).length;
  const categoryPercentage = totalCategories > 0 ? Math.round((coveredCategories / totalCategories) * 100) : 0;

  // Depth bonus: reward deeper trees
  const maxDepth = nodes.reduce((max, node) => {
    let depth = 0;
    let current = node;
    while (current.parentId !== null) {
      depth++;
      current = nodes.find(n => n.id === current.parentId) || { parentId: null };
    }
    return Math.max(max, depth);
  }, 0);
  const depthBonus = Math.min(maxDepth * 5, 15);

  // Combined score
  const nodePercentage = Math.round((matched.length / referenceNodes.length) * 100);
  const combinedPercentage = Math.min(100, Math.round((nodePercentage * 0.5) + (categoryPercentage * 0.4) + depthBonus * 0.1));

  // Missing categories for smart hints
  const missingCategories = Object.entries(categoryScores)
    .filter(([_, s]) => s.matched === 0)
    .map(([cat]) => cat);

  // Structural diagnostics — used by the Socratic hint system to give
  // feedback on tree structure, not just content coverage.
  const logicIssues = findLogicIssues(nodes);

  return {
    total: nodes.length,
    matched: matched.length,
    possible: referenceNodes.length,
    percentage: combinedPercentage,
    nodePercentage,
    categoryPercentage,
    categoryScores,
    matchedNodes: matched,
    matchedDetails,
    missingCategories,
    logicIssues,
    maxDepth
  };
}

// Each category maps to a small ladder of Socratic prompts: level 1 asks an
// open question (no jargon), level 2 narrows the question, level 3 finally
// names a concrete term. The participant has to click through levels rather
// than being handed the answer immediately — see getSocraticPrompt.
const CATEGORY_SOCRATIC = {
  "Access": {
    q1: "How might an attacker gain their very first foothold in this system? Think about the login process and any network entry points.",
    q2: "Think specifically about ways to get in *without* the correct credentials, or by intercepting them.",
    term: "e.g. phishing, brute force, SQL injection, session hijacking"
  },
  "Data Theft": {
    q1: "What sensitive data exists in this system? How might an attacker take a copy of it without being noticed?",
    q2: "Think about data being extracted or exfiltrated, not changed.",
    term: "e.g. stealing personal or patient data"
  },
  "Data Manipulation": {
    q1: "Instead of stealing data, could an attacker cause harm just by changing it?",
    q2: "Think about which records, if quietly altered, would cause real damage.",
    term: "e.g. modifying grades or patient records"
  },
  "Disruption": {
    q1: "Could an attacker succeed without stealing or changing anything at all — just by making the system unavailable?",
    q2: "Think about overwhelming the system with traffic or requests.",
    term: "e.g. denial of service"
  },
  "Financial": {
    q1: "What financial transactions or payment data exist here that an attacker might target?",
    q2: "Think about money or funds moving without proper authorisation.",
    term: "e.g. fraudulent transfer, stealing financial data"
  },
  "Manipulation": {
    q1: "Could an attacker benefit by changing what other users see, rather than stealing anything?",
    q2: "Think about content or pricing being altered.",
    term: "e.g. fake reviews, price manipulation"
  },
  "Insider": {
    q1: "Not all attackers come from outside the organisation — could someone who already has legitimate access misuse it?",
    q2: "Think about employees or other trusted users.",
    term: "e.g. insider threat"
  },
  "Control": {
    q1: "If an attacker gained control of this device, what could they actually do with it?",
    q2: "Think about remote control, or disabling it entirely.",
    term: "e.g. device hijacking, disabling the device"
  },
  "Privacy": {
    q1: "Could this system be used to spy on or monitor its users without their knowledge?",
    q2: "Think about audio, video, or location data specifically.",
    term: "e.g. eavesdropping"
  }
};

function generateCategoryQuestion(category, level) {
  const c = CATEGORY_SOCRATIC[category];
  if (!c) return { level: 3, question: `Consider attacks in the "${category}" category — you haven't covered this area yet.`, term: null };
  if (level <= 1) return { level: 1, question: c.q1, term: null };
  if (level === 2) return { level: 2, question: c.q2, term: null };
  return { level: 3, question: `Specific idea to consider: ${c.term}.`, term: c.term };
}

function generateExpansionQuestion(node, level) {
  if (level <= 1) {
    return { level: 1, question: `You added "${node.label}" — but how exactly would an attacker carry that out? Try to think of it as a first step, not the whole picture.`, term: null };
  }
  return { level: 2, question: `Can you break "${node.label}" down into at least two more specific, concrete methods and add them as its children?`, term: null };
}

function generateLogicQuestion(issue, level) {
  if (level <= 1) {
    return { level: 1, question: `You marked "${issue.labels[0]}" and "${issue.labels[1]}" as OR, meaning either one alone is enough — is that really true here?`, term: null };
  }
  return { level: 2, question: `If an attacker only had "${issue.labels[0]}" but not "${issue.labels[1]}" (or vice versa), could they still succeed? If not, consider changing this relationship to AND.`, term: 'AND logic' };
}

// The main Socratic hint function. It looks at the CURRENT tree's full
// state — content, structure, logic relationships — and picks whichever
// issue is most useful to raise right now. Nothing here is a fixed
// rotating script: the same tree state will always produce the same
// diagnosis, but two different trees will very likely produce different
// prompts. Cross-scenario repeated-category patterns are handled
// separately (see RepeatedGapReminder below) so that a persistent history
// issue does not crowd out hints about the CURRENT tree's own content,
// structure, or logic — a participant in scenario 3 should still get
// help with scenario 3's specific problems, not just be told again about
// something they missed in scenario 1.
function getSocraticPrompt(nodes, scenario, evaluation, sessionHistory, hintLevel) {
  // Priority 1: an AND/OR logic relationship that looks wrong.
  const logicIssues = evaluation.logicIssues || [];
  if (logicIssues.length > 0) {
    return { ...generateLogicQuestion(logicIssues[0], hintLevel), source: 'logic' };
  }

  // Priority 2: the tree is still flat (no node has been broken down further).
  if (evaluation.maxDepth <= 1) {
    const shallow = findShallowNode(nodes);
    if (shallow) return { ...generateExpansionQuestion(shallow, hintLevel), source: 'structure' };
  }

  // Priority 3: a missing attack category, based on the current tree only.
  if (evaluation.missingCategories.length > 0) {
    return { ...generateCategoryQuestion(evaluation.missingCategories[0], hintLevel), source: 'category' };
  }

  return { level: 3, question: "Great coverage across categories! Try picking one existing node and breaking it down further — how exactly would each step be carried out?", term: null, source: 'complete' };
}

let nodeIdCounter = 100;

function Tutorial({ onComplete }) {
  const renderTutorialTree = (nodeId, depth = 0) => {
    const node = TUTORIAL_TREE.find(n => n.id === nodeId);
    if (!node) return null;
    const children = TUTORIAL_TREE.filter(n => n.parentId === nodeId);
    return (
      <div key={nodeId} style={{ marginLeft: depth * 20, marginTop: 4 }}>
        {node.logic && <span style={{ fontSize: 10, background: '#0891b2', color: 'white', padding: '1px 5px', borderRadius: 3, marginRight: 4 }}>{node.logic}</span>}
        <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 6, background: depth === 0 ? '#1e3a5f' : '#1e293b', color: 'white', fontSize: 13, border: '1px solid #334155' }}>
          {depth === 0 ? '🎯' : '🔴'} {node.label}
        </span>
        {children.length > 0 && <div style={{ borderLeft: '2px solid #334155', marginLeft: 14, paddingLeft: 6 }}>{children.map(child => renderTutorialTree(child.id, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>📖 How to Build an Attack Tree</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
        Before you begin, please read this short tutorial. An attack tree is a diagram that shows all the ways an attacker could compromise a system.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, background: '#1e293b', borderRadius: 8, padding: 14, borderLeft: '4px solid #2563eb' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>🎯 Root Node</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>The top node is the attacker's main goal — e.g. "Compromise Student Portal". Everything below it is a way to achieve that goal.</p>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: '#1e293b', borderRadius: 8, padding: 14, borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>🔴 Child Nodes</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>Each child node is a method or step. You can keep adding children to break down each method into more specific actions.</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, background: '#1e293b', borderRadius: 8, padding: 14, borderLeft: '4px solid #0891b2' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>🔵 OR Logic</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>Use <strong style={{ color: '#0891b2' }}>OR</strong> when the attacker only needs <strong>one</strong> of the child methods to succeed. This is the most common relationship.</p>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>Example: Phishing OR Brute Force — either one can steal the password.</p>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: '#1e293b', borderRadius: 8, padding: 14, borderLeft: '4px solid #7c3aed' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>🟣 AND Logic</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>Use <strong style={{ color: '#7c3aed' }}>AND</strong> when the attacker needs <strong>all</strong> child methods to succeed together.</p>
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>Example: Steal Username AND Steal Password — both are needed to log in.</p>
        </div>
      </div>
      <AnimatedTreeDemo />
      <div style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>📋 Example Attack Tree</h3>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: 14, marginBottom: 12 }}>{renderTutorialTree(0)}</div>
        <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          In this example, an attacker can compromise FitTrack either by stealing login credentials (via phishing OR credential stuffing from a leaked gym database) OR by directly exploiting the unauthenticated workout-data API. Any one path leads to success.
        </p>
      </div>
      <button onClick={onComplete} style={{ padding: '12px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 'bold' }}>
        I understand — Start the Tasks →
      </button>
    </div>
  );
}

function ExampleTree({ treeData }) {
  const renderNode = (nodeId, depth = 0) => {
    const node = treeData.find(n => n.id === nodeId);
    if (!node) return null;
    const children = treeData.filter(n => n.parentId === nodeId);
    return (
      <div key={nodeId} style={{ marginLeft: depth * 20, marginTop: 4 }}>
        {node.logic && <span style={{ fontSize: 10, background: node.logic === 'AND' ? '#7c3aed' : '#0891b2', color: 'white', padding: '1px 5px', borderRadius: 3, marginRight: 4 }}>{node.logic}</span>}
        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, background: depth === 0 ? '#1e3a5f' : '#0f172a', color: 'white', fontSize: 13, border: '1px solid #334155' }}>
          {depth === 0 ? '🎯' : '🔴'} {node.label}
        </span>
        {children.length > 0 && <div style={{ borderLeft: '2px solid #334155', marginLeft: 12, paddingLeft: 6 }}>{children.map(child => renderNode(child.id, depth + 1))}</div>}
      </div>
    );
  };
  return renderNode(0);
}

function SuggestionPanel({ suggestions, onSelect, userNodes }) {
  const [expanded, setExpanded] = useState(null);
  const userLabels = userNodes.map(n => n.label.toLowerCase());

  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Click a category to see specific attacks and how to use them:</p>
      {suggestions.map(cat => {
        const expansion = SUGGESTION_EXPANSIONS[cat];
        if (!expansion) return null;
        const isExpanded = expanded === cat;
        return (
          <div key={cat} style={{ marginBottom: 6 }}>
            <button onClick={() => setExpanded(isExpanded ? null : cat)}
              style={{ width: '100%', textAlign: 'left', background: isExpanded ? '#1e3a5f' : '#0f172a', border: '1px solid #334155', color: 'white', padding: '7px 10px', borderRadius: isExpanded ? '6px 6px 0 0' : '6px', cursor: 'pointer', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📁 {cat}</span>
              <span style={{ color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
            </button>
            {isExpanded && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 10 }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{expansion.description}</p>
                <p style={{ color: '#475569', fontSize: 11, marginBottom: 8, fontStyle: 'italic' }}>💡 {expansion.usage}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {expansion.attacks.map(attack => {
                    const alreadyAdded = userLabels.some(l => l.includes(attack.name.toLowerCase()) || attack.name.toLowerCase().includes(l));
                    return (
                      <button key={attack.name} onClick={() => onSelect(attack.name)}
                        style={{ textAlign: 'left', padding: '6px 8px', borderRadius: 4, border: '1px solid #334155', background: alreadyAdded ? '#166534' : '#1e293b', color: alreadyAdded ? '#6ee7b7' : '#e2e8f0', cursor: 'pointer', fontSize: 12 }}>
                        <div style={{ fontWeight: 'bold' }}>{alreadyAdded ? '✅ ' : '+ '}{attack.name}</div>
                        <div style={{ color: alreadyAdded ? '#4ade80' : '#64748b', fontSize: 11, marginTop: 2 }}>{attack.explain}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TreeBuilder({ scenario, onComplete, sessionId, presentationPosition, sessionHistory, savedNodes, onSaveNodes }) {
  const [nodes, setNodes] = useState(savedNodes || [{ id: 0, label: scenario.referenceNodes[0], parentId: null, isRoot: true, logic: null }]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeLogic, setNewNodeLogic] = useState('OR');
  const [showHint, setShowHint] = useState(false);
  // Re-visiting a scenario remounts this component (see key={currentScenario}
  // in App), which would otherwise reset scaffolding back to full every time
  // a participant switches tabs and comes back — even after it had already
  // faded. Instead, derive the correct starting level from whatever nodes
  // were already saved for this scenario, using the same thresholds and
  // repeated-gap logic as autoFade below, so the displayed level matches
  // actual progress rather than jumping back to "brand new".
  const [scaffoldingLevel, setScaffoldingLevel] = useState(() => {
    if (!scenario.scaffolded) return 0;
    if (savedNodes && savedNodes.length > 0) {
      const initialEval = evaluateTree(savedNodes, scenario);
      const initialPastMissing = (sessionHistory || []).flatMap(h => h.missingCategories || []);
      const initialRepeatedGap = initialEval.missingCategories.some(cat => initialPastMissing.includes(cat));
      if (initialEval.percentage >= 70) return initialRepeatedGap ? 1 : 0;
      if (initialEval.percentage >= 30) return 1;
    }
    return 2;
  });
  const [showComparison, setShowComparison] = useState(false);
  const [fadingMessage, setFadingMessage] = useState('');
  const [startTime] = useState(Date.now());
  const [saved, setSaved] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  // hintLevel drives the Socratic ladder: 1 = open question, 2 = narrower
  // question, 3 = concrete term. "Tell me more" advances it; a fresh
  // "Show Hint" click starts back at level 1.
  const [hintLevel, setHintLevel] = useState(1);
  // Process-level hint usage tracking, saved alongside the final result —
  // useful for analysing whether hint usage patterns relate to eventual
  // performance (not just the final score/coverage).
  const [hintOpenCount, setHintOpenCount] = useState(0);
  const [maxHintLevelReached, setMaxHintLevelReached] = useState(0);
  const [warningSourceCounts, setWarningSourceCounts] = useState({ logic: 0, structure: 0, category: 0, complete: 0 });
  // Which matched node's explanation is currently expanded in the results
  // view (click-to-explain scoring — see matchedDetails in evaluateTree).
  const [expandedMatch, setExpandedMatch] = useState(null);

  const evaluation = evaluateTree(nodes, scenario);

  // Cross-scenario pattern check, used both for the fading logic below and
  // for the persistent reminder panel next to the tree — kept separate
  // from the Socratic hint content so a recurring gap from an earlier
  // scenario never crowds out hints about the CURRENT tree's own issues.
  const pastMissingCategories = (sessionHistory || []).flatMap(h => h.missingCategories || []);
  const repeatedMissingCategories = evaluation.missingCategories.filter(cat => pastMissingCategories.includes(cat));
  const hasRepeatedGap = repeatedMissingCategories.length > 0;

  const autoFade = (newNodes) => {
    if (!scenario.scaffolded) return;
    const eval_ = evaluateTree(newNodes, scenario);
    const repeatedGapNow = eval_.missingCategories.some(cat => pastMissingCategories.includes(cat));

    if (eval_.percentage >= 70) {
      if (repeatedGapNow) {
        // Score looks strong, but this participant has missed the same
        // category in an earlier scenario and is still missing it here —
        // keep light-touch scaffolding rather than withdrawing it entirely.
        // The message must update here regardless of whether the LEVEL
        // itself changes this call — otherwise, if the level had already
        // faded to 1 earlier (crossing the 30% threshold on the way up),
        // the banner would keep showing that older 30% message forever and
        // never reflect that the 70% threshold was reached and held back.
        setFadingMessage('Strong overall progress — but a category you also missed in an earlier scenario is still missing here, so hints stay available a little longer.');
        if (scaffoldingLevel > 1) {
          setScaffoldingLevel(1);
        }
        // If already at level 1, stay there — do not let the next
        // withdrawal step take it to 0 while the pattern persists.
      } else if (scaffoldingLevel > 0) {
        setScaffoldingLevel(0);
        setFadingMessage('Great progress! All scaffolding has been automatically withdrawn. You can still request help using the button below.');
      }
    } else if (eval_.percentage >= 30 && scaffoldingLevel > 1) {
      setScaffoldingLevel(1);
      setFadingMessage('Good progress! Suggested categories have been removed. Hints and manual help are still available.');
    }
  };

  const socraticPrompt = getSocraticPrompt(nodes, scenario, evaluation, sessionHistory, hintLevel);

  // Shared handlers for the two "Show Hint" / "Request Help" buttons below,
  // so hint usage is logged consistently regardless of which scaffolding
  // state the participant is in when they open it.
  const handleOpenHint = () => {
    if (!showHint) {
      setHintOpenCount(c => c + 1);
      setMaxHintLevelReached(l => Math.max(l, 1));
      setWarningSourceCounts(prev => ({ ...prev, [socraticPrompt.source]: (prev[socraticPrompt.source] || 0) + 1 }));
      setHintLevel(1);
    }
    setShowHint(!showHint);
  };
  const handleTellMeMore = () => {
    setHintLevel(l => {
      const next = Math.min(3, l + 1);
      setMaxHintLevelReached(prevMax => Math.max(prevMax, next));
      return next;
    });
  };

  const addNode = () => {
    if (!newNodeLabel.trim() || selectedNode === null) return;
    const newNode = { id: nodeIdCounter++, label: newNodeLabel.trim(), parentId: selectedNode, isRoot: false, logic: newNodeLogic };
    const newNodes = [...nodes, newNode];

    // Check if new node covers a previously missing category
    const prevEval = evaluateTree(nodes, scenario);
    const newEval = evaluateTree(newNodes, scenario);
    const newlyCovered = prevEval.missingCategories.filter(cat => !newEval.missingCategories.includes(cat));
    if (newlyCovered.length > 0) {
      setEncouragement(`Great work! You identified a new attack category: "${newlyCovered[0]}". Keep going!`);
      setTimeout(() => setEncouragement(''), 4000);
      // Tree content just changed meaningfully — reset the Socratic hint
      // ladder so the next "Show Hint" click starts from the open question
      // again, rather than staying on a now-outdated deeper hint.
      setHintLevel(1);
    }

    setNodes(newNodes);
    if (onSaveNodes) onSaveNodes(newNodes);
    setNewNodeLabel('');
    autoFade(newNodes);
  };

  const deleteNode = (nodeId) => {
    if (nodeId === 0) return;
    const toDelete = new Set();
    const queue = [nodeId];
    while (queue.length > 0) {
      const current = queue.shift();
      toDelete.add(current);
      nodes.filter(n => n.parentId === current).forEach(n => queue.push(n.id));
    }
    setNodes(nodes.filter(n => !toDelete.has(n.id)));
    if (toDelete.has(selectedNode)) setSelectedNode(null);
  };

  const getChildren = (nodeId) => nodes.filter(n => n.parentId === nodeId);

  const handleFinish = async () => {
    if (saved) return;
    setSaved(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    setShowComparison(true);
    try {
      await fetch(`${API_URL}/api/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          scenario_id: scenario.id,
          scenario_title: scenario.title,
          nodes: nodes.map(n => n.label),
          matched: evaluation.matched,
          possible: evaluation.possible,
          percentage: evaluation.percentage,
          matched_nodes: evaluation.matchedNodes,
          time_spent: timeSpent,
          scaffolding_level_final: scaffoldingLevel,
          presentation_position: presentationPosition,
          hint_open_count: hintOpenCount,
          max_hint_level: maxHintLevelReached,
          logic_warning_count: warningSourceCounts.logic || 0,
          structure_warning_count: warningSourceCounts.structure || 0,
          category_warning_count: warningSourceCounts.category || 0
        })
      });
    } catch (e) {
      console.log('Backend not available');
    }
  };

  const renderTree = (nodeId, depth = 0) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = getChildren(nodeId);
    const isSelected = selectedNode === nodeId;
    return (
      <div key={nodeId} style={{ marginLeft: depth * 22, marginTop: 5 }}>
        {!node.isRoot && node.logic && <span style={{ fontSize: 10, background: node.logic === 'AND' ? '#7c3aed' : '#0891b2', color: 'white', padding: '1px 5px', borderRadius: 3, marginRight: 4 }}>{node.logic}</span>}
        <div onClick={() => setSelectedNode(nodeId)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
          background: isSelected ? '#2563eb' : node.isRoot ? '#1e3a5f' : '#1e293b',
          color: 'white', cursor: 'pointer', border: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
          fontWeight: node.isRoot ? 'bold' : 'normal', fontSize: 13
        }}>
          {node.isRoot ? '🎯' : '🔴'} {node.label}
          {!node.isRoot && <button onClick={(e) => { e.stopPropagation(); deleteNode(nodeId); }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14 }}>✕</button>}
        </div>
        {children.length > 0 && <div style={{ borderLeft: '2px solid #334155', marginLeft: 14, paddingLeft: 6 }}>{children.map(child => renderTree(child.id, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div>
      {/* Objective */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
        <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#fcd34d', marginBottom: 6 }}>🎯 Your Objective</h3>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{scenario.objective}</p>
      </div>

      {/* Fading notification */}
      {fadingMessage && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 16, borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#6ee7b7', fontSize: 13 }}>📉 {fadingMessage}</p>
        </div>
      )}

      {/* Encouragement notification */}
      {encouragement && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
          <p style={{ color: '#fcd34d', fontSize: 13 }}>🎉 {encouragement}</p>
        </div>
      )}

      {/* Scaffolding panel - only shown when level > 0 */}
      {scaffoldingLevel > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold' }}>💡 Scaffolding Support</h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Level {scaffoldingLevel} — reduces automatically as you progress</span>
          </div>
          {scaffoldingLevel === 2 && scenario.suggestions.length > 0 && (
            <SuggestionPanel suggestions={scenario.suggestions} onSelect={setNewNodeLabel} userNodes={nodes} />
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleOpenHint}
              style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
              {showHint ? 'Hide Hint' : '💡 Show Hint'}
            </button>
            <button onClick={() => { setScaffoldingLevel(Math.max(0, scaffoldingLevel - 1)); setFadingMessage('Scaffolding manually reduced. You can still request help at any time.'); }}
              style={{ background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '6px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              Reduce Scaffolding ↓
            </button>
            <button onClick={() => { setScaffoldingLevel(Math.min(2, scaffoldingLevel + 1)); setFadingMessage('Scaffolding manually restored.'); }}
              style={{ background: 'none', border: '1px solid #334155', color: '#60a5fa', padding: '6px 14px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              Restore Scaffolding ↑
            </button>
          </div>
          {showHint && (
            <div style={{ marginTop: 10, background: '#0f172a', borderRadius: 6, padding: 10 }}>
              <p style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Step {socraticPrompt.level}/3</p>
              <p style={{ color: '#fcd34d', fontSize: 13 }}>💭 {socraticPrompt.question}</p>
              {socraticPrompt.level < 3 && (
                <button onClick={handleTellMeMore}
                  style={{ marginTop: 8, background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                  Tell me more →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Always-available help button (even when scaffolding is withdrawn) */}
      {scaffoldingLevel === 0 && scenario.scaffolded && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 16, borderLeft: '4px solid #475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#6ee7b7', fontSize: 13 }}>✅ Working independently — scaffolding withdrawn</p>
            <button onClick={handleOpenHint}
              style={{ background: '#334155', color: '#94a3b8', border: '1px solid #475569', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              {showHint ? 'Hide Help' : '🆘 Request Help'}
            </button>
          </div>
          {showHint && (
            <div style={{ marginTop: 10 }}>
              <div style={{ background: '#0f172a', borderRadius: 6, padding: 10, marginBottom: 10 }}>
                <p style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Step {socraticPrompt.level}/3</p>
                <p style={{ color: '#fcd34d', fontSize: 13 }}>💭 {socraticPrompt.question}</p>
                {socraticPrompt.level < 3 && (
                  <button onClick={handleTellMeMore}
                    style={{ marginTop: 8, background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                    Tell me more →
                  </button>
                )}
              </div>
              {scenario.suggestions.length > 0 && (
                <div style={{ background: '#0f172a', borderRadius: 6, padding: 10 }}>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Suggested categories (click to expand):</p>
                  <SuggestionPanel suggestions={scenario.suggestions} onSelect={setNewNodeLabel} userNodes={nodes} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {repeatedMissingCategories.length > 0 && (
        <div style={{ background: '#422006', border: '1px solid #92400e', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <p style={{ color: '#fbbf24', fontSize: 12, lineHeight: 1.6 }}>
            🔁 Worth double-checking: you also missed <strong>{repeatedMissingCategories.join(', ')}</strong> in an earlier scenario this session — still missing here too.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Tree */}
        <div style={{ flex: 2, minWidth: 280, background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>🌳 Your Attack Tree</h3>
          <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 10 }}>Click a node to select it, then add child nodes on the right.</p>
          {renderTree(0)}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>➕ Add Node</h3>
            <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
              {selectedNode !== null ? `Adding child to: "${nodes.find(n => n.id === selectedNode)?.label}"` : 'Select a node in the tree first'}
            </p>
            <input type="text" value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
              placeholder="Enter threat node name..."
              style={{ width: '100%', padding: '7px 9px', borderRadius: 5, border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Logic relationship with sibling nodes:</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <button onClick={() => setNewNodeLogic('OR')}
                style={{ flex: 1, padding: '6px', borderRadius: 5, border: 'none', background: newNodeLogic === 'OR' ? '#0891b2' : '#334155', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: newNodeLogic === 'OR' ? 'bold' : 'normal' }}>OR</button>
              <button onClick={() => setNewNodeLogic('AND')}
                style={{ flex: 1, padding: '6px', borderRadius: 5, border: 'none', background: newNodeLogic === 'AND' ? '#7c3aed' : '#334155', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: newNodeLogic === 'AND' ? 'bold' : 'normal' }}>AND</button>
            </div>
            <p style={{ color: '#475569', fontSize: 10, marginBottom: 8 }}>
              {newNodeLogic === 'OR' ? '🔵 OR: Attacker needs only ONE of the sibling methods' : '🟣 AND: Attacker needs ALL sibling methods to succeed'}
            </p>
            <button onClick={addNode} disabled={!newNodeLabel.trim() || selectedNode === null}
              style={{ width: '100%', padding: '8px', background: (newNodeLabel.trim() && selectedNode !== null) ? '#2563eb' : '#334155', color: 'white', border: 'none', borderRadius: 5, cursor: (newNodeLabel.trim() && selectedNode !== null) ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 'bold' }}>
              Add Child Node
            </button>
          </div>

          {/* Progress */}
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>📊 Progress</h3>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Nodes added: <strong style={{ color: 'white' }}>{nodes.length}</strong></p>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Overall score: <strong style={{ color: '#34d399' }}>{evaluation.percentage}%</strong></p>
            <div style={{ marginTop: 6, background: '#0f172a', borderRadius: 5, height: 8 }}>
              <div style={{ height: 8, borderRadius: 5, background: evaluation.percentage >= 70 ? '#10b981' : evaluation.percentage >= 30 ? '#f59e0b' : '#2563eb', width: `${evaluation.percentage}%`, transition: 'width 0.4s' }} />
            </div>
            {/* Category breakdown */}
            {Object.entries(evaluation.categoryScores || {}).map(([cat, score]) => (
              <div key={cat} style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: 10 }}>{cat}</span>
                  <span style={{ color: score.matched > 0 ? '#34d399' : '#475569', fontSize: 10 }}>{score.matched}/{score.total}</span>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 3, height: 3, marginTop: 2 }}>
                  <div style={{ height: 3, borderRadius: 3, background: score.matched > 0 ? '#34d399' : '#334155', width: `${score.percentage}%` }} />
                </div>
              </div>
            ))}
            {scenario.scaffolded && <p style={{ color: '#475569', fontSize: 10, marginTop: 6 }}>Scaffolding reduces at 30% and 70%</p>}
          </div>

          <button onClick={handleFinish}
            style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>
            ✅ Finish & See Example Tree
          </button>
        </div>
      </div>

      {/* Comparison */}
      {showComparison && (
        <div style={{ marginTop: 20, background: '#1e293b', borderRadius: 10, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>📊 Your Results</h2>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              Overall score: <strong style={{ color: '#34d399' }}>{evaluation.percentage}%</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: 12 }}>
              Node coverage: {evaluation.nodePercentage}% · Category coverage: {evaluation.categoryPercentage}% · Tree depth: {evaluation.maxDepth}
            </p>
            <div style={{ marginTop: 8, background: '#1e293b', borderRadius: 5, height: 10 }}>
              <div style={{ height: 10, borderRadius: 5, background: '#2563eb', width: `${evaluation.percentage}%` }} />
            </div>
            {evaluation.matchedDetails && evaluation.matchedDetails.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Matched (click any item to see why it was recognised):</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {evaluation.matchedDetails.map((m, i) => (
                    <button key={i} onClick={() => setExpandedMatch(expandedMatch === m.referenceNode ? null : m.referenceNode)}
                      style={{ background: expandedMatch === m.referenceNode ? '#166534' : '#0f172a', border: '1px solid #334155', color: '#6ee7b7', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', fontSize: 11 }}>
                      ✅ {m.referenceNode}
                    </button>
                  ))}
                </div>
                {expandedMatch && (() => {
                  const detail = evaluation.matchedDetails.find(m => m.referenceNode === expandedMatch);
                  if (!detail) return null;
                  return (
                    <div style={{ marginTop: 8, background: '#0f172a', borderRadius: 6, padding: 10, borderLeft: '3px solid #34d399' }}>
                      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Your node: <span style={{ color: 'white' }}>"{detail.userLabel}"</span></p>
                      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Match type: <span style={{ color: 'white' }}>{detail.explanation.type}</span></p>
                      <p style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{detail.explanation.detail}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#60a5fa' }}>🌳 Your Tree</h3>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>{renderTree(0)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#34d399' }}>✅ Example Tree</h3>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}><ExampleTree treeData={scenario.exampleTree} /></div>
            </div>
          </div>
          <button onClick={() => onComplete(evaluation)}
            style={{ marginTop: 16, padding: '10px 24px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>
            Mark as Complete & Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// Group A (full flow) answers q1-q5 about the scaffolding they used.
// Group B (control) never sees scaffolding, so they answer q6-q8 instead —
// a shorter set that never references scaffolding. q5 and q8 ask the same
// "overall ease of use" question in identical wording but are stored in
// separate columns, so each group's answer to it can be compared directly
// without asking anyone the same question twice.
function Questionnaire({ onSubmit, sessionId }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '' });
  const questionsA = [
    { id: 'q1', text: 'The scaffolding support (suggestions and hints) helped me understand what to include in my attack tree.' },
    { id: 'q2', text: 'The expandable suggestion categories with explanations made it easier to identify and add specific attacks.' },
    { id: 'q3', text: 'The automatic reduction of scaffolding felt natural — I did not feel lost when support was reduced.' },
    { id: 'q4', text: 'I felt more confident constructing the unscaffolded trees after completing the scaffolded ones.' },
    { id: 'q5', text: 'Overall, the tool was easy to use and understand.' },
  ];
  const questionsB = [
    { id: 'q6', text: 'The tutorial gave me a clear understanding of what an attack tree should include.' },
    { id: 'q7', text: 'I felt confident about what to include in my attack trees.' },
    { id: 'q8', text: 'Overall, the tool was easy to use and understand.' },
  ];
  const scale = ['1\nStrongly\nDisagree', '2\nDisagree', '3\nNeutral', '4\nAgree', '5\nStrongly\nAgree'];

  const groupAAnswered = questionsA.every(q => answers[q.id] !== '');
  const groupBAnswered = questionsB.every(q => answers[q.id] !== '');
  const allAnswered = groupAAnswered || groupBAnswered;

  const handleSubmit = async () => {
    // Send all eight keys so the database row shape is always consistent —
    // whichever group didn't answer a question sends null for it.
    const fullAnswers = {};
    ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].forEach(id => {
      fullAnswers[id] = answers[id] === '' ? null : answers[id];
    });
    try {
      await fetch(`${API_URL}/api/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answers: fullAnswers })
      });
    } catch (e) {
      console.log('Backend not available');
    }
    onSubmit(fullAnswers);
  };

  const renderQuestion = (q, displayNum) => (
    <div key={q.id} style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 14, marginBottom: 8 }}>{displayNum}. {q.text}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {scale.map((label, val) => (
          <button key={val} onClick={() => setAnswers({ ...answers, [q.id]: val + 1 })}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: answers[q.id] === val + 1 ? '#2563eb' : '#0f172a', color: 'white', cursor: 'pointer', fontSize: 11, whiteSpace: 'pre-line', lineHeight: 1.4, textAlign: 'center' }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, maxWidth: 720 }}>
      <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>📝 Usability Questionnaire</h2>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: 12, marginBottom: 20 }}>
        <p style={{ color: '#fcd34d', fontSize: 12.5, lineHeight: 1.6 }}>
          ℹ️ If you completed the <strong>full sequence</strong> (scaffolded scenarios then transfer scenarios), please answer questions <strong>1–5</strong>.
          If you only completed the scenarios <strong>without scaffolding</strong>, please answer questions <strong>6–8</strong>.
        </p>
      </div>
      {questionsA.map((q, i) => renderQuestion(q, i + 1))}
      {questionsB.map((q, i) => renderQuestion(q, i + 6))}
      <button onClick={handleSubmit} disabled={!allAnswered}
        style={{ marginTop: 10, padding: '10px 24px', background: allAnswered ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 'bold' }}>
        Submit Questionnaire
      </button>
    </div>
  );
}

// Fisher-Yates shuffle — used to randomise presentation order within a group
// of scenarios, to control for practice/order effects between participants.
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Builds a per-participant presentation order: the 3 scaffolded scenarios are
// shuffled among themselves, and the 2 transfer-task scenarios are shuffled
// among themselves — but the scaffolded group always comes before the
// transfer group, because the transfer task's validity depends on scaffolding
// being experienced first.
function buildScenarioOrder() {
  const scaffoldedIds = SCENARIOS.filter(s => s.scaffolded).map(s => s.id);
  const transferIds = SCENARIOS.filter(s => !s.scaffolded).map(s => s.id);
  return [...shuffleArray(scaffoldedIds), ...shuffleArray(transferIds)];
}

function App() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [scenarioOrder, setScenarioOrder] = useState(() => buildScenarioOrder());
  // Cross-scenario history used to make fading/hints respond to patterns
  // across the whole session, not just the current tree (see TreeBuilder).
  const [sessionHistory, setSessionHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [participantInput, setParticipantInput] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [savedTrees, setSavedTrees] = useState({});

  const handleStart = async () => {
    if (!participantInput.trim()) return;
    setParticipantId(participantInput.trim());
    try {
      const res = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantInput.trim(), scenario_order: scenarioOrder })
      });
      const data = await res.json();
      setSessionId(data.session_id);
    } catch (e) {
      setSessionId(Math.floor(Math.random() * 10000));
    }
    setSessionStarted(true);
  };

  // orderedScenarios is this participant's randomised presentation order —
  // scaffolded group first (shuffled), then transfer group (shuffled).
  const orderedScenarios = scenarioOrder.map(id => SCENARIOS.find(s => s.id === id)).filter(Boolean);
  const scenario = orderedScenarios[currentScenario] || SCENARIOS[0];
  const completedCount = results.length;

  const handleScenarioComplete = (evaluation) => {
    const existing = results.find(r => r.scenarioId === scenario.id);
    if (!existing) {
      setResults(prev => [...prev, { scenarioId: scenario.id, title: scenario.title, ...evaluation }]);
      // Record what this participant struggled with on this scenario, so
      // later scenarios' hints can respond to patterns across the session
      // rather than only the current tree (see getSocraticPrompt).
      setSessionHistory(prev => [...prev, {
        scenarioId: scenario.id,
        missingCategories: evaluation.missingCategories || [],
        logicIssues: evaluation.logicIssues || []
      }]);
    }
    // Advance to next scenario if available
    if (currentScenario < orderedScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    }
  };

  if (!sessionStarted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 40, maxWidth: 440, width: '100%' }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>🌳 Scaffolded Attack Tree Builder</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>Guided Threat Modelling Tool — Dissertation Project by Yiwen Tan</p>
          <p style={{ fontSize: 14, marginBottom: 8 }}>Please enter your Participant ID to begin:</p>
          <input type="text" value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. P01, P02..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
          <button onClick={handleStart} disabled={!participantInput.trim()}
            style={{ width: '100%', padding: '10px', background: participantInput.trim() ? '#2563eb' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: participantInput.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 'bold' }}>
            Start Session →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>🌳 Scaffolded Attack Tree Builder</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Participant: {participantId}</span>
          <button onClick={() => { setSessionStarted(false); setParticipantInput(''); setResults([]); setCurrentScenario(0); setShowQuestionnaire(false); setSessionComplete(false); setTutorialComplete(false); }}
            style={{ fontSize: 11, padding: '3px 8px', background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 4, cursor: 'pointer' }}>
            Exit
          </button>
        </div>
      </div>
      <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 13 }}>Guided Threat Modelling Tool — Dissertation Project by Yiwen Tan</p>

      {!tutorialComplete && <Tutorial onComplete={() => setTutorialComplete(true)} />}

      {tutorialComplete && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {orderedScenarios.map((s, i) => (
              <div key={s.id} onClick={() => { setShowQuestionnaire(false); setSessionComplete(false); setCurrentScenario(i); }}
                style={{ flex: 1, minWidth: 100, padding: '6px 8px', borderRadius: 6, fontSize: 11, textAlign: 'center', cursor: 'pointer',
                background: results.find(r => r.scenarioId === s.id) ? '#166534' : i === currentScenario ? '#2563eb' : '#1e293b',
                color: results.find(r => r.scenarioId === s.id) ? '#6ee7b7' : 'white',
                border: i === currentScenario ? '2px solid #60a5fa' : '2px solid transparent' }}>
                {results.find(r => r.scenarioId === s.id) ? '✅ ' : `${i + 1}. `}{s.title.split(' ').slice(0, 2).join(' ')}
                {!s.scaffolded && <span style={{ display: 'block', fontSize: 9, color: '#f87171' }}>No Scaffolding</span>}
              </div>
            ))}
          </div>

          {completedCount > 0 && !showQuestionnaire && !sessionComplete && (
            <div style={{ marginBottom: 16, padding: '10px 16px', background: '#1e293b', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{completedCount}/{orderedScenarios.length} scenarios completed</span>
              <button onClick={() => setShowQuestionnaire(true)}
                style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>
                Go to Questionnaire →
              </button>
            </div>
          )}

          {!showQuestionnaire && !sessionComplete && (
            <>
              <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16, borderLeft: `4px solid ${scenario.scaffolded ? '#2563eb' : '#dc2626'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 'bold' }}>📋 Scenario {currentScenario + 1}: {scenario.title}</h2>
                  {!scenario.scaffolded && <span style={{ fontSize: 11, background: '#dc2626', padding: '2px 6px', borderRadius: 3 }}>Transfer Task — No Scaffolding</span>}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{scenario.description}</p>
              </div>
              <TreeBuilder
                key={currentScenario}
                scenario={scenario}
                onComplete={handleScenarioComplete}
                sessionId={sessionId}
                presentationPosition={results.length + 1}
                sessionHistory={sessionHistory}
                savedNodes={savedTrees[currentScenario]}
                onSaveNodes={(nodes) => setSavedTrees(prev => ({ ...prev, [currentScenario]: nodes }))}
              />
            </>
          )}

          {showQuestionnaire && !sessionComplete && (
            <Questionnaire onSubmit={() => setSessionComplete(true)} sessionId={sessionId} />
          )}

          {sessionComplete && (
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>🎉 Session Complete!</h2>
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>Thank you for participating. Here is a summary of your performance:</p>
              {results.map((r, i) => (
                <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{r.title}</p>
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>Score: <strong style={{ color: '#34d399' }}>{r.percentage}%</strong></p>
                  <div style={{ marginTop: 6, background: '#1e293b', borderRadius: 4, height: 6 }}>
                    <div style={{ height: 6, borderRadius: 4, background: '#2563eb', width: `${r.percentage}%` }} />
                  </div>
                </div>
              ))}
              <p style={{ color: '#475569', fontSize: 12, marginTop: 16 }}>Session ID: {sessionId} — All data has been saved.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;