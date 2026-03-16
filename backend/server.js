const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { calculateScores, runComparison } = require('./utils/calculations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const SOLUTIONS_FILE = path.join(DATA_DIR, 'solutions.json');
const CRITERIA_FILE = path.join(DATA_DIR, 'criteria.json');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON
const readData = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) || defaultData;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
};

// Helper to write JSON
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const getCurrentUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const users = readData(USERS_FILE);
  return users.find(u => u.token === token) || null;
};

const logAction = (username, action, target, details = "") => {
  const logs = readData(LOGS_FILE);
  logs.unshift({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    username,
    action,
    target,
    details
  });
  writeData(LOGS_FILE, logs.slice(0, 1000));
};

// --- DATA INITIALIZATION ---
// Initialize criteria if empty
const criteriaData = readData(CRITERIA_FILE);
if (criteriaData.length === 0) {
  // const defaultCriteria = require('./data/criteria-seed.json'); 
}

// --- AUTH ENDPOINTS ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const users = readData(USERS_FILE);
  const user = users.find(u => u.username === username);
  
  if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });
  
  if (user.password_hash === hashPassword(password)) {
    const newToken = uuidv4();
    user.token = newToken;
    writeData(USERS_FILE, users);
    return res.json({ token: newToken, username });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const users = readData(USERS_FILE);
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  
  const newToken = uuidv4();
  const newUser = {
    id: uuidv4(),
    username,
    password_hash: hashPassword(password),
    token: newToken
  };
  users.push(newUser);
  writeData(USERS_FILE, users);
  return res.status(201).json({ token: newToken, username });
});

app.get('/api/logs', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData(LOGS_FILE));
});

// --- API ENDPOINTS ---

// Get all solutions
app.get('/api/solutions', (req, res) => {
  const solutions = readData(SOLUTIONS_FILE);
  res.json(solutions);
});

// Add solution
app.post('/api/solutions', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
    const solutions = readData(SOLUTIONS_FILE);
    const newSolution = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    solutions.push(newSolution);
    if (writeData(SOLUTIONS_FILE, solutions)) {
      logAction(user.username, 'CREATE', 'Solution', `Added solution ${newSolution.name || 'Unknown'}`);
      res.status(201).json(newSolution);
    } else {
      res.status(500).json({ error: 'Failed to save solution' });
    }
  } catch (err) {
    console.error("Error adding solution:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update solution
app.put('/api/solutions/:id', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const solutions = readData(SOLUTIONS_FILE);
    const index = solutions.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Protect ID from being overwritten if sent in body, but allow other updates
    const { id, ...updateData } = req.body;
    solutions[index] = { ...solutions[index], ...updateData };

    if (writeData(SOLUTIONS_FILE, solutions)) {
      logAction(user.username, 'UPDATE', 'Solution', `Updated solution ${solutions[index].name || req.params.id}`);
      res.json(solutions[index]);
    } else {
      res.status(500).json({ error: 'Failed to update solution' });
    }
  } catch (err) {
    console.error("Error updating solution:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete solution
app.delete('/api/solutions/:id', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let solutions = readData(SOLUTIONS_FILE);
    const initialLength = solutions.length;
    
    let solName = req.params.id;
    const existing = solutions.find(s => s.id === req.params.id);
    if (existing && existing.name) solName = existing.name;
    
    solutions = solutions.filter(s => s.id !== req.params.id);

    if (solutions.length === initialLength) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    writeData(SOLUTIONS_FILE, solutions);

    // Also delete associated scores
    let scores = readData(SCORES_FILE);
    scores = scores.filter(s => s.solutionId !== req.params.id);
    writeData(SCORES_FILE, scores);

    logAction(user.username, 'DELETE', 'Solution', `Deleted solution ${solName}`);
    res.json({ message: 'Solution deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all criteria
app.get('/api/criteria', (req, res) => {
  const criteria = readData(CRITERIA_FILE);
  res.json(criteria);
});

// Add criterion
app.post('/api/criteria', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const criteria = readData(CRITERIA_FILE);
    const newCriterion = {
      id: uuidv4(),
      ...req.body
    };
    criteria.push(newCriterion);
    if (writeData(CRITERIA_FILE, criteria)) {
      logAction(user.username, 'CREATE', 'Criterion', `Added criterion ${newCriterion.name || 'Unknown'}`);
      res.status(201).json(newCriterion);
    } else {
      res.status(500).json({ error: 'Failed to save criterion' });
    }
  } catch (err) {
    console.error("Error adding criterion:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update criterion
app.put('/api/criteria/:id', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const criteria = readData(CRITERIA_FILE);
    const index = criteria.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Criterion not found' });
    }

    // Preserve ID, update other fields
    criteria[index] = { ...criteria[index], ...req.body, id: req.params.id };

    if (writeData(CRITERIA_FILE, criteria)) {
      logAction(user.username, 'UPDATE', 'Criterion', `Updated criterion ${criteria[index].name || req.params.id}`);
      res.json(criteria[index]);
    } else {
      res.status(500).json({ error: 'Failed to update criterion' });
    }
  } catch (err) {
    console.error("Error updating criterion:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete criterion
app.delete('/api/criteria/:id', (req, res) => {
  try {
    const user = getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let criteria = readData(CRITERIA_FILE);
    const initialLength = criteria.length;
    
    let critName = req.params.id;
    const existing = criteria.find(c => c.id === req.params.id);
    if(existing && existing.name) critName = existing.name;

    criteria = criteria.filter(c => c.id !== req.params.id);

    if (criteria.length === initialLength) {
      return res.status(404).json({ error: 'Criterion not found' });
    }

    if (writeData(CRITERIA_FILE, criteria)) {
      logAction(user.username, 'DELETE', 'Criterion', `Deleted criterion ${critName}`);
      res.json({ message: 'Criterion deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete criterion' });
    }
  } catch (err) {
    console.error("Error deleting criterion:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get scores for a solution
app.get('/api/scores/:solutionId', (req, res) => {
  const scores = readData(SCORES_FILE);
  const solutionEntry = scores.find(s => s.solutionId === req.params.solutionId);
  res.json(solutionEntry ? solutionEntry.items : []);
});

// Subscribe/Update scores (Batch update supported)
app.post('/api/scores', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { solutionId, items } = req.body;

  if (!solutionId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const allScores = readData(SCORES_FILE);
  let solutionEntry = allScores.find(s => s.solutionId === solutionId);

  if (!solutionEntry) {
    solutionEntry = { solutionId, items: [] };
    allScores.push(solutionEntry);
  }

  // Merge items
  items.forEach(newItem => {
    const idx = solutionEntry.items.findIndex(i => i.criterionId === newItem.criterionId);
    if (idx >= 0) {
      solutionEntry.items[idx] = { ...solutionEntry.items[idx], ...newItem };
    } else {
      solutionEntry.items.push(newItem);
    }
  });

  writeData(SCORES_FILE, allScores);
  logAction(user.username, 'UPDATE', 'Scores', `Updated ${items.length} scores for solution ${solutionId}`);
  res.json({ message: 'Scores updated', count: items.length });
});

// Generate Report for Solution
app.get('/api/report/:id', (req, res) => {
  const solutions = readData(SOLUTIONS_FILE);
  const solution = solutions.find(s => s.id === req.params.id);
  if (!solution) return res.status(404).json({ error: 'Solution not found' });

  const allScores = readData(SCORES_FILE);
  const criteria = readData(CRITERIA_FILE);

  const solutionEntry = allScores.find(s => s.solutionId === solution.id);
  const scores = solutionEntry ? solutionEntry.items : [];

  const results = calculateScores(solution, scores, criteria);

  res.json(results);
});

// Comparison Endpoint
app.get('/api/compare', (req, res) => {
  const solutions = readData(SOLUTIONS_FILE);
  const allScores = readData(SCORES_FILE);
  const criteria = readData(CRITERIA_FILE);

  const comparisonResults = runComparison(solutions, allScores, criteria);
  res.json(comparisonResults);
});

// Initialize Demo Data route
app.post('/api/init-demo', (req, res) => {
  try {
    const demoData = require('./data/demo-data.json');
    if (demoData.solutions) writeData(SOLUTIONS_FILE, demoData.solutions);
    if (demoData.scores) writeData(SCORES_FILE, demoData.scores);
    if (demoData.criteria) writeData(CRITERIA_FILE, demoData.criteria);
    res.json({ message: 'Demo data initialized successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
