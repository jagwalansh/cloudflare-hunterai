import requests
from bs4 import BeautifulSoup
import urllib.parse
from typing import List, Dict, Any
from engine.constraint_extractor import extract_job_constraints


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def scrape_linkedin(search_query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Scrapes LinkedIn public job search listings for internships.
    Note: LinkedIn aggressively blocks scrapers. This uses a best-effort approach
    on the public HTML pages.
    """
    print(f"Searching LinkedIn for '{search_query}' (limit: {limit})...")
    encoded_query = urllib.parse.quote(f"{search_query} internship")
    url = f"https://www.linkedin.com/jobs/search/?keywords={encoded_query}&location=India&f_TPR=r86400"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            print(f"LinkedIn blocked request or failed: HTTP {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        job_cards = soup.find_all('div', class_='base-card')
        if not job_cards:
            job_cards = soup.find_all('li', class_='jobs-search-results__list-item')
            
        if not job_cards:
            print("LinkedIn returned empty job cards (bot protection likely triggered).")
            return []
            
        jobs = []
        for card in job_cards:
            if len(jobs) >= limit:
                break
                
            title_el = card.find('h3', class_='base-search-card__title')
            company_el = card.find('h4', class_='base-search-card__subtitle')
            loc_el = card.find('span', class_='job-search-card__location')
            link_el = card.find('a', class_='base-card__full-link')
            
            title = title_el.text.strip() if title_el else "Unknown Job"
            company = company_el.text.strip() if company_el else "Unknown Company"
            location = loc_el.text.strip() if loc_el else "Remote"
            link = link_el.get('href') if link_el else ""
            
            if not link:
                continue
            skills = [search_query.capitalize()]
            stipend = "Not Disclosed"
            duration = "Not specified"
            description = f"Internship opportunity for {title} at {company}."
            
            constraints = extract_job_constraints(
                job_title=title,
                company=company,
                location_str=location,
                stipend_str=stipend,
                description=description
            )
            
            jobs.append({
                "job_title": title,
                "company": company,
                "location": location,
                "stipend": stipend,
                "duration": duration,
                "url": link,
                "required_skills": skills,
                "description": description,
                "constraints": constraints,
                "is_remote": "remote" in location.lower() or constraints.get("work_mode") == "remote",
                "stipend_min": constraints.get("stipend_min_val", 0),
                "duration_months": constraints.get("duration_months", 0)
            })
            
        return jobs
        
    except Exception as e:
        print(f"Error scraping LinkedIn listings: {e}")
        return []

if __name__ == "__main__":
    jobs = scrape_linkedin("python", 5)
    print(f"Scraped {len(jobs)} jobs from LinkedIn.")
