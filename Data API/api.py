from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import pandas as pd
import time

######################################################################
###================= to run it : uvicorn api:app ==================###
######################################################################


app = FastAPI()

# Read CSV (assuming it's already in correct order)
df = pd.read_csv("C://Users//redag//OneDrive//Desktop//PFA//dataset//RealTime_IoT_PredictiveMaintenance_Dataset.csv")

@app.get("/api/stream")
def stream_data():
    def generate():
        for _, row in df.iterrows():
            # Convert row to dictionary and stream
            yield f"data: {row.to_json()}\n\n"
            time.sleep(60)
    
    return StreamingResponse(generate(), media_type="text/event-stream")