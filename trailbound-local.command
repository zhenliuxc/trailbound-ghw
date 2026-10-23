#!/bin/zsh
# Local-only helper. All project paths are relative to this checkout.
set -eu
project_dir="${0:A:h}"
cd "$project_dir"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  print -u2 'Node.js 18+ and npm are required. Load your nvm environment first.'
  exit 1
fi

action="${1:-dev}"
if (( $# )); then shift; fi
case "$action" in
  install)
    exec npm ci --cache "$project_dir/.local/npm-cache" --no-audit --no-fund
    ;;
  build)
    exec npm run build
    ;;
  watch)
    exec node "$project_dir/scripts/watch-local.mjs"
    ;;
  serve)
    exec python3 -u -m http.server "${PORT:-8000}" --bind 127.0.0.1 --directory dist
    ;;
  dev)
    if [[ ! -d node_modules/typescript || ! -d node_modules/esbuild ]]; then
      print -u2 "Install locked dependencies first: $0 install"
      exit 1
    fi
    # Reuse this project’s running local server.
    server_pid_file="$project_dir/.local/server-${PORT:-8000}.pid"
    if [[ -f "$server_pid_file" ]]; then
      server_pid="$(<"$server_pid_file")"
      if [[ "$server_pid" == <-> ]] && kill -0 "$server_pid" 2>/dev/null; then
        listener_pid="$(lsof -nP -iTCP:${PORT:-8000} -sTCP:LISTEN -t 2>/dev/null | sort -u || true)"
        server_cwd="$(lsof -a -p "$server_pid" -d cwd -Fn 2>/dev/null || true)"
        if [[ "$listener_pid" == "$server_pid" && "$server_cwd" == *$'\n'"n$project_dir" ]]; then
          print 'Local server is already running at http://127.0.0.1:'"${PORT:-8000}"'/'
          print 'Starting the source watcher. Ctrl-C stops this watcher; the existing server stays running.'
          exec node "$project_dir/scripts/watch-local.mjs"
        fi
      fi
    fi
    print 'Trailbound local development: http://127.0.0.1:'"${PORT:-8000}"'/'
    print 'src/ changes rebuild automatically. Refresh the browser to apply changes.'
    print 'Ctrl-C stops this development session.'
    node "$project_dir/scripts/watch-local.mjs" &
    builder_pid=$!
    trap 'kill "$builder_pid" 2>/dev/null || true' EXIT
    trap 'exit 130' INT
    trap 'exit 143' TERM
    python3 -u -m http.server "${PORT:-8000}" --bind 127.0.0.1 --directory dist
    ;;
  *)
    print -u2 "Usage: $0 [dev|install|build|watch|serve]"
    exit 2
    ;;
esac
