import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.calculations import calculate_scores, run_comparison

app = Flask(__name__)
CORS(app)

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
SOLUTIONS_FILE = os.path.join(DATA_DIR, 'solutions.json')
CRITERIA_FILE = os.path.join(DATA_DIR, 'criteria.json')
SCORES_FILE = os.path.join(DATA_DIR, 'scores.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Helper to read JSON
def read_data(file_path, default=[]):
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump(default, f, indent=2)
        return default
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return default

# Helper to write JSON
def write_data(file_path, data):
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error writing {file_path}: {e}")
        return False

# --- API ENDPOINTS ---

@app.route('/api/solutions', methods=['GET'])
def get_solutions():
    return jsonify(read_data(SOLUTIONS_FILE))

@app.route('/api/solutions', methods=['POST'])
def add_solution():
    try:
        solutions = read_data(SOLUTIONS_FILE)
        data = request.json
        print(f"Adding solution: {data.get('name')}", flush=True)

        new_solution = {
            'id': str(uuid.uuid4()),
            'name': data.get('name'),
            'vendor': data.get('vendor'),
            'version': data.get('version'),
            'deploymentModel': data.get('deploymentModel'),
            'methodType': data.get('methodType'),
            'licenseInfo': data.get('licenseInfo'),
            'createdAt': datetime.now().isoformat()
        }
        solutions.append(new_solution)
        if write_data(SOLUTIONS_FILE, solutions):
            return jsonify(new_solution), 201
        else:
            return jsonify({'error': 'Failed to write to storage'}), 500
    except Exception as e:
        print(f"Error in add_solution: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/solutions/<id>', methods=['PUT'])
def update_solution(id):
    try:
        solutions = read_data(SOLUTIONS_FILE)
        data = request.json
        print(f"Updating solution {id}: {data.get('name')}", flush=True)

        for i, sol in enumerate(solutions):
            if sol['id'] == id:
                # Update fields but protect ID
                update_data = data.copy()
                if 'id' in update_data:
                    del update_data['id']
                
                solutions[i].update(update_data)
                
                if write_data(SOLUTIONS_FILE, solutions):
                    return jsonify(solutions[i])
                else:
                    return jsonify({'error': 'Failed to write to storage'}), 500
        return jsonify({'error': 'Solution not found'}), 404
    except Exception as e:
        print(f"Error in update_solution: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/solutions/<id>', methods=['DELETE'])
def delete_solution(id):
    try:
        solutions = read_data(SOLUTIONS_FILE)
        print(f"Deleting solution {id}", flush=True)
        
        initial_len = len(solutions)
        solutions = [s for s in solutions if s['id'] != id]
        
        if len(solutions) == initial_len:
            return jsonify({'error': 'Solution not found'}), 404
        
        if not write_data(SOLUTIONS_FILE, solutions):
             return jsonify({'error': 'Failed to write updates'}), 500
        
        # Delete associated scores
        scores = read_data(SCORES_FILE)
        initial_scores_len = len(scores)
        scores = [s for s in scores if s['solutionId'] != id]
        
        if len(scores) != initial_scores_len:
            print(f"Deleted {initial_scores_len - len(scores)} scores associated with solution {id}", flush=True)
            write_data(SCORES_FILE, scores)
        
        return jsonify({'message': 'Solution deleted'})
    except Exception as e:
        print(f"Error in delete_solution: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/criteria', methods=['GET'])
def get_criteria():
    return jsonify(read_data(CRITERIA_FILE))

@app.route('/api/scores/<solution_id>', methods=['GET'])
def get_scores(solution_id):
    scores = read_data(SCORES_FILE)
    solution_scores = [s for s in scores if s['solutionId'] == solution_id]
    return jsonify(solution_scores)

@app.route('/api/criteria', methods=['POST'])
def add_criterion():
    try:
        criteria = read_data(CRITERIA_FILE)
        data = request.json
        print(f"Adding criterion: {data.get('name')}", flush=True)

        new_criterion = {
            'id': str(uuid.uuid4()),
            'name': data.get('name'),
            'category': data.get('category'),
            'weight': int(data.get('weight', 3)),
            'description': data.get('description', ''),
            'rubric': data.get('rubric', {})
        }
        criteria.append(new_criterion)
        if write_data(CRITERIA_FILE, criteria):
            return jsonify(new_criterion), 201
        else:
            return jsonify({'error': 'Failed to write to storage'}), 500
    except Exception as e:
        print(f"Error in add_criterion: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/criteria/<id>', methods=['PUT'])
def update_criterion(id):
    try:
        criteria = read_data(CRITERIA_FILE)
        data = request.json
        print(f"Updating criterion {id}: {data.get('name')}", flush=True)

        for i, crit in enumerate(criteria):
            if crit['id'] == id:
                # Update fields but protect ID
                update_data = data.copy()
                if 'id' in update_data:
                    del update_data['id']
                
                criteria[i].update(update_data)
                
                if write_data(CRITERIA_FILE, criteria):
                    return jsonify(criteria[i])
                else:
                    return jsonify({'error': 'Failed to write to storage'}), 500
        return jsonify({'error': 'Criterion not found'}), 404
    except Exception as e:
        print(f"Error in update_criterion: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/criteria/<id>', methods=['DELETE'])
def delete_criterion(id):
    try:
        criteria = read_data(CRITERIA_FILE)
        print(f"Deleting criterion {id}", flush=True)
        
        initial_len = len(criteria)
        criteria = [c for c in criteria if c['id'] != id]
        
        if len(criteria) == initial_len:
            return jsonify({'error': 'Criterion not found'}), 404
        
        if write_data(CRITERIA_FILE, criteria):
            return jsonify({'message': 'Criterion deleted'})
        else:
            return jsonify({'error': 'Failed to write to storage'}), 500
    except Exception as e:
        print(f"Error in delete_criterion: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/scores', methods=['POST'])
def update_scores():
    data = request.json
    solution_id = data.get('solutionId')
    items = data.get('items', [])
    
    if not solution_id:
        return jsonify({'error': 'solutionId required'}), 400

    scores = read_data(SCORES_FILE)
    
    # Create a new score record for this solution
    new_score_record = {
        'solutionId': solution_id,
        'timestamp': datetime.utcnow().isoformat(),
        'items': items
    }
    
    # Find if there's an existing record for this solution
    existing_index = None
    for i, record in enumerate(scores):
        if record.get('solutionId') == solution_id:
            existing_index = i
            break
    
    # Update existing or append new
    if existing_index is not None:
        scores[existing_index] = new_score_record
    else:
        scores.append(new_score_record)
    
    write_data(SCORES_FILE, scores)
    return jsonify({'message': 'Scores updated', 'count': len(items)})

@app.route('/api/report/<id>', methods=['GET'])
def get_report(id):
    solutions = read_data(SOLUTIONS_FILE)
    solution = next((s for s in solutions if s['id'] == id), None)
    if not solution:
        return jsonify({'error': 'Solution not found'}), 404
        
    scores = read_data(SCORES_FILE)
    criteria = read_data(CRITERIA_FILE)
    
    solution_scores = [s for s in scores if s['solutionId'] == id]
    
    results = calculate_scores(solution, solution_scores, criteria)
    return jsonify(results)

@app.route('/api/compare', methods=['GET'])
def compare_solutions():
    solutions = read_data(SOLUTIONS_FILE)
    scores = read_data(SCORES_FILE)
    criteria = read_data(CRITERIA_FILE)
    
    results = run_comparison(solutions, scores, criteria)
    return jsonify(results)

# API to initialize demo data (helper)
@app.route('/api/init-demo', methods=['POST'])
def init_demo():
    try:
        demo_path = os.path.join(DATA_DIR, 'demo-data.json')
        if os.path.exists(demo_path):
            with open(demo_path, 'r') as f:
                demo_data = json.load(f)
                
            write_data(SOLUTIONS_FILE, demo_data.get('solutions', []))
            write_data(SCORES_FILE, demo_data.get('scores', []))
            # Criteria should ideally be consistent, but we can overwrite if needed
            # write_data(CRITERIA_FILE, demo_data.get('criteria', []))
            
            return jsonify({'message': 'Demo data initialized'})
        else:
            return jsonify({'error': 'Demo data file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
