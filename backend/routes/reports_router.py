from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse
import io

from config.database import get_db
from config.models import User
from routes.auth import get_current_user

from services.report_export.report_builder import build_report_data
from services.report_export.text_exporter import generate_text_report
from services.report_export.pdf_exporter import generate_pdf_report
from services.report_export.csv_exporter import generate_csv_report
from services.report_export.html_exporter import generate_html_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/export/{format}")
def export_career_report(format: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # 1. Build standardized report data from DB without rerunning AI
        report_data = build_report_data(current_user, db)
        
        # 2. Route to specific exporter based on requested format
        if format.lower() == "pdf":
            pdf_bytes = generate_pdf_report(report_data)
            return Response(
                content=bytes(pdf_bytes),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=hunter-ai-career-intelligence-report.pdf"}
            )
            
        elif format.lower() == "csv":
            csv_str = generate_csv_report(report_data)
            return Response(
                content=csv_str.encode('utf-8'),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=hunter-ai-career-intelligence-report.csv"}
            )
            
        elif format.lower() == "html":
            html_str = generate_html_report(report_data)
            return Response(
                content=html_str.encode('utf-8'),
                media_type="text/html",
                headers={"Content-Disposition": "attachment; filename=hunter-ai-career-intelligence-report.html"}
            )
            
        elif format.lower() == "txt":
            txt_str = generate_text_report(report_data)
            return Response(
                content=txt_str.encode('utf-8'),
                media_type="text/plain",
                headers={"Content-Disposition": "attachment; filename=hunter-ai-career-intelligence-report.txt"}
            )
            
        else:
            raise HTTPException(status_code=400, detail="Invalid format requested. Allowed: pdf, csv, html, txt")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
