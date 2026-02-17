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

    // Process scores
    scores.forEach(scoreItem => {
        const criterion = criteria.find(c => c.id === scoreItem.criterionId);
        if (criterion) {
            const cat = categories[criterion.category];
            const numericScore = parseFloat(scoreItem.score) || 0;

            // Raw score sum
            cat.totalScore += numericScore;
            // Max potential (assuming 10 is max score)
            cat.maxPossibleScore += 10;

            // Weighted calculation
            const weight = criterion.weight || 1;
            cat.weightedTotal += numericScore * weight;
            cat.weightSum += weight;
        }
    });

    // Calculate averages per category
    const categoryResults = Object.values(categories).map(cat => {
        const avgScore = cat.weightSum > 0 ? (cat.weightedTotal / cat.weightSum) : 0;
        return {
            category: cat.name,
            score: parseFloat(avgScore.toFixed(2)),
            rawTotal: cat.totalScore,
            itemCount: cat.criteria.length // This might need to be 'answered items' count in a real scenario
        };
    });

    // Calculate Overall Score (Simple average of category scores for now, or weighted category avg)
    // Let's do a weighted average of categories if we had category weights, but for now simple average of category scores
    const overallTotal = categoryResults.reduce((sum, cat) => sum + cat.score, 0);
    const overallScore = categoryResults.length > 0 ? (overallTotal / categoryResults.length) : 0;

    // MITRE ATT&CK Coverage
    // Filter related criteria
    const mitreCriteria = criteria.filter(c => c.category === 'Detection & Prevention');
    const mitreScores = scores.filter(s => {
        const c = criteria.find(cri => cri.id === s.criterionId);
        return c && c.category === 'Detection & Prevention';
    });

    let mitreScoreTotal = 0;
    let mitreMaxTotal = mitreCriteria.length * 10;

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
