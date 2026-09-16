# KrishiAI

Working Smart India Hackathon 2026 MVP for tomato, wheat, and chilli crop health monitoring.

## Run

```bash
cp backend/.env.example backend/.env
npm install --prefix backend
npm install --prefix frontend
python3 -m venv ai-service/.venv && source ai-service/.venv/bin/activate && pip install -r ai-service/requirements.txt
# terminal 1
npm run dev --prefix backend
# terminal 2
uvicorn main:app --app-dir ai-service --reload --port 8000
# terminal 3
npm run dev --prefix frontend
```

MongoDB is used when `MONGO_URI` is reachable. Without it, the backend uses an explicit in-memory demo adapter so the complete demo flow remains runnable. Weather never fabricates values: without `WEATHER_API_KEY`, the UI says Weather unavailable.

Demo accounts are seeded automatically on startup when using the in-memory adapter:
- farmer@demo.krishiai / Demo@123
- expert@demo.krishiai / Demo@123
- officer@demo.krishiai / Demo@123

The AI service currently uses a clearly marked development adapter. It performs image quality validation and returns a deterministic demo prediction; replace `DemoModel` with a trained PyTorch/TensorFlow implementation behind the same `AIModel.predict` interface.
