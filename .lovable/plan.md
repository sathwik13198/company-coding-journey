

# 🚀 LeetCode Company-Wise Problem Tracker

A polished, production-ready problem tracker that looks like a premium course platform — designed to help users systematically prepare for company-specific coding interviews.

---

## Page 1: Landing / Dashboard
- **Hero section** with motivational stats: total problems available, problems solved, current streak
- **Progress overview cards** showing overall completion percentage, breakdown by difficulty (Easy/Medium/Hard)
- **Recently active companies** — quick-access cards for companies the user has started working on
- **Quick stats ring charts** — visual progress indicators per difficulty level

## Page 2: Company Explorer
- **Searchable grid of all companies** from the JSON (Adobe, Google, Amazon, etc.)
- Each company displayed as a **card** showing: company name, total problem count, user's solved count, and a progress bar
- **Filter & sort** by: number of problems, completion %, alphabetical
- Clicking a company navigates to its dedicated problem list page

## Page 3: Company Problem List
- **Company header** with name, total problems, solved/unsolved counts, difficulty breakdown bar
- **Problem table** with columns: Status (checkbox), Title (clickable link to LeetCode), Difficulty (color-coded badge), Topics (tag chips)
- **Filters**: by difficulty (Easy/Medium/Hard), by solved status, by topic
- **Search bar** to find problems within the company
- Clicking the checkbox marks a problem as solved and saves to localStorage
- **Notes button** on each problem row to open the notes modal

## Page 4: Notes / Intuition Editor (Modal or Slide-over)
- Opens when user clicks "Add Note" on any problem
- **Problem title and link** shown at top
- **Rich text area** for writing intuition/approach
- **Code editor area** (monospace, syntax-highlighted textarea) for pasting solution code
- **Save to localStorage** — notes persist per problem per company
- Ability to edit and delete notes

## Page 5: Overall Progress & Analytics
- **Global stats**: total solved across all companies, by difficulty
- **Company leaderboard**: which companies the user has made the most progress on
- **Topic heatmap**: which topics (Arrays, DP, Trees, etc.) the user has practiced the most
- **Difficulty distribution** pie/donut chart of solved problems

---

## Design & UX
- **Dark/light mode** toggle with a sleek, modern aesthetic (think NeetCode/LeetCode premium feel)
- **Color-coded difficulty badges**: Green (Easy), Orange (Medium), Red (Hard)
- **Smooth animations** and transitions between pages
- **Fully responsive** — works great on mobile and desktop
- **Sidebar navigation** for quick access between Dashboard, Companies, and Progress

## Data & Storage
- The entire JSON dataset (~2.3MB) will be embedded as a static data file in the project
- All user progress (solved status, notes, code) stored in **localStorage**
- Data structured per company per problem slug for efficient lookups
- Export/import progress feature so users don't lose data

