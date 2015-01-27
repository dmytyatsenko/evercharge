from flask import Flask, render_template
import os


SECRET_KEY 	= os.environ.get("FLASK_SECRET_KEY")

app = Flask(__name__, static_url_path='')
app.config['SECRET_KEY'] = SECRET_KEY


@app.route('/', methods = ['POST', 'GET'])
def evercharge():
	return render_template("index.html")

@app.route('/ev-owner', methods = ['POST', 'GET'])
def ev_owner():
	return render_template("inner-owner.html")

@app.route('/hoa-pm', methods = ['POST', 'GET'])
def hoa_property_manager():
	return render_template("inner-pms.html")

@app.route('/aboutus', methods = ['POST', 'GET'])
def about_us():
	return render_template("about-us.html")

@app.route('/faqs', methods = ['POST', 'GET'])
def faqs():
	return render_template("faqs.html")


if __name__ == '__main__':
	PORT = int(os.environ.get("PORT",5000))
	DEBUG = "NO_DEBUG" not in os.environ

	app.run(debug=DEBUG, host="0.0.0.0", port=PORT)