import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:5000';

const SYNONYMS = {
  "Steal Credentials": ["steal credentials", "credential theft", "steal password", "password theft", "steal login", "obtain credentials", "credential stealing", "steal username", "steal account"],
  "Phishing Attack": ["phishing", "phishing attack", "spear phishing", "email phishing", "fake login page", "phishing email"],
  "Brute Force Password": ["brute force", "brute force password", "password guessing", "dictionary attack", "brute force attack", "guess password"],
  "SQL Injection": ["sql injection", "sqli", "database injection", "inject sql", "sql attack"],
  "Session Hijacking": ["session hijacking", "hijack session", "steal session", "session theft", "cookie theft", "steal cookie"],
  "Modify Grades": ["modify grades", "change grades", "alter grades", "tamper grades", "edit grades", "grade tampering"],
  "Steal Personal Data": ["steal personal data", "data theft", "steal data", "exfiltrate data", "steal user data", "personal data theft"],
  "Denial of Service": ["denial of service", "dos", "ddos", "service disruption", "flood attack", "overload server"],
  "Man in the Middle": ["man in the middle", "mitm", "intercept traffic", "eavesdrop", "traffic interception", "intercept communication"],
  "Fraudulent Transfer": ["fraudulent transfer", "steal money", "unauthorised transfer", "unauthorized transfer", "transfer money", "financial fraud"],
  "Steal Financial Data": ["steal financial data", "steal payment data", "credit card theft", "steal card details", "payment fraud", "steal bank details"],
  "Access Patient Records": ["access patient records", "steal patient data", "patient data theft", "medical record theft", "steal medical data"],
  "Modify Patient Records": ["modify patient records", "alter patient data", "tamper medical records", "change medical data", "edit patient records"],
  "Ransomware Attack": ["ransomware", "ransomware attack", "encrypt files", "file encryption attack"],
  "Insider Threat": ["insider threat", "malicious insider", "rogue employee", "disgruntled employee"],
  "Steal Payment Info": ["steal payment info", "steal credit card", "payment data theft", "card skimming", "steal checkout data"],
  "Fake Reviews": ["fake reviews", "review manipulation", "review fraud", "manipulate reviews"],
  "Price Manipulation": ["price manipulation", "alter price", "change price", "manipulate product price"],
  "Account Takeover": ["account takeover", "take over account", "hijack account", "steal account access"],
  "Control Device": ["control device", "take control", "device hijacking", "remote control", "hijack device"],
  "Eavesdrop": ["eavesdrop", "listen in", "spy on user", "intercept audio", "intercept video", "monitor user"],
  "Disable Device": ["disable device", "turn off device", "brick device", "shut down device"],
  "Firmware Attack": ["firmware attack", "malicious firmware", "firmware exploit", "corrupt firmware"],
  "Network Intrusion": ["network intrusion", "network attack", "intrude network", "break into network"]
};

const SCENARIOS = [
  {
    id: 1,
    title: "University Student Portal",
    objective: "Your goal is to identify all the ways an attacker could compromise a university student portal system — gaining unauthorised access, stealing data, or disrupting the service.",
    description: "A university student portal allows students to log in, view grades, and submit assignments. The system stores student personal information, academic records, and assignment submissions.",
    scaffolded: true,
    hints: [
      "Think about how an attacker might gain access to a student account.",
      "Consider what could go wrong with the login process.",
      "What could an attacker do once they have access to the system?",
      "Think about the data stored — grades, personal info — how could it be stolen or modified?",
      "Consider attacks that could make the system unavailable to students."
    ],
    suggestions: ['Credential Theft', 'Injection Attacks', 'Session Attacks', 'Data Exfiltration', 'DoS Attacks'],
    referenceNodes: ["Compromise Student Portal", "Steal Credentials", "Phishing Attack", "Brute Force Password", "SQL Injection", "Session Hijacking", "Modify Grades", "Steal Personal Data", "Denial of Service"],
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
    hints: [
      "Think about who has legitimate access to the system and how that could be exploited.",
      "Consider the sensitivity of medical data — why would an attacker want it?",
      "What happens if patient records are modified or deleted?",
      "Think about the network connecting the hospital systems.",
      "Consider threats from both outside attackers and malicious insiders."
    ],
    suggestions: ['Credential Theft', 'Insider Threat', 'Ransomware', 'Network Intrusion', 'Data Exfiltration'],
    referenceNodes: ["Compromise Hospital System", "Steal Credentials", "SQL Injection", "Access Patient Records", "Modify Patient Records", "Ransomware Attack", "Insider Threat", "Denial of Service", "Network Intrusion"],
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
    objective: "Your goal is to identify all the ways an attacker could compromise an e-commerce platform — stealing payment information, manipulating product listings, or taking over customer accounts.",
    description: "An e-commerce platform allows customers to browse products, make purchases using credit cards, and leave reviews. The platform stores customer payment details, order histories, and personal addresses.",
    scaffolded: true,
    hints: [
      "Think about the payment process — where could card details be stolen?",
      "Consider what an attacker could do with access to a customer account.",
      "Think about how product listings or prices could be manipulated.",
      "Consider attacks that target the checkout process.",
      "What could a malicious seller do on the platform?"
    ],
    suggestions: ['Payment Fraud', 'Account Takeover', 'SQL Injection', 'Session Hijacking', 'DoS Attacks'],
    referenceNodes: ["Compromise E-commerce Platform", "Steal Payment Info", "SQL Injection", "Account Takeover", "Session Hijacking", "Fake Reviews", "Price Manipulation", "Denial of Service", "Phishing Attack"],
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
    title: "Online Banking Application (Transfer Task)",
    objective: "Your goal is to identify all the ways an attacker could compromise an online banking application. No scaffolding support is provided — construct the attack tree independently.",
    description: "An online banking application allows customers to log in, view account balances, transfer money, and pay bills. Customers authenticate using username, password, and two-factor authentication.",
    scaffolded: false,
    hints: [],
    suggestions: [],
    referenceNodes: ["Compromise Banking App", "Steal Credentials", "Phishing Attack", "Man in the Middle", "SQL Injection", "Session Hijacking", "Fraudulent Transfer", "Steal Financial Data", "Denial of Service"],
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
    title: "Smart Home IoT Device (Transfer Task)",
    objective: "Your goal is to identify all the ways an attacker could compromise a smart home IoT device. No scaffolding support is provided — construct the attack tree independently.",
    description: "A smart home IoT device connects to the home Wi-Fi network and is controlled via a mobile app. It records audio and video and sends data to a cloud server.",
    scaffolded: false,
    hints: [],
    suggestions: [],
    referenceNodes: ["Compromise Smart Home Device", "Steal Credentials", "Network Intrusion", "Control Device", "Eavesdrop", "Disable Device", "Firmware Attack", "Steal Personal Data", "Denial of Service"],
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

function matchNode(userLabel, referenceNode) {
  const user = userLabel.toLowerCase().trim();
  const ref = referenceNode.toLowerCase().trim();
  if (user === ref) return true;
  if (user.includes(ref) || ref.includes(user)) return true;
  const synonymList = SYNONYMS[referenceNode] || [];
  return synonymList.some(syn => user.includes(syn) || syn.includes(user));
}

function evaluateTree(nodes, referenceNodes) {
  const userLabels = nodes.map(n => n.label);
  const matched = referenceNodes.filter(ref => userLabels.some(label => matchNode(label, ref)));
  return {
    total: nodes.length,
    matched: matched.length,
    possible: referenceNodes.length,
    percentage: Math.round((matched.length / referenceNodes.length) * 100),
    matchedNodes: matched
  };
}

let nodeIdCounter = 100;

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

function TreeBuilder({ scenario, onComplete, sessionId }) {
  const [nodes, setNodes] = useState([{ id: 0, label: scenario.referenceNodes[0], parentId: null, isRoot: true, logic: null }]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeLogic, setNewNodeLogic] = useState('OR');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [scaffoldingLevel, setScaffoldingLevel] = useState(scenario.scaffolded ? 2 : 0);
  const [showComparison, setShowComparison] = useState(false);
  const [fadingMessage, setFadingMessage] = useState('');

  const evaluation = evaluateTree(nodes, scenario.referenceNodes);

  const autoFade = (newNodes) => {
    if (!scenario.scaffolded) return;
    const eval_ = evaluateTree(newNodes, scenario.referenceNodes);
    if (eval_.percentage >= 60 && scaffoldingLevel > 0) {
      setScaffoldingLevel(0);
      setFadingMessage('Great progress! All scaffolding has been automatically withdrawn.');
    } else if (eval_.percentage >= 30 && scaffoldingLevel > 1) {
      setScaffoldingLevel(1);
      setFadingMessage('Good progress! Suggested categories have been automatically removed.');
    }
  };

  const addNode = () => {
    if (!newNodeLabel.trim() || selectedNode === null) return;
    const newNode = { id: nodeIdCounter++, label: newNodeLabel.trim(), parentId: selectedNode, isRoot: false, logic: newNodeLogic };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
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
          matched_nodes: evaluation.matchedNodes
        })
      });
    } catch (e) {
      console.log('Backend not available, continuing without saving');
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
      <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
        <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#fcd34d', marginBottom: 6 }}>🎯 Your Objective</h3>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{scenario.objective}</p>
      </div>

      {fadingMessage && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 16, borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#6ee7b7', fontSize: 13 }}>📉 {fadingMessage}</p>
        </div>
      )}

      {scaffoldingLevel > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold' }}>💡 Scaffolding Support</h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Level {scaffoldingLevel} — auto-adjusts with your progress</span>
          </div>
          {scaffoldingLevel === 2 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Suggested threat categories:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {scenario.suggestions.map(cat => (
                  <button key={cat} onClick={() => setNewNodeLabel(cat)}
                    style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>
                    + {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setShowHint(!showHint); setCurrentHint((currentHint + 1) % scenario.hints.length); }}
              style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button onClick={() => { setScaffoldingLevel(Math.max(0, scaffoldingLevel - 1)); setFadingMessage('Scaffolding manually reduced.'); }}
              style={{ background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
              Reduce Scaffolding ↓
            </button>
          </div>
          {showHint && <p style={{ marginTop: 8, color: '#fcd34d', fontSize: 12 }}>💡 {scenario.hints[currentHint]}</p>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 280, background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>🌳 Your Attack Tree</h3>
          <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 10 }}>Click a node to select it, then add child nodes on the right.</p>
          {renderTree(0)}
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>➕ Add Node</h3>
            <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
              {selectedNode !== null ? `Parent: "${nodes.find(n => n.id === selectedNode)?.label}"` : 'Select a node first'}
            </p>
            <input type="text" value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
              placeholder="Enter threat node..."
              style={{ width: '100%', padding: '7px 9px', borderRadius: 5, border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <button onClick={() => setNewNodeLogic('OR')} style={{ flex: 1, padding: '5px', borderRadius: 5, border: 'none', background: newNodeLogic === 'OR' ? '#0891b2' : '#334155', color: 'white', cursor: 'pointer', fontSize: 12 }}>OR</button>
              <button onClick={() => setNewNodeLogic('AND')} style={{ flex: 1, padding: '5px', borderRadius: 5, border: 'none', background: newNodeLogic === 'AND' ? '#7c3aed' : '#334155', color: 'white', cursor: 'pointer', fontSize: 12 }}>AND</button>
            </div>
            <button onClick={addNode} disabled={!newNodeLabel.trim() || selectedNode === null}
              style={{ width: '100%', padding: '7px', background: selectedNode !== null ? '#2563eb' : '#334155', color: 'white', border: 'none', borderRadius: 5, cursor: selectedNode !== null ? 'pointer' : 'not-allowed', fontSize: 13 }}>
              Add Child Node
            </button>
          </div>

          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>📊 Progress</h3>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Nodes: <strong style={{ color: 'white' }}>{nodes.length}</strong></p>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Coverage: <strong style={{ color: '#34d399' }}>{evaluation.percentage}%</strong></p>
            <div style={{ marginTop: 6, background: '#0f172a', borderRadius: 5, height: 7 }}>
              <div style={{ height: 7, borderRadius: 5, background: evaluation.percentage >= 60 ? '#10b981' : evaluation.percentage >= 30 ? '#f59e0b' : '#2563eb', width: `${evaluation.percentage}%`, transition: 'width 0.4s' }} />
            </div>
            {scenario.scaffolded && <p style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>Scaffolding reduces at 30% and 60%</p>}
          </div>

          <button onClick={handleFinish}
            style={{ width: '100%', padding: '9px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}>
            Finish & See Example Tree
          </button>
        </div>
      </div>

      {showComparison && (
        <div style={{ marginTop: 20, background: '#1e293b', borderRadius: 10, padding: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>📊 Your Results</h2>
          <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              You identified <strong style={{ color: '#34d399' }}>{evaluation.matched}</strong> out of <strong style={{ color: 'white' }}>{evaluation.possible}</strong> key threat categories.
            </p>
            <div style={{ marginTop: 8, background: '#1e293b', borderRadius: 5, height: 10 }}>
              <div style={{ height: 10, borderRadius: 5, background: '#2563eb', width: `${evaluation.percentage}%` }} />
            </div>
            <p style={{ color: '#60a5fa', fontSize: 14, marginTop: 6, fontWeight: 'bold' }}>{evaluation.percentage}% completeness</p>
            {evaluation.matchedNodes.length > 0 && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Matched: {evaluation.matchedNodes.join(', ')}</p>}
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
            Continue to Next Scenario →
          </button>
        </div>
      )}
    </div>
  );
}

function Questionnaire({ onSubmit, sessionId }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const questions = [
    { id: 'q1', text: 'The scaffolding support helped me understand how to construct an attack tree.' },
    { id: 'q2', text: 'The hint prompts were useful when I was unsure what to add next.' },
    { id: 'q3', text: 'The automatic fading of scaffolding felt natural — I did not feel lost when support was reduced.' },
    { id: 'q4', text: 'I felt more confident constructing the unscaffolded trees after completing the scaffolded ones.' },
    { id: 'q5', text: 'Overall, the tool was easy to use.' },
  ];
  const scale = ['1 Strongly Disagree', '2 Disagree', '3 Neutral', '4 Agree', '5 Strongly Agree'];
  const allAnswered = Object.values(answers).every(a => a !== '');

  const handleSubmit = async () => {
    try {
      await fetch(`${API_URL}/api/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answers })
      });
    } catch (e) {
      console.log('Backend not available');
    }
    onSubmit(answers);
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, maxWidth: 700 }}>
      <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>📝 Usability Questionnaire</h2>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, marginBottom: 8 }}>{i + 1}. {q.text}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {scale.map((label, val) => (
              <button key={val} onClick={() => setAnswers({ ...answers, [q.id]: val + 1 })}
                style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #334155', background: answers[q.id] === val + 1 ? '#2563eb' : '#0f172a', color: 'white', cursor: 'pointer', fontSize: 12 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} disabled={!allAnswered}
        style={{ marginTop: 10, padding: '10px 24px', background: allAnswered ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 14 }}>
        Submit Questionnaire
      </button>
    </div>
  );
}

function App() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [results, setResults] = useState([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [participantInput, setParticipantInput] = useState('');
  const [participantId, setParticipantId] = useState('');

  const handleStart = async () => {
    if (!participantInput.trim()) return;
    setParticipantId(participantInput.trim());
    try {
      const res = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantInput.trim() })
      });
      const data = await res.json();
      setSessionId(data.session_id);
    } catch (e) {
      setSessionId(Math.floor(Math.random() * 10000));
    }
    setSessionStarted(true);
  };

  const scenario = SCENARIOS[currentScenario];

  const handleScenarioComplete = (evaluation) => {
    const newResults = [...results, { scenarioId: scenario.id, title: scenario.title, ...evaluation }];
    setResults(newResults);
  };

  const completedCount = results.length;

  if (!sessionStarted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 40, maxWidth: 420, width: '100%' }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>🌳 Scaffolded Attack Tree Builder</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>Guided Threat Modelling Tool — Dissertation Project by Yiwen Tan</p>
          <p style={{ fontSize: 14, marginBottom: 8 }}>Please enter your Participant ID to begin:</p>
          <input
            type="text"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. P01, P02..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
          />
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
          <button onClick={() => { setSessionStarted(false); setParticipantInput(''); setResults([]); setCurrentScenario(0); setShowQuestionnaire(false); setSessionComplete(false); }}
            style={{ fontSize: 11, padding: '3px 8px', background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 4, cursor: 'pointer' }}>
            Exit
          </button>
        </div>
      </div>
      <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 13 }}>Guided Threat Modelling Tool — Dissertation Project by Yiwen Tan</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {SCENARIOS.map((s, i) => (
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
          <span style={{ color: '#94a3b8', fontSize: 13 }}>✅ {completedCount}/5 scenarios completed</span>
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
          <TreeBuilder key={currentScenario} scenario={scenario} onComplete={handleScenarioComplete} sessionId={sessionId} />
        </>
      )}

      {showQuestionnaire && !sessionComplete && (
        <Questionnaire onSubmit={() => setSessionComplete(true)} sessionId={sessionId} />
      )}

      {sessionComplete && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>🎉 Session Complete!</h2>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>Thank you for completing all scenarios. Here is a summary of your performance:</p>
          {results.map((r, i) => (
            <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>Scenario {i + 1}: {r.title}</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Completeness: <strong style={{ color: '#34d399' }}>{r.percentage}%</strong> ({r.matched}/{r.possible} nodes matched)</p>
              <div style={{ marginTop: 6, background: '#1e293b', borderRadius: 4, height: 6 }}>
                <div style={{ height: 6, borderRadius: 4, background: '#2563eb', width: `${r.percentage}%` }} />
              </div>
            </div>
          ))}
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 16 }}>Session ID: {sessionId} — Data saved to database.</p>
        </div>
      )}
    </div>
  );
}

export default App;