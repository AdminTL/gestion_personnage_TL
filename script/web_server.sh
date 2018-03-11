#!/usr/bin/env bash

ACTUAL_PATH="$(dirname "$(readlink -f "$0")")"

# Launch python server on http port 8000 by default
cd ${ACTUAL_PATH}/../src/web
python3 __main__.py "$@"
