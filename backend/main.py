# https://medium.com/@atulkumar_68871/building-a-streaming-speech-to-text-application-with-fastapi-and-amazon-transcribe-6203d857375a
import asyncio
import os
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from transcribe_client import TranscribeClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent
from fastapi.middleware.cors import CORSMiddleware
from search import semantic_search
import concurrent.futures
from concurrent.futures import _base
from starlette.websockets import WebSocketState

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "Server is running!"}


@app.websocket("/TranscribeStreaming")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logging.info("WebSocket connection accepted.")
    websocket_open = True
    stop_audio_stream = False
    audio_queue = asyncio.Queue()
    
    class MyEventHandler(TranscriptResultStreamHandler):
        def __init__(self, output_stream, websocket):
            super().__init__(output_stream)
            self.websocket = websocket
            self.final_transcript = ""

        async def handle_transcript_event(self, transcript_event: TranscriptEvent):
            # Only send if websocket is still connected.
            if self.websocket.client_state == WebSocketState.CONNECTED:
                results = transcript_event.transcript.results
                for result in results:
                    if result.is_partial:
                        continue
                    for alt in result.alternatives:
                        logging.info(f"Transcript: {alt.transcript}")
                        self.final_transcript += alt.transcript + " "
                        try:
                            if self.websocket.client_state == WebSocketState.CONNECTED:
                                await self.websocket.send_text(alt.transcript)
                        except Exception as e:
                            logging.info(f"Ignoring send error during transcript event: {e}")

        async def send_final_transcript(self):
            # Only attempt to send if connection is active.
            if self.websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await self.websocket.send_text(
                        f"Final Transcript: {self.final_transcript.strip()}"
                    )
                except Exception as e:
                    logging.info(f"Error sending final transcript: {e}")


    async def mic_stream():
        while True:
            indata = await audio_queue.get()
            if stop_audio_stream:
                break
            yield indata, None

    async def write_chunks(stream):
        try:
            async for chunk, _ in mic_stream():
                try:
                    await stream.input_stream.send_audio_event(audio_chunk=chunk)
                except (OSError, concurrent.futures._base.InvalidStateError) as e:
                    logging.error(f"Audio event error: {e}")
                    break
        except asyncio.CancelledError:
            logging.info("write_chunks task was cancelled.")
        finally:
            try:
                await stream.input_stream.end_stream()
            except (concurrent.futures._base.InvalidStateError, asyncio.CancelledError) as e:
                logging.info(f"Ignoring error ending stream: {e}")
            except Exception as e:
                logging.info(f"Error ending stream: {e}")

    handler = None

    _original_set_result = _base.Future.set_result

    def safe_set_result(self, result):
        if self.cancelled():
            return
        try:
            _original_set_result(self, result)
        except _base.InvalidStateError:
            # If the future is already in a cancelled state, ignore.
            pass

    _base.Future.set_result = safe_set_result

    # Initialize the Transcribe client
    transcribe_client = TranscribeClient()

    try:
        # Get the client (this will handle all credential resolution)
        client = transcribe_client.get_client()

        logging.info("Starting AWS Transcribe stream.")
        stream = await client.start_stream_transcription(
            language_code="en-US",
            media_sample_rate_hz=16000,
            media_encoding="pcm",
        )
        logging.info("AWS Transcribe stream started.")

        handler = MyEventHandler(stream.output_stream, websocket)
        send_task = asyncio.create_task(write_chunks(stream))
        handle_task = asyncio.create_task(handler.handle_events())

        while websocket_open:
            try:
                message = await websocket.receive()
            except Exception as e:
                logging.info(f"WebSocket receive error: {e}")
                break

            logging.info(f"Received message: {message}")

            # If we get a disconnect message, exit the loop immediately.
            if message.get("type") == "websocket.disconnect":
                logging.info("Received disconnect message, exiting loop.")
                break

            if message["type"] == "websocket.receive":
                if "bytes" in message:
                    audio_chunk = message["bytes"]
                    await audio_queue.put(audio_chunk)
                elif "text" in message:
                    text_message = message["text"]
                    logging.info(f"Received text message: {text_message}")
                    if text_message == "submit_response":
                        logging.info("Received 'submit_response' command.")
                        stop_audio_stream = True  # Signal mic_stream to stop
                        # Allow mic_stream to finish draining
                        await asyncio.sleep(0.5)
                        break

        await handler.send_final_transcript()

    except WebSocketDisconnect:
        logging.info("WebSocket disconnected")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")

    finally:
        websocket_open = False
        logging.info("WebSocket connection closed.")
        # Cancel any pending tasks if needed
        for task in [send_task, handle_task]:
            if not task.done():
                task.cancel()
        if handler:
            try:
                await handler.send_final_transcript()
            except Exception as e:
                logging.error(f"Error sending final transcript: {e}")
        # Try to close the WebSocket (ignore errors if already closed)
        try:
            await websocket.close()
        except RuntimeError as e:
            logging.info(f"WebSocket already closed: {e}")


@app.post("/textSearch")
async def text_search(request: Request):
    data = await request.json()
    question = data.get("transcript")
    answer = semantic_search(question)
    logging.info(f"Semantic search answer: {answer}")
    return {"message": answer}

