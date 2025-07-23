<h1 align="center"> React app - Who Wants to Be a Millionaire? </h1>
<p align="center"><img src="dev/main-img.png"/></p>

---

<h3>Requirements & How to run:</h3>
<a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">Node.js</a>
<p>Navigate to project folder on command line and run: (npm install)</p>
<p>After npm has installed packages you can launch the app with run.bat if you have chrome, otherwise navigate to the project folder and run: (npm run dev) and open http://localhost:5173/ on your preferred browser.</p>

<h4>Updating</h4>

<p>Download <a href="https://git-scm.com/downloads">git</a> and run update.bat</p>

<p>OR</p>

<p><a href="https://codeload.github.com/nesterinen/WWTBAM/zip/refs/heads/main"> Download(.zip) </a> then extract and run the command (npm install) at project location again</p>

---

<h3>Questions & Answers:</h3>
<p>.json files are located at /src/questions/..</p>
<p>Example structure</p>

````
{
  "description": "Example questions",
  "questions": [
    {
    "question": "What is the sum of 1 + 1?",
    "answer": "2",
    "A": "1",
    "B": "2",
    "C": "3",
    "D": "4"
    },
    {
    "question": "How many days does january have?",
    "answer": "31",
    "A": "30",
    "B": "29",
    "C": "31",
    "D": "28"
    }
  ]
}
````

<p>This example contains only 2 questions, the minimum is 15+1 where 15 is for the game stage and 1 is for a lifeline(Reroll).</p>
<p>Description is displayed above the play button in the menu and in the dropdown menu in settings. Description also affects highscore filtering.</p>
<p>Adding new Q&A files does not automatically add them to the game, you have to edit App.tsx and add: (import filename from './questions/filename.json') and then edit: (const quizArray = [..., filename])</p>

---

<h3>Highscores:</h3>
<p>Highscores are saved locally on the browser localStorage, if cookies are cleared then highscores will also be cleared</p>
<p>Highscores can also be cleared manually this requires a password which by default is "root", this password can also be changed by editing /src/config/admin.json</p>

---

<h3>Som random veri veri professionaal diagram:</h3>
<p align="center"><img src="dev/very-professional-diagram.png"/></p>