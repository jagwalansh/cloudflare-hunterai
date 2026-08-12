import csv
import io

def generate_csv_report(data: dict) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 1. Header & Overview
    writer.writerow(["HUNTER AI - DASHBOARD SUMMARY & CAREER REPORT"])
    writer.writerow(["Candidate Name", data.get("candidate_name", "Candidate")])
    writer.writerow(["Generated Date", data.get("generated_date", "")])
    writer.writerow(["Task Reference", data.get("task_id", "HAI-DASHBOARD-REPORT")])
    writer.writerow(["Status", data.get("status", "Active")])
    writer.writerow([])
    
    # 2. Executive Metrics
    writer.writerow(["EXECUTIVE METRICS OVERVIEW"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Jobs Matched", data.get("total_matches", 0)])
    writer.writerow(["Average Match Compatibility (%)", f"{data.get('avg_score', 0)}%"])
    writer.writerow(["Best Fit Score (%)", f"{data.get('top_score', 0)}%"])
    writer.writerow([])
    
    # 3. Top 5 Dashboard Recommendations
    writer.writerow(["TOP 5 DASHBOARD RECOMMENDATIONS"])
    writer.writerow(["Rank", "Job Title", "Company", "Location", "Stipend", "Match Score (%)", "Matched Skills", "Skill Gaps to Bridge", "Application Link"])
    
    top_5 = data.get("top_5_matches", [])
    if top_5:
        for i, match in enumerate(top_5, 1):
            matched_str = ", ".join(match.get("matched_skills", []))
            gaps_str = ", ".join(match.get("missing_skills", []))
            writer.writerow([
                i,
                match.get("job_title", "Unknown Role"),
                match.get("company", "Unknown Company"),
                match.get("location", "Remote"),
                match.get("stipend", "Disclosed upon application"),
                f"{match.get('score', 0)}%",
                matched_str or "None",
                gaps_str or "None",
                match.get("url", "#")
            ])
    else:
        writer.writerow(["No direct recommendations available yet."])
    writer.writerow([])
    
    # 4. Aggregate Skills
    writer.writerow(["TOP MATCHED SKILLS (Across opportunities)"])
    writer.writerow(data.get("matched_skills", []))
    writer.writerow([])
    
    writer.writerow(["KEY SKILL GAPS TO BRIDGE"])
    writer.writerow(data.get("skill_gaps", []))
    writer.writerow([])
    
    return output.getvalue()
