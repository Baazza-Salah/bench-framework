def calculate_scores(solution, scores, criteria):
    # Group criteria by category
    categories = {}
    
    # Initialize categories
    for c in criteria:
        cat_name = c['category']
        if cat_name not in categories:
            categories[cat_name] = {
                'name': cat_name,
                'totalScore': 0,
                'maxPossibleScore': 0,
                'weightedTotal': 0,
                'weightSum': 0,
                'criteria': []
            }
        categories[cat_name]['criteria'].append(c)

    # Process scores
    for score_item in scores:
        criterion = next((c for c in criteria if c['id'] == score_item['criterionId']), None)
        if criterion:
            cat = categories[criterion['category']]
            try:
                numeric_score = float(score_item['score'])
            except:
                numeric_score = 0
            
            # Raw score sum
            cat['totalScore'] += numeric_score
            # Max potential (assuming 10 is max score)
            cat['maxPossibleScore'] += 10
            
            # Weighted calculation
            weight = criterion.get('weight', 1)
            cat['weightedTotal'] += numeric_score * weight
            cat['weightSum'] += weight

    # Calculate averages per category
    category_results = []
    for cat in categories.values():
        avg_score = (cat['weightedTotal'] / cat['weightSum']) if cat['weightSum'] > 0 else 0
        category_results.append({
            'category': cat['name'],
            'score': round(float(avg_score), 2),
            'rawTotal': cat['totalScore'],
            'itemCount': len(cat['criteria'])
        })

    # Calculate Overall Score
    overall_total = sum(cat['score'] for cat in category_results)
    overall_score = (overall_total / len(category_results)) if category_results else 0

    # MITRE ATT&CK Coverage
    mitre_criteria = [c for c in criteria if c['category'] == 'Detection & Prevention']
    mitre_scores = [s for s in scores if any(c['id'] == s['criterionId'] for c in mitre_criteria)]
    
    mitre_score_total = sum(float(s['score']) for s in mitre_scores if str(s['score']).replace('.','',1).isdigit())
    mitre_max_total = len(mitre_criteria) * 10
    
    coverage_percentage = (mitre_score_total / mitre_max_total * 100) if mitre_max_total > 0 else 0

    return {
        'solutionId': solution['id'],
        'solutionName': solution['name'],
        'overallScore': round(overall_score, 2),
        'categoryScores': category_results,
        'metrics': {
            'mitreCoverage': f"{round(coverage_percentage, 1)}%",
            'falsePositiveRate': 'Low', # Placeholder
            'costEfficiency': 'Medium'  # Placeholder
        }
    }

def run_comparison(solutions, all_scores, criteria):
    """
    Compare all solutions based on their scores.
    
    Args:
        solutions: List of solution objects with 'id', 'name', etc.
        all_scores: List of score records, each with 'solutionId', 'timestamp', and 'items'
        criteria: List of criteria objects
    
    Returns:
        Dictionary with 'rankings' and 'categoryAverages'
    """
    results = []
    
    for solution in solutions:
        # Find all score records for this solution
        solution_score_records = [s for s in all_scores if s.get('solutionId') == solution['id']]
        
        # Extract the items from the most recent score record
        # Flatten all score items from all records for this solution
        solution_score_items = []
        for record in solution_score_records:
            items = record.get('items', [])
            solution_score_items.extend(items)
        
        if solution_score_items:
            result = calculate_scores(solution, solution_score_items, criteria)
            
            # Add additional metrics from solution data
            result['metrics']['deploymentType'] = solution.get('deploymentModel', 'N/A')
            result['metrics']['vendor'] = solution.get('vendor', 'N/A')
            result['metrics']['annualCost'] = solution.get('cost', 0)
            
            # Convert category scores list to a dictionary for easier frontend access
            category_score_dict = {}
            for cat in result.get('categoryScores', []):
                category_score_dict[cat['category']] = cat['score']
            result['categoryScores'] = category_score_dict
            
            results.append(result)

    # Sort by overall score descending
    results.sort(key=lambda x: x.get('overallScore', 0), reverse=True)

    # Calculate category averages across all solutions
    category_averages = {}
    if results:
        # Get all unique categories
        all_categories = set()
        for res in results:
            all_categories.update(res.get('categoryScores', {}).keys())
        
        # Calculate average for each category
        for category in all_categories:
            scores = [res['categoryScores'].get(category, 0) for res in results if category in res.get('categoryScores', {})]
            if scores:
                category_averages[category] = round(sum(scores) / len(scores), 2)

    return {
        'rankings': results,
        'categoryAverages': category_averages,
        'timestamp': None  # Add timestamp if needed
    }

