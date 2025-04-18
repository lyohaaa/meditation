from flask import Flask, render_template, request, jsonify
from backend.database import db, init_db
from backend.models import MeditationSession, MoodEntry
import backend.config as config




# Создаём Flask-приложение
app = Flask(__name__, template_folder="templates", static_folder="../static")

app.config.from_object(config.Config)

# Инициализация базы данных
init_db(app)

@app.route("/")
def index():
    """Главная страница"""
    return render_template("index.html")

@app.route("/add_session", methods=["POST"])
def add_session():
    """Обработчик запроса на добавление сеанса медитации"""
    data = request.json
    new_session = MeditationSession(duration=data["duration"], user_id=data["user_id"])
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"message": "Сеанс добавлен!"})

@app.route("/get_sessions", methods=["GET"])
def get_sessions():
    sessions = MeditationSession.query.all()
    return jsonify([
        {
            "id": s.id,
            "user_id": s.user_id,
            "duration": s.duration,
            "timestamp": s.timestamp.strftime("%d.%m.%Y %H:%M")
        }
        for s in sessions
    ])


@app.route("/add_mood", methods=["POST"])
def add_mood():
    data = request.get_json()
    mood_text = data.get("mood_text")
    mood_score = data.get("mood_score")

    if mood_text is None or mood_score is None:
        return jsonify({"error": "Недостаточно данных"}), 400

    new_mood = MoodEntry(
        mood_text=mood_text,
        mood_score=mood_score,
        session_id=None  # при необходимости можно связать с последним сеансом
    )

    db.session.add(new_mood)
    db.session.commit()
    return jsonify({"message": "Оценка состояния сохранена"}), 200


@app.route("/get_mood_data")
def get_mood_data():
    sessions = MoodEntry.query.order_by(MoodEntry.timestamp).all()
    mood_data = {
        "dates": [entry.timestamp.strftime("%Y-%m-%d") for entry in sessions],
        "scores": [entry.mood_score for entry in sessions]
    }

    score_freq = {}
    for score in range(1, 6):
        score_freq[str(score)] = sum(1 for entry in sessions if entry.mood_score == score)

    return jsonify({"mood_data": mood_data, "score_freq": score_freq})

@app.route("/get_mood_entries")
def get_mood_entries():
    entries = MoodEntry.query.order_by(MoodEntry.timestamp.desc()).all()
    result = []
    for entry in entries:
        result.append({
            "timestamp": entry.timestamp.strftime("%Y-%m-%d %H:%M"),
            "score": entry.mood_score,
            "text": entry.mood_text
        })
    return jsonify(result)



if __name__ == "__main__":
    app.run(debug=True)
