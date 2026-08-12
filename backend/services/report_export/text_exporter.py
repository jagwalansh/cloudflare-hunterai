def generate_text_report(data: dict) -> str:
    lines = []
    lines.append("=" * 64)
    lines.append("                    HUNTER AI")
    lines.append("       CAREER INTELLIGENCE & DASHBOARD REPORT")
    lines.append("=" * 64)
    lines.append("")
    lines.append(f"Candidate Profile: {data.get('candidate_name', 'Candidate')}")
    lines.append(f"Report Generated : {data.get('generated_date', '')}")
    lines.append(f"Task ID          : {data.get('task_id', 'HAI-DASHBOARD-REPORT')}")
    lines.append("")
    
    lines.append("-" * 64)
    lines.append("1. EXECUTIVE METRICS OVERVIEW")
    lines.append("-" * 64)
    lines.append(f"Total Jobs Matched       : {data.get('total_matches', 0)}")
    lines.append(f"Average Compatibility Fit: {data.get('avg_score', 0)}%")
    lines.append(f"Best Fit Score           : {data.get('top_score', 0)}%")
    lines.append("")
    
    lines.append("-" * 64)
    lines.append("2. TOP 5 DASHBOARD RECOMMENDATIONS")
    lines.append("-" * 64)
    
    top_5 = data.get("top_5_matches", [])
    if top_5:
        for i, match in enumerate(top_5, 1):
            lines.append(f"Rank #{i} | {match.get('job_title', 'Unknown Role')}")
            lines.append(f"  Company    : {match.get('company', 'Unknown Company')}")
            lines.append(f"  Location   : {match.get('location', 'Remote')}")
            lines.append(f"  Stipend    : {match.get('stipend', 'Disclosed upon application')}")
            lines.append(f"  Fit Score  : {match.get('score', 0)}%")
            
            matched = match.get("matched_skills", [])
            if matched:
                lines.append(f"  [+] Matched: {', '.join(matched)}")
                
            gaps = match.get("missing_skills", [])
            if gaps:
                lines.append(f"  [-] Gaps   : {', '.join(gaps)}")
                
            lines.append(f"  Link       : {match.get('url', '#')}")
            lines.append("")
    else:
        lines.append("No direct recommendations available yet.")
        lines.append("")
        
    lines.append("-" * 64)
    lines.append("3. TOP MATCHED SKILLS (Across opportunities)")
    lines.append("-" * 64)
    matched_skills = data.get("matched_skills", [])
    if matched_skills:
        for s in matched_skills:
            lines.append(f"  [+] {s}")
    else:
        lines.append("  None specified")
    lines.append("")

    lines.append("-" * 64)
    lines.append("4. KEY SKILL GAPS TO BRIDGE")
    lines.append("-" * 64)
    gaps = data.get("skill_gaps", [])
    if gaps:
        for g in gaps:
            lines.append(f"  [-] {g}")
    else:
        lines.append("  None specified")
    lines.append("")

    lines.append("-" * 64)
    lines.append("5. EXECUTIVE SUMMARY")
    lines.append("-" * 64)
    cand = data.get('candidate_name', 'Candidate')
    total = data.get('total_matches', 0)
    top = data.get('top_score', 0)
    summary_msg = f"Candidate '{cand}' was matched across {total} positions with a top fit score of {top}%."
    if gaps:
        summary_msg += f" Recommended focus areas for skill enhancement: {', '.join(gaps[:3])}."
    lines.append(summary_msg)
    lines.append("")
    lines.append("=" * 64)

    return "\n".join(lines)
