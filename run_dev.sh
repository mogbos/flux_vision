#!/usr/bin/env bash
set -euo pipefail

# Simple helper to run backend and frontend together in dev mode.
# Customize commands via BACKEND_CMD / FRONTEND_CMD env vars if needed.
# If tmux is available, this will open two panes (backend | frontend).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Default backend command: activate venv if present, then run uvicorn
BACKEND_CMD="${BACKEND_CMD:-[ -f .venv/bin/activate ] && source .venv/bin/activate; uvicorn main:app --reload --port 8000}"
FRONTEND_CMD="${FRONTEND_CMD:-npm run dev -- --host --clearScreen false}"

# Try tmux for split panes; on failure, fall back to same-shell processes.
if command -v tmux >/dev/null 2>&1 && [ -z "${NO_TMUX:-}" ]; then
  SESSION_NAME="flux_dev"
  if tmux new-session -d -s "$SESSION_NAME" -c "$ROOT_DIR/backend"; then
    tmux send-keys -t "$SESSION_NAME":0 "$BACKEND_CMD" C-m
    tmux split-window -h -t "$SESSION_NAME":0 -c "$ROOT_DIR/frontend"
    tmux send-keys -t "$SESSION_NAME":0.1 "$FRONTEND_CMD" C-m
    tmux select-pane -t "$SESSION_NAME":0.0
    tmux attach -t "$SESSION_NAME"
    exit 0
  else
    echo "tmux failed to start; falling back to single terminal. Set NO_TMUX=1 to skip tmux."
  fi
fi

cd "$ROOT_DIR"

cleanup() {
  trap - INT TERM EXIT
  kill 0
}
trap cleanup INT TERM EXIT

(cd backend && eval "$BACKEND_CMD") &
BACK_PID=$!

(cd frontend && eval "$FRONTEND_CMD") &
FRONT_PID=$!

echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"
echo "Press Ctrl+C to stop both."

wait -n
