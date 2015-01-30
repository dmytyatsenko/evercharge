from flask import Flask, render_template, request
import os
import nutshell_integration as nut


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

	cool = nut.search_contacts('API')
	print cool
	return render_template("about-us.html")

@app.route('/faqs', methods = ['POST', 'GET'])
def faqs():
	return render_template("faqs.html")

@app.route('/thankyou', methods = ['POST', 'GET'])
def thank_you():

	name 		= request.form.get('quote_name')
	phone 		= request.form.get('quote_phone')
	email 		= request.form.get('quote_email')
	address 	= request.form.get('address_1') + ' ' + request.form.get('address_2')
	city 		= request.form.get('address_city')
	state 		= request.form.get('address_state')
	country 	= request.form.get('address_country')
	postal_code = request.form.get('address_postal_code')

	# Create new contact and lead in Nutshell
	new_contact = nut.add_new_contact(name, email, phone, address, city, state, postal_code, country,)
	contact_id = new_contact['result']['id']
	nut.add_new_lead(contact_id)

	return render_template("thankyou.html")

@app.route('/followup', methods = ['POST', 'GET'])
def follow_up():
	parking 		= request.form.get('parking_spot')
	tesla_contact 	= request.form.get('tesla_contact')


	new_spot 	= nut.UpdateLead(24501).parking_spot("REV_IGNORE", parking)
	new_contact = nut.UpdateLead(24501).tesla_contact("REV_IGNORE", tesla_contact)


	print new_spot
	print new_contact

	return render_template('about-us.html')

if __name__ == '__main__':
	PORT = int(os.environ.get("PORT",5000))
	DEBUG = "NO_DEBUG" not in os.environ

	app.run(debug=DEBUG, host="0.0.0.0", port=PORT)