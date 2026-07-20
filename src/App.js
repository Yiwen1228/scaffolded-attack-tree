import React, { useState } from 'react';
import './App.css';

const SCENARIOS = [
  {
    id: 1,
    title: "University Student Portal",
    description: "A university student portal allows students to log in, view grades, and submit assignments. Consider how an attacker might compromise this system.",
    scaffolded: true,
    hints: [
      "Think about how an attacker might gain access to a user's account.",
      "Consider what could go wrong with the login process.",
      "What could an attacker do once they have access?",
      "Think about the data stored in the system - how could it be stolen or modified?",
      "Consider attacks on the network or server infrastructure."
    ],
    suggestions: ['Credential Theft', 'Injection Attacks', 'Session Attacks', 'Data Exfiltration', 'DoS Attacks'],
    referenceNodes: [
      "Compromise Student Portal", "Steal Credentials", "Phishing Attack",
      "Brute Force Password", "SQL Injection", "Session Hijacking",
      "Modify Grades", "Steal Personal Data", "Denial of Service"
    ]
  },
  {
    id: 2,
    title: "Online Banking Application (Transfer Task)",
    description: "An online banking application allows customers to log in, view balances, and transfer money between accounts. This is an independent task — no scaffolding support is provided. Construct an attack tree for this system.",
    scaffolded: false,
    hints: [],
    suggestions: [],
    referenceNodes: [
      "Compromise Banking App", "Steal Credentials", "Phishing Attack",
      "Man in the Middle", "SQL Injection", "Session Hijacking",
      "Fraudulent Transfer", "Steal Financial Data", "Denial of Service"
    ]
  }
];

let nodeIdCounter = 1;

function Questionnaire({ onSubmit }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });

  const questions = [
    { id: 'q1', text: 'The scaffolding support helped me understand how to construct an attack tree.' },
    { id: 'q2', text: 'The hint prompts were useful when I was unsure what to add.' },
    { id: 'q3', text: 'The fading mechanism felt natural — I did not feel lost when support was removed.' },
    { id: 'q4', text: 'I felt more confident constructing the second (unscaffolded) tree after completing the first.' },
    { id: 'q5', text: 'Overall, the tool was easy to use.' },
  ];

  const scale = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, maxWidth: 700 }}>
      <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>📝 Usability Questionnaire</h2>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
        Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).
      </p>
      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, marginBottom: 8 }}>{i + 1}. {q.text}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {scale.map((label, val) => (
              <button
                key={val}
                onClick={() => setAnswers({ ...answers, [q.id]: val + 1 })}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: answers[q.id] === val + 1 ? '#2563eb' : '#0f172a',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {val + 1} — {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => onSubmit(answers)}
        disabled={Object.values(answers).some(a => a === '')}
        style={{
          marginTop: 10,
          padding: '10px 24px',
          background: Object.values(answers).some(a => a === '') ? '#334155' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: Object.values(answers).some(a => a === '') ? 'not-allowed' : 'pointer',
          fontSize: 14
        }}
      >
        Submit Questionnaire
      </button>
    </div>
  );
}

function TreeBuilder({ scenario }) {
  const [nodes, setNodes] = useState([
    { id: 0, label: scenario.referenceNodes[0], parentId: null, isRoot: true, logic: null }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeLogic, setNewNodeLogic] = useState('OR');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [scaffoldingLevel, setScaffoldingLevel] = useState(scenario.scaffolded ? 2 : 0);

  const addNode = () => {
    if (!newNodeLabel.trim() || selectedNode === null) return;
    const newNode = {
      id: nodeIdCounter++,
      label: newNodeLabel.trim(),
      parentId: selectedNode,
      isRoot: false,
      logic: newNodeLogic
    };
    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
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

  const evaluateTree = () => {
    const userLabels = nodes.map(n => n.label.toLowerCase());
    const matched = scenario.referenceNodes.filter(ref =>
      userLabels.some(label => label.includes(ref.toLowerCase()) || ref.toLowerCase().includes(label))
    );
    return {
      total: nodes.length,
      matched: matched.length,
      possible: scenario.referenceNodes.length,
      percentage: Math.round((matched.length / scenario.referenceNodes.length) * 100)
    };
  };

  const renderTree = (nodeId, depth = 0) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = getChildren(nodeId);
    const isSelected = selectedNode === nodeId;

    return (
      <div key={nodeId} style={{ marginLeft: depth * 24, marginTop: 6 }}>
        {!node.isRoot && node.logic && (
          <span style={{
            fontSize: 10,
            background: node.logic === 'AND' ? '#7c3aed' : '#0891b2',
            color: 'white',
            padding: '1px 6px',
            borderRadius: 4,
            marginLeft: 8,
            marginBottom: 2,
            display: 'inline-block'
          }}>{node.logic}</span>
        )}
        <div
          onClick={() => setSelectedNode(nodeId)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 8,
            background: isSelected ? '#2563eb' : node.isRoot ? '#1e3a5f' : '#1e293b',
            color: 'white',
            cursor: 'pointer',
            border: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
            fontWeight: node.isRoot ? 'bold' : 'normal',
            fontSize: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }}
        >
          {node.isRoot ? '🎯' : '🔴'} {node.label}
          {!node.isRoot && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteNode(nodeId); }}
              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}
            >✕</button>
          )}
        </div>
        {children.length > 0 && (
          <div style={{ borderLeft: '2px solid #334155', marginLeft: 16, paddingLeft: 8 }}>
            {children.map(child => renderTree(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const evaluation = evaluateTree();

  return (
    <div>
      {/* Scaffolding panel */}
      {scaffoldingLevel > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 20, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold' }}>💡 Scaffolding Support</h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Level: {scaffoldingLevel === 2 ? 'Full' : 'Hints Only'}</span>
          </div>
          {scaffoldingLevel === 2 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Suggested threat categories:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {scenario.suggestions.map(cat => (
                  <button key={cat} onClick={() => setNewNodeLabel(cat)}
                    style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    + {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => { setShowHint(!showHint); setCurrentHint((currentHint + 1) % scenario.hints.length); }}
            style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          {showHint && <p style={{ marginTop: 10, color: '#fcd34d', fontSize: 13 }}>💡 {scenario.hints[currentHint]}</p>}
          <button onClick={() => setScaffoldingLevel(scaffoldingLevel - 1)}
            style={{ marginLeft: 10, background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Reduce Scaffolding ↓
          </button>
        </div>
      )}

      {scaffoldingLevel === 0 && scenario.scaffolded && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 20, borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#6ee7b7', fontSize: 13 }}>✅ Scaffolding fully withdrawn — you are working independently!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Tree */}
        <div style={{ flex: 2, minWidth: 300, background: '#1e293b', borderRadius: 10, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>🌳 Attack Tree</h2>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>Click a node to select it, then add child nodes.</p>
          {renderTree(0)}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>➕ Add Node</h2>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
              {selectedNode !== null ? `Adding child to: "${nodes.find(n => n.id === selectedNode)?.label}"` : 'Select a node first'}
            </p>
            <input
              type="text"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
              placeholder="Enter threat node..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }}
            />
            {/* AND/OR selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button onClick={() => setNewNodeLogic('OR')}
                style={{ flex: 1, padding: '6px', borderRadius: 6, border: 'none', background: newNodeLogic === 'OR' ? '#0891b2' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
                OR
              </button>
              <button onClick={() => setNewNodeLogic('AND')}
                style={{ flex: 1, padding: '6px', borderRadius: 6, border: 'none', background: newNodeLogic === 'AND' ? '#7c3aed' : '#1e293b', color: 'white', cursor: 'pointer', fontSize: 13 }}>
                AND
              </button>
            </div>
            <button onClick={addNode} disabled={!newNodeLabel.trim() || selectedNode === null}
              style={{ width: '100%', padding: '8px', background: selectedNode !== null ? '#2563eb' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: selectedNode !== null ? 'pointer' : 'not-allowed', fontSize: 14 }}>
              Add Child Node
            </button>
          </div>

          {/* Progress */}
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>📊 Progress</h2>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Nodes added: <strong style={{ color: 'white' }}>{nodes.length}</strong></p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Coverage: <strong style={{ color: '#34d399' }}>{evaluation.percentage}%</strong></p>
            <div style={{ marginTop: 8, background: '#0f172a', borderRadius: 6, height: 8 }}>
              <div style={{ height: 8, borderRadius: 6, background: '#2563eb', width: `${evaluation.percentage}%`, transition: 'width 0.3s' }} />
            </div>
            <button onClick={() => setShowEvaluation(!showEvaluation)}
              style={{ marginTop: 10, width: '100%', padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
              {showEvaluation ? 'Hide Evaluation' : 'Evaluate My Tree'}
            </button>
          </div>

          {showEvaluation && (
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>🎯 Evaluation</h2>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>You identified <strong style={{ color: '#34d399' }}>{evaluation.matched}</strong> of <strong style={{ color: 'white' }}>{evaluation.possible}</strong> key threat categories.</p>
              <p style={{ color: '#60a5fa', fontSize: 13, marginTop: 6 }}>{evaluation.percentage}% completeness</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);

  const scenario = SCENARIOS[currentScenario];

  const handleNextScenario = () => {
    setCompletedScenarios([...completedScenarios, currentScenario]);
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setShowQuestionnaire(true);
    }
  };

  const handleQuestionnaireSubmit = (answers) => {
    console.log('Questionnaire answers:', answers);
    setQuestionnaireSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>🌳 Scaffolded Attack Tree Builder</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Guided Threat Modelling Tool — Dissertation MVP by Yiwen Tan
      </p>

      {/* Scenario tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentScenario(i)}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
              background: currentScenario === i ? '#2563eb' : completedScenarios.includes(i) ? '#166534' : '#1e293b',
              color: 'white'
            }}>
            {completedScenarios.includes(i) ? '✅ ' : ''}{s.title}
          </button>
        ))}
      </div>

      {/* Scenario description */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 20, borderLeft: `4px solid ${scenario.scaffolded ? '#2563eb' : '#dc2626'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold' }}>📋 {scenario.title}</h2>
          {!scenario.scaffolded && (
            <span style={{ fontSize: 12, background: '#dc2626', padding: '2px 8px', borderRadius: 4 }}>Transfer Task — No Scaffolding</span>
          )}
        </div>
        <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>{scenario.description}</p>
      </div>

      {showQuestionnaire ? (
        questionnaireSubmitted ? (
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>🎉 Thank you!</h2>
            <p style={{ color: '#94a3b8' }}>Your responses have been recorded. The session is complete.</p>
          </div>
        ) : (
          <Questionnaire onSubmit={handleQuestionnaireSubmit} />
        )
      ) : (
        <>
          <TreeBuilder key={currentScenario} scenario={scenario} />
          <div style={{ marginTop: 20 }}>
            <button onClick={handleNextScenario}
              style={{ padding: '10px 24px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>
              {currentScenario < SCENARIOS.length - 1 ? 'Next Scenario →' : 'Complete & Go to Questionnaire →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;