from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = 'database.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant_id TEXT,
            created_at TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            scenario_id INTEGER,
            scenario_title TEXT,
            nodes TEXT,
            matched INTEGER,
            possible INTEGER,
            percentage INTEGER,
            matched_nodes TEXT,
            created_at TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS questionnaire (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            q1 INTEGER,
            q2 INTEGER,
            q3 INTEGER,
            q4 INTEGER,
            q5 INTEGER,
            created_at TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/api/session', methods=['POST'])
def create_session():
    data = request.json or {}
    participant_id = data.get('participant_id', 'unknown')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO sessions (participant_id, created_at) VALUES (?, ?)',
              (participant_id, datetime.now().isoformat()))
    session_id = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'session_id': session_id})

@app.route('/api/result', methods=['POST'])
def save_result():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO results 
        (session_id, scenario_id, scenario_title, nodes, matched, possible, percentage, matched_nodes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['session_id'], data['scenario_id'], data['scenario_title'],
        json.dumps(data['nodes']), data['matched'], data['possible'],
        data['percentage'], json.dumps(data['matched_nodes']),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

@app.route('/api/questionnaire', methods=['POST'])
def save_questionnaire():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO questionnaire (session_id, q1, q2, q3, q4, q5, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['session_id'],
        data['answers']['q1'], data['answers']['q2'], data['answers']['q3'],
        data['answers']['q4'], data['answers']['q5'],
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

@app.route('/api/data', methods=['GET'])
def get_all_data():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT * FROM sessions')
    sessions = c.fetchall()
    c.execute('SELECT * FROM results')
    results = c.fetchall()
    c.execute('SELECT * FROM questionnaire')
    questionnaires = c.fetchall()
    conn.close()
    return jsonify({
        'sessions': sessions,
        'results': results,
        'questionnaires': questionnaires
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)