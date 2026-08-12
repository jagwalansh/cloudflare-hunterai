import os
import json
from scrapers.internshala_scraper import scrape_internshala
from scrapers.naukri_scraper import scrape_naukri
from scrapers.linkedin_scraper import scrape_linkedin
from engine.matching_engine import load_profiles, rank_jobs
from concurrent.futures import ThreadPoolExecutor

def main():
    print("=====================================================")
    print("🎯 Welcome to Internship Hunter Matching Engine! 🎯")
    print("=====================================================\n")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    profiles_path = os.path.join(current_dir, "data", "user_profiles.json")
    
    if not os.path.exists(profiles_path):
        print(f"❌ Error: User profiles file not found at: {profiles_path}")
        print("Please parse your resume first using: python3 parsers/user_resume_parser.py")
        return
        
    profiles = load_profiles(profiles_path)
    if not profiles:
        print("❌ Error: No user profiles found in database.")
        return
        
    user = profiles[0]
    user_name = user.get("name", "Unknown User")
    user_skills = user.get("skills", [])
    
    print(f"Logged in as: {user_name}")
    print(f"Your Skills ({len(user_skills)}): {', '.join(user_skills)}\n")
    
    keyword = input("Enter keyword to search for internships (e.g. 'machine learning', 'python'): ").strip()
    if not keyword:
        print("❌ Search keyword cannot be empty!")
        return
        
    print(f"\n[1/2] Fetching opportunities for '{keyword}' from Internshala, Naukri, and LinkedIn...")
    
    jobs = []
    def fetch_source(source_fn, limit, source_name):
        try:
            results = source_fn(keyword, limit=limit)
            if results:
                for r in results:
                    r["source"] = source_name
            return results or []
        except Exception as e:
            print(f"{source_name} scraping failed: {e}")
            return []

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [
            executor.submit(fetch_source, scrape_internshala, 10, "Internshala"),
            executor.submit(fetch_source, scrape_naukri, 10, "Naukri"),
            executor.submit(fetch_source, scrape_linkedin, 10, "LinkedIn")
        ]
        for f in futures:
            jobs.extend(f.result())
    
    if not jobs:
        print("❌ No internships found for that keyword. Try another term.")
        return
        
    jobs_path = os.path.join(current_dir, "data", "jobs.json")
    with open(jobs_path, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=4)
        
    print(f"\n[2/2] Matching your profile against {len(jobs)} retrieved opportunities...")
    ranked_results = rank_jobs(user, jobs)
    
    # 5. Output results beautifully
    print("\n=====================================================")
    print(f"📊 RANKED MATCHES FOR {user_name.upper()} 📊")
    print("=====================================================\n")
    
    for idx, match in enumerate(ranked_results, start=1):
        job_title = match["job_title"]
        score = match["score"]
        matched_skills = match["matched_skills"]
        missing_skills = match["missing_skills"]
        
        # Find company name from matched job
        company = "Unknown Company"
        stipend = "Negotiable"
        for j in jobs:
            if j["job_title"] == job_title:
                company = j.get("company", company)
                stipend = j.get("stipend", stipend)
                break
                
        print(f"{idx}. {job_title} at {company}")
        print(f"   Stipend: {stipend}")
        print(f"   Match Score: {score}%")
        print(f"   Matched Skills: {', '.join(matched_skills) if matched_skills else 'None'}")
        print(f"   Missing Skills: {', '.join(missing_skills) if missing_skills else 'None'}")
        print("-" * 50)
        
    print(f"\nResults saved to database files inside the data/ folder. ✅")

if __name__ == "__main__":
    main()
