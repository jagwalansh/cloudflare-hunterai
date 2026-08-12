import io
import re
from fpdf import FPDF

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = str(text)
    # Replace common unicode symbols with ASCII equivalents for standard Helvetica font
    replacements = {
        "₹": "INR ",
        "®": "",
        "™": "",
        "©": "(c)",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "–": "-",
        "—": "-",
        "…": "...",
        "\u200b": "",
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    # Encode to latin-1 with replace to strip unrepresentable chars
    return text.encode('latin-1', errors='replace').decode('latin-1')

class PremiumReportPDF(FPDF):
    def header(self):
        # Header banner fill
        self.set_fill_color(30, 41, 59) # Slate dark
        self.rect(0, 0, 210, 22, 'F')
        
        self.set_xy(10, 4)
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(248, 250, 252) # White
        self.cell(100, 8, 'HUNTER AI', 0, 0, 'L')
        
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(148, 163, 184) # Light Slate
        self.cell(90, 8, 'CAREER INTELLIGENCE & RECOMMENDATION REPORT', 0, 1, 'R')
        self.ln(10)
        
    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, f'Page {self.page_no()} | Generated automatically by Hunter AI Engine', 0, 0, 'C')
        
    def section_title(self, num, title):
        self.ln(4)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(255, 255, 255)
        self.set_fill_color(15, 23, 42) # Slate dark header
        self.cell(0, 7, f'  {num}. {clean_text(title)}', ln=True, fill=True)
        self.ln(3)

def generate_pdf_report(data: dict) -> bytes:
    pdf = PremiumReportPDF()
    pdf.set_margins(12, 12, 12)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # Metadata Overview Block
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(15, 23, 42)
    cand_name = clean_text(data.get('candidate_name', 'Candidate'))
    pdf.cell(0, 7, f"Candidate Profile Analysis: {cand_name}", ln=True)
    
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 5, f"Report Generated: {clean_text(data.get('generated_date'))} | Task Reference: {clean_text(data.get('task_id'))}", ln=True)
    pdf.ln(3)

    # 1. SUMMARY METRICS (Stats Cards)
    pdf.section_title(1, 'EXECUTIVE METRICS OVERVIEW')
    
    pdf.set_font('Helvetica', 'B', 10)
    col_w = 60
    
    # Card 1: Total Opportunities
    pdf.set_fill_color(241, 245, 249)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(col_w, 14, f" Total Opportunities: {data.get('total_matches', 0)}", border=1, fill=True)
    pdf.cell(3, 14, "", 0, 0)
    
    # Card 2: Average Match Score
    pdf.cell(col_w, 14, f" Average Match Fit: {data.get('avg_score', 0)}%", border=1, fill=True)
    pdf.cell(3, 14, "", 0, 0)
    
    # Card 3: Highest Fit Score
    pdf.set_text_color(16, 185, 129) # Emerald green
    pdf.cell(col_w, 14, f" Top Match Score: {data.get('top_score', 0)}%", border=1, fill=True)
    pdf.ln(18)

    # 2. TOP 5 DASHBOARD RECOMMENDATIONS
    pdf.section_title(2, 'TOP 5 DASHBOARD RECOMMENDATIONS')
    
    top_5 = data.get('top_5_matches', [])
    if top_5:
        for i, match in enumerate(top_5, 1):
            title = clean_text(match.get('job_title', 'Unknown Role'))
            company = clean_text(match.get('company', 'Unknown Company'))
            score = match.get('score', 0)
            location = clean_text(match.get('location', 'Remote'))
            stipend = clean_text(match.get('stipend', 'Disclosed upon application'))
            url = clean_text(match.get('url', '#'))
            matched_s = [clean_text(s) for s in match.get('matched_skills', []) if s]
            missing_s = [clean_text(s) for s in match.get('missing_skills', []) if s]

            # Header row for recommendation item
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_fill_color(226, 232, 240)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(145, 7, f" #{i}  {title} @ {company}", border='TLR', fill=True, ln=0)
            
            # Score Badge
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(16, 185, 129) if score >= 15 else pdf.set_text_color(59, 130, 246)
            pdf.cell(41, 7, f"Fit Score: {score}% ", border='TLR', fill=True, align='R', ln=1)
            
            # Details block
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(51, 65, 85)
            pdf.set_fill_color(248, 250, 252)
            
            info_str = f"Location: {location}  |  Compensation: {stipend}"
            pdf.cell(186, 6, f"  {info_str}", border='LR', fill=True, ln=1)
            
            if matched_s:
                m_str = f"  Matched Skills: {', '.join(matched_s[:5])}"
                pdf.set_text_color(22, 101, 52) # Dark green text
                pdf.cell(186, 5, m_str, border='LR', fill=True, ln=1)
                
            if missing_s:
                gap_str = f"  Skill Gaps to Bridge: {', '.join(missing_s[:5])}"
                pdf.set_text_color(153, 27, 27) # Dark red text
                pdf.cell(186, 5, gap_str, border='LR', fill=True, ln=1)
                
            pdf.set_text_color(37, 99, 235) # Blue link text
            pdf.set_font('Helvetica', 'I', 8)
            link_str = f"  Application Link: {url[:80]}..." if len(url) > 80 else f"  Application Link: {url}"
            pdf.cell(186, 6, link_str, border='BLR', fill=True, ln=1)
            pdf.ln(3)
    else:
        pdf.set_font('Helvetica', 'I', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "No direct recommendations calculated yet. Upload a resume to populate dashboard matches.", ln=True)

    # 3. TOP MATCHED SKILLS
    pdf.section_title(3, 'TOP MATCHED SKILLS (Across all opportunities)')
    matched = data.get('matched_skills', [])
    if matched:
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(22, 101, 52)
        skills_str = ", ".join([clean_text(s) for s in matched])
        pdf.multi_cell(0, 5, f"[MATCHED] {skills_str}")
    else:
        pdf.set_font('Helvetica', 'I', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5, "No clear skill overlap recorded.", ln=True)
    pdf.ln(2)

    # 4. TOP SKILL GAPS
    pdf.section_title(4, 'KEY SKILL GAPS TO BRIDGE')
    gaps = data.get('skill_gaps', [])
    if gaps:
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(153, 27, 27)
        gaps_str = ", ".join([clean_text(g) for g in gaps])
        pdf.multi_cell(0, 5, f"[SKILL GAP] {gaps_str}")
    else:
        pdf.set_font('Helvetica', 'I', 9)
        pdf.set_text_color(16, 185, 129)
        pdf.cell(0, 5, "No critical skill gaps identified.", ln=True)
    pdf.ln(2)

    # 5. SUMMARY & RECOMMENDATIONS
    pdf.section_title(5, 'CAREER ADVISORY SUMMARY')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(30, 41, 59)
    summary_text = (
        f"Candidate '{cand_name}' was evaluated across {data.get('total_matches', 0)} active positions. "
        f"The top-ranked match achieved a compatibility score of {data.get('top_score', 0)}%. "
    )
    if gaps:
        top_gaps = [clean_text(g) for g in gaps[:3]]
        summary_text += (
            f"To increase your match compatibility across more postings, prioritize building projects or adding certifications "
            f"in: {', '.join(top_gaps)}."
        )
    else:
        summary_text += "Your resume profile aligns exceptionally well with active job requisitions."
    
    pdf.multi_cell(0, 5, summary_text)
    
    return pdf.output(dest="S")
