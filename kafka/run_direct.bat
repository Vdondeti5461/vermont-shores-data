@echo off
REM ============================================================
REM Summit2Shore Direct Pipeline - Scheduled Run
REM ============================================================
REM No Kafka, no Podman, no containers.
REM Reads .dat files directly and inserts into MySQL.
REM
REM Task Scheduler setup:
REM   Trigger: Every 5 minutes (or "At startup" for --watch)
REM   Action:  run_direct.bat
REM   "Run whether user is logged on or not" (if admin allows)
REM ============================================================

cd /d C:\Users\vdondeti\Desktop\kafka
python pipeline_direct.py
