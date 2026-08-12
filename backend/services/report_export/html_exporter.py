import html

def generate_html_report(data: dict) -> str:
    candidate_name = html.escape(str(data.get("candidate_name", "Candidate")))
    generated_date = html.escape(str(data.get("generated_date", "")))
    task_id = html.escape(str(data.get("task_id", "HAI-DASHBOARD-REPORT")))

    total_matches = data.get("total_matches", 0)
    avg_score = data.get("avg_score", 0)
    top_score = data.get("top_score", 0)

    top_5_html = ""
    for i, match in enumerate(data.get("top_5_matches", []), 1):
        job_title = html.escape(str(match.get("job_title", "Unknown Role")))
        company = html.escape(str(match.get("company", "Unknown Company")))
        location = html.escape(str(match.get("location", "Remote")))
        stipend = html.escape(str(match.get("stipend", "Disclosed upon application")))
        score = match.get("score", 0)
        url = html.escape(str(match.get("url", "#")))

        matched_skills = [html.escape(str(s)) for s in match.get("matched_skills", []) if s]
        missing_skills = [html.escape(str(s)) for s in match.get("missing_skills", []) if s]

        matched_chips = "".join([f'<span class="chip matched">{s}</span>' for s in matched_skills]) or '<span class="chip text-muted">None specified</span>'
        missing_chips = "".join([f'<span class="chip gap">{s}</span>' for s in missing_skills]) or '<span class="chip text-muted">No gaps identified</span>'

        score_class = "high-score" if score >= 15 else "mid-score"

        top_5_html += f"""
        <div class="card recommendation-card">
            <div class="card-header">
                <div class="role-title">
                    <span class="rank-badge">#{i}</span>
                    <div>
                        <h3>{job_title}</h3>
                        <p class="company-name">{company} • <span class="location">{location}</span></p>
                    </div>
                </div>
                <div class="score-badge {score_class}">
                    <span class="score-val">{score}%</span>
                    <span class="score-lbl">Match Score</span>
                </div>
            </div>
            
            <div class="card-body">
                <p class="meta-row"><strong>Stipend/Compensation:</strong> {stipend}</p>
                
                <div class="skills-block">
                    <p class="block-label text-success">✓ Matched Skills:</p>
                    <div class="chips-wrapper">{matched_chips}</div>
                </div>
                
                <div class="skills-block" style="margin-top: 10px;">
                    <p class="block-label text-danger">⚠ Skill Gaps to Bridge:</p>
                    <div class="chips-wrapper">{missing_chips}</div>
                </div>
            </div>
            
            <div class="card-footer">
                <a href="{url}" target="_blank" class="apply-btn">View Opportunity & Apply →</a>
            </div>
        </div>
        """

    if not top_5_html:
        top_5_html = '<div class="card"><p class="text-muted">No direct dashboard recommendations calculated yet.</p></div>'

    matched_skills_chips = "".join([f'<span class="chip matched">{html.escape(str(s))}</span>' for s in data.get("matched_skills", [])]) or '<span class="chip text-muted">None</span>'
    skill_gaps_chips = "".join([f'<span class="chip gap">{html.escape(str(s))}</span>' for s in data.get("skill_gaps", [])]) or '<span class="chip text-muted">None</span>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hunter AI - Career Intelligence Report</title>
    <style>
        :root {{
            --bg-page: #0f172a;
            --bg-card: #1e293b;
            --border-card: #334155;
            --text-main: #f8fafc;
            --text-sub: #94a3b8;
            --primary: #3b82f6;
            --emerald: #10b981;
            --rose: #f43f5e;
            --amber: #f59e0b;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-main);
            line-height: 1.6;
            margin: 0;
            padding: 30px 20px;
        }}
        .container {{
            max-width: 850px;
            margin: 0 auto;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid var(--border-card);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            font-size: 28px;
            margin: 0;
            color: var(--primary);
            letter-spacing: 1px;
        }}
        .header p {{
            margin: 5px 0 0 0;
            color: var(--text-sub);
            font-size: 14px;
        }}
        .meta-bar {{
            display: flex;
            justify-content: space-between;
            background: var(--bg-card);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid var(--border-card);
            margin-bottom: 25px;
            font-size: 14px;
        }}
        .grid-3 {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 10px;
            padding: 18px;
            text-align: center;
        }}
        .stat-value {{
            font-size: 32px;
            font-weight: 700;
            color: var(--primary);
        }}
        .stat-value.highlight {{
            color: var(--emerald);
        }}
        .stat-label {{
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-sub);
            margin-top: 4px;
        }}
        .section-title {{
            font-size: 18px;
            color: var(--text-main);
            border-left: 4px solid var(--primary);
            padding-left: 12px;
            margin: 35px 0 15px 0;
        }}
        .card {{
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }}
        .recommendation-card .card-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid var(--border-card);
            padding-bottom: 12px;
            margin-bottom: 12px;
        }}
        .role-title {{
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }}
        .rank-badge {{
            background: var(--primary);
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            padding: 4px 10px;
            border-radius: 6px;
        }}
        .role-title h3 {{
            margin: 0;
            font-size: 18px;
            color: var(--text-main);
        }}
        .company-name {{
            margin: 2px 0 0 0;
            font-size: 13px;
            color: var(--text-sub);
        }}
        .score-badge {{
            text-align: right;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid var(--primary);
            padding: 6px 12px;
            border-radius: 8px;
        }}
        .score-badge.high-score {{
            background: rgba(16, 185, 129, 0.1);
            border-color: var(--emerald);
        }}
        .score-badge.high-score .score-val {{
            color: var(--emerald);
        }}
        .score-val {{
            font-size: 18px;
            font-weight: 800;
            color: var(--primary);
            display: block;
            line-height: 1;
        }}
        .score-lbl {{
            font-size: 10px;
            text-transform: uppercase;
            color: var(--text-sub);
        }}
        .meta-row {{
            font-size: 13px;
            color: var(--text-sub);
            margin: 0 0 10px 0;
        }}
        .block-label {{
            font-size: 12px;
            font-weight: 600;
            margin: 0 0 6px 0;
        }}
        .text-success {{ color: var(--emerald); }}
        .text-danger {{ color: var(--rose); }}
        .text-muted {{ color: var(--text-sub); }}
        .chips-wrapper {{
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }}
        .chip {{
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 4px;
            background: #334155;
            color: #cbd5e1;
        }}
        .chip.matched {{
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }}
        .chip.gap {{
            background: rgba(244, 63, 94, 0.15);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.3);
        }}
        .card-footer {{
            margin-top: 15px;
            text-align: right;
        }}
        .apply-btn {{
            display: inline-block;
            background: var(--primary);
            color: #fff;
            text-decoration: none;
            padding: 7px 15px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            transition: opacity 0.2s;
        }}
        .apply-btn:hover {{ opacity: 0.9; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HUNTER AI</h1>
            <p>CAREER INTELLIGENCE & DASHBOARD SUMMARY REPORT</p>
        </div>

        <div class="meta-bar">
            <div><strong>Candidate:</strong> {candidate_name}</div>
            <div><strong>Generated:</strong> {generated_date}</div>
            <div><strong>Task ID:</strong> {task_id}</div>
        </div>

        <div class="grid-3">
            <div class="stat-card">
                <div class="stat-value">{total_matches}</div>
                <div class="stat-label">Total Jobs Matched</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{avg_score}%</div>
                <div class="stat-label">Avg Compatibility</div>
            </div>
            <div class="stat-card">
                <div class="stat-value highlight">{top_score}%</div>
                <div class="stat-label">Best Fit Score</div>
            </div>
        </div>

        <h2 class="section-title">TOP 5 DASHBOARD RECOMMENDATIONS</h2>
        {top_5_html}

        <h2 class="section-title">TOP MATCHED SKILLS (Across Opportunities)</h2>
        <div class="card">
            <div class="chips-wrapper">{matched_skills_chips}</div>
        </div>

        <h2 class="section-title">KEY SKILL GAPS TO BRIDGE</h2>
        <div class="card">
            <div class="chips-wrapper">{skill_gaps_chips}</div>
        </div>
    </div>
</body>
</html>
"""
