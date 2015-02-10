from flask import Flask, render_template, request, redirect
import os
import nutshell_integration as nut
from datetime import datetime
import time


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

	print  nut.search_sources('Web')


	return render_template("inner-pms.html")

@app.route('/aboutus', methods = ['POST', 'GET'])
def about_us():

	print nut.search_contacts(50169)



	return render_template("about-us.html")

@app.route('/faqs', methods = ['POST', 'GET'])
def faqs():
	return render_template("faqs.html")

@app.route('/thankyou', methods = ['POST', 'GET'])
def thank_you():

	name 		= request.form.get('quote_name')
	phone 		= request.form.get('quote_phone')
	email 		= request.form.get('quote_email')
	address1 	= request.form.get('address_1')
	address2 	= request.form.get('address_2')

	if address1:
		address = address1 + ' ' + address2
	else:
		address = None

	city 		= request.form.get('address_city')
	state 		= request.form.get('address_state')
	country 	= request.form.get('address_country')
	postal_code = request.form.get('address_postal_code')
	cust_type 	= request.form.get('customer_type')
	veh_type	= request.form.get('veh_type')
	build_size 	= request.form.get('building_size')

	print build_size
	
	source		= ''
	if cust_type == 'EV Driver':
		source 	=  29
		new_contact = nut.add_new_contact(name, email, phone,
				address, city, state, postal_code, country, veh_type)

		print new_contact

		contactId 	= new_contact['result']['id']

		newLeadId 	= nut.add_new_lead(contactId, source)['result']['id']


		return render_template("evthankyou.html", newLeadId=newLeadId, contactId=contactId)

	else:
		source =  33
		new_contact = nut.add_new_contact(name, email, phone,
			address, city, state, postal_code, country)

		contactId 	= new_contact['result']['id']
		newLeadId 	= nut.add_new_lead(contactId, source, build_size)['result']['id']

		return render_template("hoathankyou.html", newLeadId=newLeadId, contactId=contactId)

@app.route('/followup', methods = ['POST', 'GET'])
def follow_up():
	parking 		= request.form.get('parking_spot')
	tesla_contact 	= request.form.get('tesla_contact')
	new_lead_id		= request.form.get('lead_id')
	contact_id 		= request.form.get('contact_id')
	approx_bldg_size= request.form.get('number_of_spots')
	spot_type 		= request.form.get('parking_type')
	daily_commute 	= request.form.get('daily_commute')
	delivery_date 	= request.form.get('delivery_date')
	reference 		= request.form.get('reference')


	if delivery_date:
		date = time.mktime(datetime.strptime(delivery_date, "%Y-%m-%d").timetuple())
		delivery_date = str(int(date))



	new_spot 			= nut.UpdateLead(new_lead_id).parking_spot("REV_IGNORE", parking)
	new_contact 		= nut.UpdateLead(new_lead_id).tesla_contact("REV_IGNORE", tesla_contact)
	new_building_size 	= nut.UpdateLead(new_lead_id).approx_bldg_size("REV_IGNORE", approx_bldg_size)
	new_spot_type 		= nut.UpdateLead(new_lead_id).spot_type("REV_IGNORE", spot_type)
	new_commute 		= nut.UpdateLead(new_lead_id).miles("REV_IGNORE", daily_commute)
	new_delivery_date 	= nut.UpdateContact(contact_id).car_delivery_date("REV_IGNORE", delivery_date)
	new_reference		= nut.UpdateLead(new_lead_id).lead_reference("REV_IGNORE", reference)


	return render_template('about-us.html')

@app.route('/blog', methods=['GET'])
def display_blog():
	return redirect('http://blog.evercharge.net')

if __name__ == '__main__':
	PORT = int(os.environ.get("PORT",5000))
	DEBUG = "NO_DEBUG" not in os.environ

	app.run(debug=DEBUG, host="0.0.0.0", port=PORT)