import json
import os
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'backend', 'data', 'criteria.json')
OUTPUT_FILE = os.path.join(BASE_DIR, 'criteria_report.tex')

def escape_latex(text):
    """Escapes special LaTeX characters."""
    if not isinstance(text, str):
        return str(text)
    chars = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\^{}',
        '\\': r'\textbackslash{}',
        '<': r'$<$',
        '>': r'$>$',
    }
    return ''.join(chars.get(c, c) for c in text)

def generate_latex():
    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file not found at {DATA_FILE}")
        return

    with open(DATA_FILE, 'r') as f:
        criteria = json.load(f)

    # Group by category
    categories = {}
    for c in criteria:
        cat = c.get('category', 'Uncategorized')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(c)

    # Sort categories and ID
    sorted_cats = sorted(categories.keys())

    latex_content = []
    
    # Header
    latex_content.append(r"""\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{geometry}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{xcolor}
\usepackage{titlesec}
\usepackage{colortbl}

\geometry{a4paper, margin=1in}

\title{SOC Benchmarking Framework \\ Criteria & Rubrics Report}
\author{Generated Report}
\date{\today}

\definecolor{lightgray}{gray}{0.95}

\begin{document}

\maketitle
\tableofcontents
\newpage
""")

    for cat in sorted_cats:
        latex_content.append(f"\\section{{{escape_latex(cat)}}}")
        
        for criterion in categories[cat]:
            name = escape_latex(criterion.get('name', 'Unknown'))
            desc = escape_latex(criterion.get('description', ''))
            crit_id = escape_latex(criterion.get('id', ''))
            weight = criterion.get('weight', 1)
            
            latex_content.append(f"\\subsection{{{name} (ID: {crit_id})}}")
            latex_content.append(f"\\textbf{{Weight:}} {weight} \\\\")
            latex_content.append(f"\\textbf{{Description:}} {desc}")
            latex_content.append(r"\vspace{0.3cm}")
            
            # Rubric Table
            latex_content.append(r"\begin{longtable}{|c|p{12cm}|}")
            latex_content.append(r"\hline")
            latex_content.append(r"\rowcolor{lightgray} \textbf{Level} & \textbf{Description} \\ \hline")
            
            rubric = criterion.get('rubric', {})
            # Sort levels 1-5
            for level in sorted(rubric.keys(), key=lambda x: int(x) if x.isdigit() else x):
                text = escape_latex(rubric[level])
                latex_content.append(f"{level} & {text} \\\\ \\hline")
            
            latex_content.append(r"\end{longtable}")
            latex_content.append(r"\vspace{0.5cm}")

    latex_content.append(r"\end{document}")

    with open(OUTPUT_FILE, 'w') as f:
        f.write('\n'.join(latex_content))
    
    print(f"LaTeX report generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_latex()
