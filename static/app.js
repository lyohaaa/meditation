document.addEventListener("DOMContentLoaded", function () {
    const logButton = document.getElementById("logButton");
    const progressButton = document.getElementById("progressButton");
    const progressControls = document.getElementById("progressControls");
    const sessionListBtn = document.getElementById("sessionListBtn");
    const statsBtn = document.getElementById("statsBtn");
    const sessionListContainer = document.getElementById("sessionListContainer");
    const chartsContainer = document.getElementById("chartsContainer");
    const progressList = document.getElementById("progressList");
    const timerBlock = document.getElementById("meditationTimer");
    const timerDisplay = document.getElementById("timerDisplay");
    const moodModal = document.getElementById("moodModal");
    const submitMood = document.getElementById("submitMood");

    // Медитация
    logButton.addEventListener("click", function () {
        const userId = "671510858";
        const duration = 1;
        let secondsLeft = duration * 60;

        document.getElementById("sessionListContainer").style.display = "none";
        document.getElementById("chartsContainer").style.display = "none";

        logButton.disabled = true;
        document.body.classList.add("meditating");
        timerBlock.style.display = "block";

        const interval = setInterval(() => {
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (secondsLeft === 0) {
                clearInterval(interval);
                fetch("/add_session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ duration: duration, user_id: userId })
                })
                    .then(response => response.json())
                    .then(() => {
                        moodModal.style.display = "block";
                        timerBlock.style.display = "none";
                        document.body.classList.remove("meditating");
                        logButton.disabled = false;
                    });
            }

            secondsLeft--;
        }, 1000);
    });

    // Отправка настроения
    submitMood.addEventListener("click", function () {
        const text = document.getElementById("moodText").value.trim();
        const score = document.querySelector('input[name="moodScore"]:checked');

        if (!score) {
            alert("Пожалуйста, выберите уровень спокойствия.");
            return;
        }

        fetch("/add_mood", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mood_text: text,
                mood_score: parseInt(score.value),
                user_id: "12345"
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Ошибка при сохранении состояния.");
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                moodModal.style.display = "none";
                document.getElementById("moodText").value = "";
                document.querySelectorAll('input[name="moodScore"]').forEach(el => el.checked = false);
            })
            .catch(error => {
                alert(error.message);
            });
    });

    // Кнопка "Посмотреть прогресс"
    progressButton.addEventListener("click", function () {
        progressControls.style.display = "block";
        sessionListContainer.style.display = "none";
        chartsContainer.style.display = "none";
    });

    // Список сеансов
    sessionListBtn.addEventListener("click", function () {
        chartsContainer.style.display = "none";
        sessionListContainer.style.display = "block";

        fetch("/get_mood_entries")
            .then(response => response.json())
            .then(data => {
                progressList.innerHTML = "<h3>Список состояний после медитации:</h3>";
                if (data.length === 0) {
                    progressList.innerHTML += "<p>Нет записей.</p>";
                    return;
                }
                data.forEach(entry => {
                    const date = new Date(entry.timestamp);
                    // const text = entry.mood_text ? `<br>📝 ${entry.mood_text}` : "";
                    const scoreText = entry.score !== undefined ? `${entry.score}/5` : "—";
                    const stateText = entry.text || "не указано";
                    progressList.innerHTML += `
                        <div class="entry">
                            <span>🕒 ${date.toLocaleString()}</span><br>
                            <span>📊 Оценка: ${scoreText}</span><br>
                            <span>🎯 Состояние: ${stateText}</span>
                        </div><hr>`;
                });
            })
            .catch(error => {
                console.error("Ошибка получения списка:", error);
                progressList.innerHTML = "<p>Не удалось загрузить данные.</p>";
            });
    });

    // Статистика
    statsBtn.addEventListener("click", function () {
        sessionListContainer.style.display = "none";
        chartsContainer.style.display = "block";

        fetch("/get_mood_data")
            .then(response => response.json())
            .then(data => {
                renderLineChart(data.mood_data);
                renderBarChart(data.score_freq);
            })
            .catch(error => {
                console.error("Ошибка графика:", error);
                alert("Ошибка при получении данных для графика.");
            });
    });

    function renderLineChart(data) {
        const ctx = document.getElementById("lineChart").getContext("2d");
        if (window.lineChartInstance) window.lineChartInstance.destroy();
        window.lineChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.dates,
                datasets: [{
                    label: "Уровень спокойствия",
                    data: data.scores,
                    borderColor: "blue",
                    backgroundColor: "lightblue",
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 5 }
                }
            }
        });
    }

    function renderBarChart(data) {
        const ctx = document.getElementById("barChart").getContext("2d");
        if (window.barChartInstance) window.barChartInstance.destroy();
        window.barChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: "Частота оценок",
                    data: Object.values(data),
                    backgroundColor: "orange"
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
});
