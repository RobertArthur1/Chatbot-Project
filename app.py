from flask import Flask, jsonify, render_template, request, redirect, url_for
from chatbot import get_response

app = Flask(__name__)

@app.route("/")
def index_get():
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    # TODO: Authenticate user
    if username == "test" and password == "test":  # Placeholder for actual authentication logic
        return redirect(url_for("base"))
    else:
        # Handle invalid login
        return render_template("login.html", error="Invalid username or password")

@app.route("/base")
def base():
    return render_template("base.html")

@app.route("/predict", methods=["POST"])
def predict():
    text = request.get_json().get("message")
    # TODO: check if text is valid
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)

if __name__ == "__main__":
    app.run(debug=True)
