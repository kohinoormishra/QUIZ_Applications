<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kohinoor Mishra Quiz App</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #fffaf0, #f0ffff);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .correct { background-color: #22c55e !important; color: white !important; }
    .incorrect { background-color: #ef4444 !important; color: white !important; }
    button:hover:not(:disabled) { background-color: #fde68a; }
    #quiz-container {
      background: linear-gradient(to bottom, #ffffff 60%, #e6fffa 100%);
    }
    .leaderboard {
      margin-top: 1rem;
    }
    #timer {
      font-size: 1rem;
      font-weight: bold;
      color: #dc2626;
      margin-top: 1rem;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-2xl p-6 rounded-2xl shadow-2xl" id="quiz-container">
    <h1 class="text-4xl font-bold text-center text-indigo-800 mb-4">Kohinoor Mishra Quiz App</h1>
    <select id="categoryFilter" class="mb-4 p-2 border rounded w-full text-indigo-700">
      <option value="all">All Categories</option>
      <option value="tech">Technology</option>
      <option value="science">Science</option>
      <option value="world">World Facts</option>
    </select>
    <h2 class="text-2xl font-bold mb-4 text-indigo-700" id="question">Loading...</h2>
    <div id="answers" class="space-y-3"></div>
    <div class="flex justify-between mt-6">
      <button id="prev" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50" disabled>Previous</button>
      <button id="next" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">Next</button>
      <button id="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg hidden">Submit</button>
    </div>
    <div class="mt-4 text-sm text-gray-700 font-medium" id="progress">Question 1 of N</div>
    <div id="timer">Timer: <span id="time">15</span> seconds</div>
    <div class="mt-4 hidden" id="result"></div>
    <div id="leaderboard" class="leaderboard hidden text-indigo-800"></div>
  </div>

  <script>
    let allQuizData = [
      { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "None of these"], answer: "Hyper Text Markup Language", category: "tech" },
      { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars", category: "science" },
      { question: "Which language runs in a web browser?", options: ["Java", "C", "Python", "JavaScript"], answer: "JavaScript", category: "tech" },
      { question: "Who is known as the father of computers?", options: ["Charles Babbage", "Alan Turing", "Tim Berners-Lee", "Steve Jobs"], answer: "Charles Babbage", category: "tech" },
      { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], answer: "Canberra", category: "world" },
      { question: "Which gas is most abundant in the Earth’s atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Nitrogen", category: "science" },
      { question: "What is blockchain primarily used for?", options: ["Gaming", "Cryptocurrency transactions", "Video editing", "Social networking"], answer: "Cryptocurrency transactions", category: "tech" },
      { question: "Which tech company created the Android OS?", options: ["Apple", "Microsoft", "Google", "Samsung"], answer: "Google", category: "tech" }
    ];

    let quizData = [...allQuizData].sort(() => 0.5 - Math.random()).slice(0, 8);
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswers = [];
    let timer;
    let timeLeft = 15;

    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");
    const submitBtn = document.getElementById("submit");
    const progressEl = document.getElementById("progress");
    const leaderboardEl = document.getElementById("leaderboard");
    const categoryFilter = document.getElementById("categoryFilter");
    const timeEl = document.getElementById("time");
    const quizContainer = document.getElementById("quiz-container");

    categoryFilter.addEventListener("change", () => {
      const value = categoryFilter.value;
      const filtered = value === "all" ? [...allQuizData] : allQuizData.filter(q => q.category === value);
      quizData = filtered.sort(() => 0.5 - Math.random()).slice(0, 8);
      currentQuestionIndex = 0;
      score = 0;
      selectedAnswers = [];
      loadQuestion();
    });

    function startTimer() {
      clearInterval(timer);
      timeLeft = 15;
      timeEl.textContent = timeLeft;
      timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft === 0) {
          clearInterval(timer);
          nextBtn.disabled = false;
          revealAnswer();
        }
      }, 1000);
    }

    function revealAnswer() {
      const correctAnswer = quizData[currentQuestionIndex].answer;
      const buttons = answersEl.querySelectorAll("button");
      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) btn.classList.add("correct");
      });
    }

    function loadQuestion() {
      const current = quizData[currentQuestionIndex];
      questionEl.textContent = current.question;
      answersEl.innerHTML = "";

      current.options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "w-full border-2 border-indigo-200 px-4 py-2 rounded-xl text-left text-indigo-800 bg-white hover:shadow-md transition duration-200 font-medium";
        btn.textContent = option;
        btn.onclick = () => selectAnswer(btn, option);
        answersEl.appendChild(btn);
      });

      progressEl.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
      prevBtn.disabled = currentQuestionIndex === 0;
      nextBtn.classList.remove("hidden");
      submitBtn.classList.add("hidden");

      if (selectedAnswers[currentQuestionIndex]) {
        revealAnswer();
        const selected = selectedAnswers[currentQuestionIndex];
        Array.from(answersEl.children).forEach(btn => {
          if (btn.textContent === selected && selected !== quizData[currentQuestionIndex].answer) btn.classList.add("incorrect");
        });
        nextBtn.disabled = false;
      } else {
        nextBtn.disabled = true;
      }

      if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");
      }
      startTimer();
    }

    function selectAnswer(button, selected) {
      clearInterval(timer);
      const correctAnswer = quizData[currentQuestionIndex].answer;
      const buttons = answersEl.querySelectorAll("button");

      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) btn.classList.add("correct");
        if (btn.textContent === selected && selected !== correctAnswer) btn.classList.add("incorrect");
      });

      selectedAnswers[currentQuestionIndex] = selected;
      if (selected === correctAnswer) score++;
      nextBtn.disabled = false;
    }

    nextBtn.onclick = () => {
      if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
      }
    };

    prevBtn.onclick = () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
      }
    };

    submitBtn.onclick = () => {
      clearInterval(timer);
      const percentage = Math.round((score / quizData.length) * 100);
      const message = percentage >= 75 ? "🎉 Excellent! You're a quiz master!" : "👍 Keep learning and try again!";

      const leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard") || "[]");
      const newEntry = { score, percentage, date: new Date().toLocaleString() };
      leaderboard.push(newEntry);
      localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard));

      quizContainer.innerHTML = `
        <h2 class="text-3xl font-extrabold text-green-700 text-center">Quiz Submitted!</h2>
        <p class="mt-4 text-xl text-center text-gray-800">You scored <span class="font-bold">${score}/${quizData.length}</span> (${percentage}%)</p>
        <p class="mt-2 text-center text-lg">${message}</p>
        <h3 class="text-2xl text-indigo-700 mt-6 text-center">🏆 Leaderboard</h3>
        <ul class="mt-2 space-y-1 text-center">${leaderboard.slice(-5).reverse().map(entry => `<li>${entry.score}/${quizData.length} - ${entry.percentage}% <span class="text-sm text-gray-500">(${entry.date})</span></li>`).join('')}</ul>
        <div class="mt-6 text-center">
          <button onclick="location.reload()" class="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Retry Quiz</button>
        </div>
      `;
    };

    loadQuestion();
  </script>
</body>
</html>
