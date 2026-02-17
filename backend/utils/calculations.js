// Utility functions for calculating scores and generating reports

/**
 * Calculate detailed scores for a single solution
 */
const calculateScores = (solution, scores, criteria) => {
    // Group criteria by category
    const categories = {};
    const totalWeights = {}; // Sum of weights per category (for weighted average)

    // Initialize categories map
    criteria.forEach(c => {
        if (!categories[c.category]) {
            categories[c.category] = {
                name: c.category,
                totalScore: 0,
                maxPossibleScore: 0,
                weightedTotal: 0,
                weightSum: 0,
                criteria: []
            };
        }
        categories[c.category].criteria.push(c);
    });

    // Global accumulators for Overall Score
    let globalWeightedTotal = 0;
    let globalWeightSum = 0;

    // Process scores
    scores.forEach(scoreItem => {
        const criterion = criteria.find(c => c.id === scoreItem.criterionId);
        if (criterion) {
            const cat = categories[criterion.category];
            const numericScore = parseFloat(scoreItem.score) || 0;
            const weight = criterion.weight || 1;

            // Category Level
            cat.totalScore += numericScore;
            cat.maxPossibleScore += 5; // Rubric assumes max score of 5
            cat.weightedTotal += numericScore * weight;
            cat.weightSum += weight;

            // Global Level
            globalWeightedTotal += numericScore * weight;
            globalWeightSum += weight;
        }
    });

    // Calculate averages per category
    const categoryResults = Object.values(categories).map(cat => {
        const avgScore = cat.weightSum > 0 ? (cat.weightedTotal / cat.weightSum) : 0;
        return {
            category: cat.name,
            score: parseFloat(avgScore.toFixed(2)),
            rawTotal: cat.totalScore,
            itemCount: cat.criteria.length
        };
    });

    // Calculate Overall Score (True Weighted Average)
    const overallScore = globalWeightSum > 0 ? (globalWeightedTotal / globalWeightSum) : 0;

    // MITRE ATT&CK Coverage
    // Filter related criteria
    const mitreCriteria = criteria.filter(c => c.category === 'Detection & Prevention');
    const mitreScores = scores.filter(s => {
        const c = criteria.find(cri => cri.id === s.criterionId);
        return c && c.category === 'Detection & Prevention';
    });

    let mitreScoreTotal = 0;
    // Max score for MITRE is based on max possible score (5)
    let mitreMaxTotal = mitreCriteria.length * 5;

    mitreScores.forEach(s => mitreScoreTotal += (parseFloat(s.score) || 0));
    const coveragePercentage = mitreMaxTotal > 0 ? ((mitreScoreTotal / mitreMaxTotal) * 100) : 0;

    return {
        solutionId: solution.id,
        solutionName: solution.name,
        overallScore: parseFloat(overallScore.toFixed(2)),
        categoryScores: categoryResults,
        metrics: {
            mitreCoverage: parseFloat(coveragePercentage.toFixed(1)) + '%',
            // Add other mock metrics or calculated ones here
            falsePositiveRate: 'Low', // Placeholder as it depends on specific criteria input
            costEfficiency: 'Medium'
        }
    };
};

/**
 * Compare multiple solutions
 */
const runComparison = (solutions, allScores, criteria) => {
    const results = solutions.map(solution => {
        const solutionEntry = allScores.find(s => s.solutionId === solution.id);
        const scores = solutionEntry ? solutionEntry.items : [];
        return calculateScores(solution, scores, criteria);
    });

    // Sort by overall score descending
    results.sort((a, b) => b.overallScore - a.overallScore);

    // Calculate Category Averages
    const categoryTotals = {};
    const categoryCounts = {};

    results.forEach(sol => {
        sol.categoryScores.forEach(c => {
            if (!categoryTotals[c.category]) {
                categoryTotals[c.category] = 0;
                categoryCounts[c.category] = 0;
            }
            categoryTotals[c.category] += c.score;
            categoryCounts[c.category]++;
        });
    });

    const categoryAverages = {};
    Object.keys(categoryTotals).forEach(cat => {
        categoryAverages[cat] = parseFloat((categoryTotals[cat] / categoryCounts[cat]).toFixed(2));
    });

    return {
        rankings: results,
        categoryAverages,
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    calculateScores,
    runComparison
};
