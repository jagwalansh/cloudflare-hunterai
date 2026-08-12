from services.resume_tailor import enforce_factual_integrity


SOURCE = {
    "skills": ["Python", "FastAPI"],
    "projects": [{"title": "Weather App", "description": "Built a weather app using Python.", "technologies": ["Python"]}],
    "education": [{"institution": "Example University", "degree": "B.Tech", "year": "2024"}],
    "experience": [{"company": "Acme", "role": "Intern", "duration": "2023", "description": "Built an API."}],
}


def test_integrity_guard_removes_hallucinated_entries_and_skills():
    candidate = {
        "skills": ["Kubernetes", "FastAPI"],
        "projects": [
            {"title": "Invented project", "description": "Built a Kubernetes platform serving 10,000 users."},
            {"title": "Another fake project", "description": "Fake"},
        ],
        "education": [{"institution": "Fake University", "degree": "PhD", "year": "2030"}],
        "experience": [{"company": "Fake Corp", "role": "Architect", "duration": "2030", "description": "Led a team of 20."}],
    }
    result = enforce_factual_integrity(SOURCE, candidate, {"required_skills": ["Kubernetes"]})

    assert result["skills"] == ["FastAPI", "Python"]
    assert result["projects"] == SOURCE["projects"]
    assert result["education"] == SOURCE["education"]
    assert result["experience"] == SOURCE["experience"]


def test_integrity_guard_allows_safe_wording_only():
    candidate = {
        "skills": ["FastAPI", "Python"],
        "projects": [{"description": "Created a weather application with Python."}],
        "education": [{}],
        "experience": [{"description": "Developed an API."}],
    }
    result = enforce_factual_integrity(SOURCE, candidate, {"required_skills": ["Python"]})

    assert result["projects"][0]["title"] == "Weather App"
    assert result["experience"][0]["company"] == "Acme"
    assert result["projects"][0]["description"] == "Created a weather application with Python."
