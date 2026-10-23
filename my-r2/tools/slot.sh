#!/usr/bin/env bash
# my-r2 · run one browser (Playwright / Chromium) job in one of two machine-wide slots, so at most two heavy browser jobs run at
# once (4 cores; the live skins render in SwiftShader). Usage: my-r2/tools/slot.sh timeout 900 node my-r2/tools/coverage.cjs C05 …
# Waits (polling every 2s) until a slot is free; hold a slot only for one job — split long batches into separate calls.
L=/home/user/JU/.build; mkdir -p "$L"
while :; do
  for i in 0 1; do
    exec {fd}>"$L/chromium.slot$i.lock"
    if flock -n "$fd"; then "$@"; rc=$?; flock -u "$fd"; exec {fd}>&-; exit $rc; fi
    exec {fd}>&-
  done
  sleep 2
done
