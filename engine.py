from flask import Flask, render_template
import os


SECRET_KEY 	= os.environ.get("FLASK_SECRET_KEY")

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY


@app.route('/', methods = ['POST', 'GET'])
def evercharge():
	return render_template("index.html")



if __name__ == "__main__":
    app.run(debug = True)