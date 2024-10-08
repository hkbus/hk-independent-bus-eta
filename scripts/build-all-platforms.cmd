:<<"::WINDOWS_BATCH"
:; ##### BEGIN Windows Batch Script #####
@echo off
call ./scripts/prebuild-win.cmd && tsc && vite build
:; ##### END Windows Batch Script #####
GOTO :END_OF_SCRIPT
::WINDOWS_BATCH

# ##### BEGIN Unix Shell Script #####
. ./scripts/prebuild.sh; tsc && vite build
# ##### END Unix Shell Script #####
#:END_OF_SCRIPT
