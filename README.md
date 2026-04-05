# MUJ AIML Exam Seating Portal

A premium, **AI & Machine Learning department-specific** exam seating portal for [Manipal University Jaipur](https://jaipur.manipal.edu).

## ✨ Features

- 🔍 **Instant seat lookup** – search by MUJ registration number
- 🗺️ **Interactive seat map** – visual room grid with your seat highlighted in orange + pulse animation
- 🌑 **Dark / Light mode** – defaults to dark, toggle in top-right corner
- 🧠 **Neural network background** – animated canvas mesh adapts to theme
- 📱 **Fully responsive** – works on mobile, tablet, and desktop
- ⚡ **Vercel-ready** – deploy in one click

## 🛠️ Tech Stack

| Layer       | Tech                        |
|-------------|----------------------------|
| Framework   | Next.js 14 (App Router)     |
| Language    | TypeScript                  |
| Styling     | Tailwind CSS v4             |
| Animations  | Framer Motion               |
| Icons       | Lucide React                |
| Theming     | next-themes                 |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📦 Adding Real Student Data

Edit `src/data/students.json` and add entries following the schema:

```json
"23FE10CAI00XXX": {
  "name": "STUDENT NAME",
  "section": "C",
  "subjectCode": "AIM3243",
  "subject": "Subject Name",
  "room": "AB3-101",
  "seatIndex": 0,
  "rows": 6,
  "cols": 5,
  "examDate": "DD-MM-YYYY",
  "examTime": "HH:MM PM – HH:MM PM"
}
```

`seatIndex` is the student's 0-based position in the column-wise PDF table.

## 🎯 Seat Coordinate Logic

MUJ PDFs list students column-by-column. The conversion:

```
col = Math.floor(index / rowsPerCol) + 1
row = (index % rowsPerCol) + 1
→ "R{row}C{col}"
```

## 🌐 Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Push to GitHub, then import in Vercel. No environment variables required.

---

Built with ❤️ for AIML students · MUJ
