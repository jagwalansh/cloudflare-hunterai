from ats.scorer import score_resume
from engine.constraint_extractor import extract_job_constraints


JOB_DESCRIPTION = "Python FastAPI internship requiring SQL, Docker, and AWS."


def test_ats_score_rewards_evidence_not_provider_availability():
    weak = score_resume("Student", JOB_DESCRIPTION)
    strong = score_resume(
        """Ada Lovelace\nada@example.com\n
        SKILLS\nPython, FastAPI, SQL, Docker, AWS
        EXPERIENCE\nBuilt and deployed an API used by 500 users, improving response time by 40%.
        PROJECTS\nDeveloped a containerized FastAPI service.
        EDUCATION\nB.Tech Computer Science
        """,
        JOB_DESCRIPTION,
    )

    assert weak["overall_score"] < 60
    assert strong["overall_score"] > weak["overall_score"]
    assert "docker" not in strong["missing_keywords"]


def test_constraint_extraction_is_local_and_structured():
    constraints = extract_job_constraints(
        "Backend Intern",
        "Example",
        "Remote",
        "₹15k/month",
        "This is a remote, 6 month internship. Bachelor's degree preferred.",
    )

    assert constraints["work_mode"] == "remote"
    assert constraints["stipend_min_val"] == 15_000
    assert constraints["duration_months"] == 6
