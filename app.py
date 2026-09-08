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
            scenario_order TEXT,
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
            time_spent INTEGER,
            scaffolding_level_final INTEGER,
            presentation_position INTEGER,
            hint_open_count INTEGER,
            max_hint_level INTEGER,
            logic_warning_count INTEGER,
            structure_warning_count INTEGER,
            category_warning_count INTEGER,
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
            q6 INTEGER,
            q7 INTEGER,
            q8 INTEGER,
            created_at TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    ''')
    conn.commit()

    # --- Backward-compatible migration for databases created before this update ---
    # If the database already existed without these columns, add them now,
    # so existing session/result/questionnaire data collected in earlier
    # milestones is never lost when the schema grows.
    existing_session_cols = [row[1] for row in c.execute('PRAGMA table_info(sessions)').fetchall()]
    if 'scenario_order' not in existing_session_cols:
        c.execute('ALTER TABLE sessions ADD COLUMN scenario_order TEXT')

    existing_result_cols = [row[1] for row in c.execute('PRAGMA table_info(results)').fetchall()]
    if 'presentation_position' not in existing_result_cols:
        c.execute('ALTER TABLE results ADD COLUMN presentation_position INTEGER')
    for col in ['hint_open_count', 'max_hint_level', 'logic_warning_count',
                'structure_warning_count', 'category_warning_count']:
        if col not in existing_result_cols:
            c.execute(f'ALTER TABLE results ADD COLUMN {col} INTEGER')

    # q6-q8 support Group B's shorter, scaffolding-free questionnaire
    # (added when the evaluation design changed to a control-group split).
    existing_questionnaire_cols = [row[1] for row in c.execute('PRAGMA table_info(questionnaire)').fetchall()]
    for col in ['q6', 'q7', 'q8']:
        if col not in existing_questionnaire_cols:
            c.execute(f'ALTER TABLE questionnaire ADD COLUMN {col} INTEGER')

    conn.commit()
    conn.close()

@app.route('/api/session', methods=['POST'])
def create_session():
    data = request.json or {}
    participant_id = data.get('participant_id', 'unknown')
    # scenario_order: list of scenario ids in the order they will be presented
    # to this participant, e.g. [2, 1, 3, 5, 4]. Sent by the frontend after it
    # randomises the order within the scaffolded group and the transfer group.
    scenario_order = data.get('scenario_order', [])
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO sessions (participant_id, scenario_order, created_at) VALUES (?, ?, ?)',
              (participant_id, json.dumps(scenario_order), datetime.now().isoformat()))
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
        (session_id, scenario_id, scenario_title, nodes, matched, possible, percentage, matched_nodes,
         time_spent, scaffolding_level_final, presentation_position,
         hint_open_count, max_hint_level, logic_warning_count, structure_warning_count, category_warning_count,
         created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['session_id'], data['scenario_id'], data['scenario_title'],
        json.dumps(data['nodes']), data['matched'], data['possible'],
        data['percentage'], json.dumps(data['matched_nodes']),
        data.get('time_spent', 0), data.get('scaffolding_level_final', 0),
        data.get('presentation_position', None),
        data.get('hint_open_count', 0), data.get('max_hint_level', 0),
        data.get('logic_warning_count', 0), data.get('structure_warning_count', 0),
        data.get('category_warning_count', 0),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

@app.route('/api/questionnaire', methods=['POST'])
def save_questionnaire():
    data = request.json
    # Group A answers q1-q5; Group B answers q6-q8 instead (a shorter
    # questionnaire that never references scaffolding, since Group B never
    # used it). Whichever group didn't answer a given question simply
    # doesn't send it, so .get() defaults those columns to NULL.
    answers = data.get('answers', {})
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO questionnaire (session_id, q1, q2, q3, q4, q5, q6, q7, q8, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['session_id'],
        answers.get('q1'), answers.get('q2'), answers.get('q3'),
        answers.get('q4'), answers.get('q5'), answers.get('q6'),
        answers.get('q7'), answers.get('q8'),
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