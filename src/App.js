import React, { useState } from 'react';
import './App.css';

// Sample scaffolded scenario
const SCENARIO = "A university student portal allows students to log in, view grades, and submit assignments. Consider how an attacker might compromise this system.";

// Scaffolding hints for novices
const HINTS = [
  "Think about how an attacker might gain access to a user's account.",
  "Consider what could go wrong with the login process.",
  "What could an attacker do once they have access?",
  "Think about the data stored in the system - how could it be stolen or modified?",
  "Consider attacks on the network or server infrastructure."
];

// Reference tree for evaluation
const REFERENCE_NODES = [
  "Compromise Student Portal",
  "Steal Credentials",
  "Phishing Attack",
  "Brute Force Password",
  "SQL Injection",
  "Session Hijacking",
  "Modify Grades",
  "Steal Personal Data",
  "Denial of Service"
];

let nodeIdCounter = 1;

function App() {
  const [nodes, setNodes] = useState([
    { id: 0, label: "Compromise Student Portal", parentId: null, isRoot: true }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [scaffoldingLevel, setScaffoldingLevel] = useState(2); // 0=none, 1=hints only, 2=full

  // Add a child node to the selected node
  const addNode = () => {
    if (!newNodeLabel.trim() || selectedNode === null) return;
    const newNode = {
      id: nodeIdCounter++,
      label: newNodeLabel.trim(),
      parentId: selectedNode
    };
    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
  };

  // Delete a node and its children
  const deleteNode = (nodeId) => {
    if (nodeId === 0) return; // cannot delete root
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

  // Get children of a node
  const getChildren = (nodeId) => nodes.filter(n => n.parentId === nodeId);

  // Evaluate the tree
  const evaluateTree = () => {
    const userLabels = nodes.map(n => n.label.toLowerCase());
    const matched = REFERENCE_NODES.filter(ref =>
      userLabels.some(label => label.includes(ref.toLowerCase()) || ref.toLowerCase().includes(label))
    );
    return {
      total: nodes.length,
      matched: matched.length,
      possible: REFERENCE_NODES.length,
      percentage: Math.round((matched.length / REFERENCE_NODES.length) * 100)
    };
  };

  // Render tree recursively
  const renderTree = (nodeId, depth = 0) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = getChildren(nodeId);
    const isSelected = selectedNode === nodeId;

    return (
      <div key={nodeId} style={{ marginLeft: depth * 24, marginTop: 6 }}>
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
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>🌳 Scaffolded Attack Tree Builder</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Guided Threat Modelling Tool — Dissertation MVP by Yiwen Tan
      </p>

      {/* Scenario */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 20, borderLeft: '4px solid #2563eb' }}>
        <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>📋 Scenario</h2>
        <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>{SCENARIO}</p>
      </div>

      {/* Scaffolding level */}
      {scaffoldingLevel > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 20, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold' }}>💡 Scaffolding Support</h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Level: {scaffoldingLevel === 2 ? 'Full' : 'Hints Only'}</span>
          </div>

          {scaffoldingLevel === 2 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Suggested threat categories to consider:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Credential Theft', 'Injection Attacks', 'Session Attacks', 'Data Exfiltration', 'DoS Attacks'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewNodeLabel(cat)}
                    style={{ background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
                  >
                    + {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setShowHint(!showHint); setCurrentHint((currentHint + 1) % HINTS.length); }}
            style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          {showHint && (
            <p style={{ marginTop: 10, color: '#fcd34d', fontSize: 13 }}>💡 {HINTS[currentHint]}</p>
          )}

          <button
            onClick={() => setScaffoldingLevel(scaffoldingLevel - 1)}
            style={{ marginLeft: 10, background: 'none', border: '1px solid #475569', color: '#94a3b8', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            Reduce Scaffolding ↓
          </button>
        </div>
      )}

      {scaffoldingLevel === 0 && (
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 20, borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#6ee7b7', fontSize: 13 }}>✅ Scaffolding fully withdrawn — you are working independently!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Tree view */}
        <div style={{ flex: 2, minWidth: 300, background: '#1e293b', borderRadius: 10, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>🌳 Attack Tree</h2>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>Click a node to select it, then add child nodes below.</p>
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
            <button
              onClick={addNode}
              disabled={!newNodeLabel.trim() || selectedNode === null}
              style={{ width: '100%', padding: '8px', background: selectedNode !== null ? '#2563eb' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: selectedNode !== null ? 'pointer' : 'not-allowed', fontSize: 14 }}
            >
              Add Child Node
            </button>
          </div>

          {/* Stats */}
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>📊 Progress</h2>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Nodes added: <strong style={{ color: 'white' }}>{nodes.length}</strong></p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Coverage: <strong style={{ color: '#34d399' }}>{evaluation.percentage}%</strong></p>
            <button
              onClick={() => setShowEvaluation(!showEvaluation)}
              style={{ marginTop: 10, width: '100%', padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            >
              {showEvaluation ? 'Hide Evaluation' : 'Evaluate My Tree'}
            </button>
          </div>

          {showEvaluation && (
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>🎯 Evaluation</h2>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Your tree has <strong style={{ color: 'white' }}>{evaluation.total}</strong> nodes.</p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>You identified <strong style={{ color: '#34d399' }}>{evaluation.matched}</strong> out of <strong style={{ color: 'white' }}>{evaluation.possible}</strong> key threat categories.</p>
              <div style={{ marginTop: 10, background: '#0f172a', borderRadius: 6, height: 8 }}>
                <div style={{ height: 8, borderRadius: 6, background: '#2563eb', width: `${evaluation.percentage}%` }} />
              </div>
              <p style={{ color: '#60a5fa', fontSize: 13, marginTop: 6 }}>{evaluation.percentage}% completeness</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;