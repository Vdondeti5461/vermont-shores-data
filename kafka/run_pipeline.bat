@echo off
REM Summit2Shore Kafka Pipeline - Hourly Run
REM Scheduled via Windows Task Scheduler to run every hour
REM Ensures Podman/Kafka are running, then produces and consumes data

echo [%date% %time%] Starting S2S pipeline run... >> C:\Users\vdondeti\Desktop\kafka\pipeline.log

REM Step 1: Ensure Podman machine is running
podman machine start 2>nul

REM Step 2: Ensure Kafka containers are running
python -m podman_compose -f C:\Users\vdondeti\Desktop\kafka\compose.yml up -d 2>nul

REM Step 3: Wait for Kafka to be ready
timeout /t 10 /nobreak >nul

REM Step 4: Run producer (scan for new data)
echo [%date% %time%] Running producer... >> C:\Users\vdondeti\Desktop\kafka\pipeline.log
cd C:\Users\vdondeti\Desktop\kafka
python producer.py >> C:\Users\vdondeti\Desktop\kafka\pipeline.log 2>&1

REM Step 5: Run consumer (write to DB)
echo [%date% %time%] Running consumer... >> C:\Users\vdondeti\Desktop\kafka\pipeline.log
python consumer.py --test >> C:\Users\vdondeti\Desktop\kafka\pipeline.log 2>&1

echo [%date% %time%] Pipeline run complete. >> C:\Users\vdondeti\Desktop\kafka\pipeline.log
echo ---------------------------------------- >> C:\Users\vdondeti\Desktop\kafka\pipeline.log
