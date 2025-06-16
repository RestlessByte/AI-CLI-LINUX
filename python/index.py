from fastapi import FastAPI

app = FastAPI()

@app.get("/api/python")
def read_root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=6060)
