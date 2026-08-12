import requests
from bs4 import BeautifulSoup
import urllib.parse
from typing import List, Dict, Any
from engine.constraint_extractor import extract_job_constraints

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.naukri.com/"
}

def scrape_naukri(search_query: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Scrapes Naukri search listings for internships.
    Note: Naukri employs strict bot protection. This scraper uses a best-effort
    approach on the public HTML pages. If blocked, it gracefully returns an empty list.
    """
    print(f"Searching Naukri for '{search_query}' (limit: {limit})...")
    encoded_query = urllib.parse.quote(f"{search_query} internship")
    url = f"https://www.naukri.com/{encoded_query}-jobs"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            print(f"Naukri blocked request or failed: HTTP {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        job_cards = soup.find_all('article', class_='jobTuple')
        if not job_cards:
            job_cards = soup.find_all('div', class_='srp-jobtuple-wrapper')
            
        if not job_cards:
            print("Naukri returned empty job cards (bot protection likely triggered).")
            return []
            
        jobs = []
        for card in job_cards:
            if len(jobs) >= limit:
                break
                
            title_el = card.find('a', class_='title')
            company_el = card.find('a', class_='subTitle')
            loc_el = card.find('span', class_='locWdth')
            exp_el = card.find('span', class_='expwdth')
            sal_el = card.find('span', class_='sal')
            
            title = title_el.text.strip() if title_el else "Unknown Job"
            company = company_el.text.strip() if company_el else "Unknown Company"
            location = loc_el.text.strip() if loc_el else "Remote"
            stipend = sal_el.text.strip() if sal_el else "Not Disclosed"
            duration = "Not specified" 
            link = title_el.get('href') if title_el else ""
            
            if not link:
                continue
                
            skills = []
            skill_tags = card.find_all('li', class_='dotGt')
            for tag in skill_tags:
                skills.append(tag.text.strip())
                
            if not skills:
                skills = [search_query.capitalize()]
            desc_el = card.find('div', class_='job-description')
            description = desc_el.text.strip() if desc_el else f"Internship for {search_query}"
            
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
        print(f"Error scraping Naukri listings: {e}")
        return []

if __name__ == "__main__":
    jobs = scrape_naukri("python", 5)
    print(f"Scraped {len(jobs)} jobs from Naukri.")
