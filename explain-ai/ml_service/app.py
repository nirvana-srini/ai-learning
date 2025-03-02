from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import threading

app = Flask(__name__)
CORS(app)

# Initialize the model in a separate thread to avoid blocking the server startup
model = None
def init_model():
    global model
    print("Loading model... This might take a few minutes.")
    model = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    print("Model loaded successfully!")

# Start model initialization in background
init_thread = threading.Thread(target=init_model)
init_thread.start()

@app.route("/ml/explain", methods=["POST"])
def explain():
    if model is None:
        return jsonify({
            "error": "Model is still loading. Please try again in a moment.",
            "status": "loading"
        }), 503
    
    try:
        data = request.json
        selected_text = data.get('selectedText', '')
        topic = data.get('topic', '')
        pre = data.get('pre', '')
        post = data.get('post', '')
        
        prompt = f"""
        Explain this text in simple terms:
        {selected_text}
        
        Context:
        Topic: {topic}
        Text before: {pre}
        Text after: {post}
        
        Please provide a clear and concise explanation.
        """
        
        response = model(prompt, 
                       max_length=200, 
                       num_return_sequences=1,
                       temperature=0.7)
        
        explanation = response[0]['generated_text']
        # Clean up the explanation by removing the prompt
        explanation = explanation.replace(prompt, '').strip()
        
        return jsonify({
            "explanation": explanation,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route("/ml/status", methods=["GET"])
def status():
    return jsonify({
        "status": "ready" if model else "loading",
        "message": "Model is ready" if model else "Model is still loading"
    })

@app.route('/chat', methods=['POST'])
def chat():
    if model is None:
        return jsonify({
            "error": "Model is still loading. Please try again in a moment.",
            "status": "loading"
        }), 503

    try:
        data = request.json
        message = data.get('message', '')
        app.logger.info(f'Received message: {message}')

        prompt = f"""
        Respond to this message:
        {message}

        Please provide a clear and concise response.
        """

        response = model(prompt, 
                       max_length=200, 
                       num_return_sequences=1,
                       temperature=0.7)

        chat_response = response[0]['generated_text']
        # Clean up the response by removing the prompt
        chat_response = chat_response.replace(prompt, '').strip()
        app.logger.info(f'Generated response: {chat_response}')

        return jsonify({
            "response": chat_response,
            "status": "success"
        })
    except Exception as e:
        app.logger.error(f'Error processing chat request: {str(e)}', exc_info=True)
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
