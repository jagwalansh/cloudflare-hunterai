# Website Idea: AI-Powered Internship & Job Helper (Brief Summary)

This is a concise summary of the core features and flows for the Internship Helper website, based directly on the raw ideas.

---

## 1. The Core Problems
* **Resume Tailoring is Slow:** Manually copying job links, pasting them with a resume into Claude, suggesting edits, downloading, and renaming files takes too much time and clutters the downloads folder with single-use files.
* **Finding the Right Internships is Hard:** Portals (like Internshala) require too much scrolling, and standard filters still pull in irrelevant jobs (e.g., jobs requiring doctorates when the user is a fresher).

---

## 2. Core Features

### A. Dynamic Preference Filtering (The Likability Slider)
* **Preference List:** User lists preferences (e.g., remote status, skills, location, salary/stipend range, free lunch) in natural language or a JSON format.
* **Priority Order:** The list is ordered by priority (highest priority at the top, lowest at the bottom).
* **The Slider:** A slider allows the user to filter jobs. As the slider value is decreased, items from the *bottom* of the preference list (lowest priority) are removed so that high-priority items at the top remain active.
* **Filter Timing:** The filter can apply automatically 2–3 seconds after the slider stops moving, or manually using a button.

### B. ATS Score Breakdown Modal
When clicking on a job card, it displays a detailed, visual breakdown of the ATS score:
* **The Indicator:** A colored circle percentage ring showing match strength (e.g., full green for high match).
* **Keyword Matches:** Shows what keywords from the job description are present in the resume, with exact words hidden under a dropdown arrow.
* **Skills Matches:** Displays matching skills in green rectangles, and missing skills in grey or another color.
* **Work Experience Relevance:** Semantically evaluates your roles/responsibilities against the job description (e.g., "matches 5/9 responsibilities").
* **Education & Certifications:** Checks if the user has the required qualifications.
* **Formatting/Readability Check:** AI analysis of resume readability.
* **Deficit Bar Chart:** A bar chart showing the percentage of points *missed* in each category (out of the total 100% possible score).
* **Score Notes:** Clear indicators of what is a good or average score (e.g., >80% is excellent, 60-80% is good, 50-60% average, below 50% is lacking).

### C. AI LaTeX Tailoring Workspace (Claude-Style)
* **Layout:** A split panel view:
  * **Left Side:** A RAG chat input area where you ask the AI to make specific edits (e.g., *"change education section to only include my master's"*).
  * **Right Side:** A PDF viewer showing the live-rendered resume.
* **LaTeX Patching:** Instead of sending the full resume code every time, the AI edits only the specific target section code. The script patches this block back into the source files to speed up rendering.
* **Auto-Cleaning Folder:** Downloaded PDFs go to a specific folder that auto-cleans itself (e.g., keeps only the 10 most recent PDFs and deletes older ones).

### D. SQLite Application Tracker
* **Duplicate Guard:** Generates a unique key based on the internship's information to ensure the user does not see jobs they have already applied to.
* **Logging:** Downloading a tailored PDF or checking a card's "Flag as Applied" box automatically saves the job to the database, keeping recently applied listings on top.
