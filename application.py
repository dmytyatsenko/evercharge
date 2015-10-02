from flask import Flask, render_template, request, redirect
import os
import nutshell_integration as nut
from datetime import datetime
import time


SECRET_KEY 	= os.environ.get("FLASK_SECRET_KEY")

application = Flask(__name__, static_url_path='')
app = application

if SECRET_KEY:
	app.config['SECRET_KEY'] = SECRET_KEY
else:
	app.config['SECRET_KEY'] = 'testingkey'


##################
## STATIC FILES ##
##################

@app.route('/robots.txt', methods=['GET'])
def root():
	return app.send_static_file('robots.txt')

@app.route('/installspecsfull', methods=['GET'])
def install_specs():
	return app.send_static_file('InstallSpecsFull.pdf')

@app.route('/installspecsshort', methods=['GET'])
def install_specs_short():
	return app.send_static_file('InstallSpecsShort.pdf')

@app.route('/companyoverview', methods = ['GET'])
def company_overview():
	return app.send_static_file('EverChargeOverview.pdf')

@app.route('/potrero-case-study', methods = ['GET'])
def potrero_case_study():
	return app.send_static_file('SF_Case_Study.pdf')

@app.route('/datasheet', methods = ['GET'])
def data_sheet():
	return app.send_static_file('evercharge_data_sheet.pdf')

@app.route('/install', methods = ['GET'])
def install_info():
	return app.send_static_file('InstallSpecsShort.pdf')

@app.route('/preferred', methods = ['GET'])
def preferred_electricians():
	return app.send_static_file('preferred.pdf')

##################
## ADMIN ROUTES ##
##################

@app.route('/login', methods = ['GET', 'POST'])
def customer_login():
	error = None
	if request.method == 'POST':
		error = "User not recognized. If you are an existing EverCharge customer, and have not yet received your login information, EverCharge will contact you shortly."

	return render_template('login.html',
							error=error)

####################
## WEBSITE ROUTES ##
####################

@app.route('/', methods = ['POST', 'GET'])
def evercharge():
	return render_template("index.html")

@app.route('/learnmore', methods= ['GET'])
def learn_more():
	return render_template('learn-more.html')

@app.route('/ev-owner', methods = ['POST', 'GET'])
def ev_owner():
	return redirect('/')

@app.route('/building-management', methods = ['POST', 'GET'])
def hoa_property_manager():
	# print  nut.search_sources('Web')
	return redirect('/')

@app.route('/aboutus', methods = ['POST', 'GET'])
def about_us():
	# print nut.search_contacts(50169)
	return render_template("about-us.html")

@app.route('/smartpower', methods = ['POST', 'GET'])
def smart_power():
	return render_template("smart-power.html")

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
	note		= request.form.get('quote_notes')

	if note == '':
		note = "No Customer Note"

	if phone == '':
		phone = None

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
	if name == None:
		return redirect('/')

	else:

		if cust_type == 'EV Driver':
			source 	=  29
			new_contact = nut.add_new_contact(name, email, phone,
					address, city, state, postal_code, country, veh_type)

			print new_contact
			print 'HELLO'

			contactId 	= new_contact['result']['id']
			newLead 	= nut.add_new_lead(contactId, source, note)
			newLeadId 	= newLead['result']['id']
			return render_template("evthankyou.html",
									newLeadId=newLeadId,
									contactId=contactId)

		else:
			source =  33
			new_contact = nut.add_new_contact(name, email, phone,
				address, city, state, postal_code, country)

			contactId 	= new_contact['result']['id']
			newLeadId 	= nut.add_new_lead(contactId, source, note, build_size)['result']['id']

			return render_template("hoathankyou.html",
									newLeadId=newLeadId,
									contactId=contactId)


@app.route('/testthankyou', methods=['POST', 'GET'])
def test_thanks():
	"""Route to test follow-up form template updates and scheduling

	implementation without creating new Nutshell leads"""


	return render_template('test_thankyou.html',
							newLeadId='newLeadId',
							contactId='contactId')


@app.route('/nutshell/address', methods = ['POST', 'GET'])
def update_address_in_nutshell():
	address = request.form.get('address')
	city = request.form.get('city')
	state = request.form.get('state')
	contact_id = request.form.get('contact_id')
	nut.UpdateContact(contact_id).address('REV_IGNORE', address, city, state)

@app.route('/press', methods = ['POST', 'GET'])
def press_page():

	return render_template('press.html')


@app.route('/nutshell/phonenumber', methods = ['POST', 'GET'])
def phone_number():
	phone_number = request.form.get('phone_number')
	new_contact_id = request.form.get('contact_id')

	nut.UpdateContact(new_contact_id).phone_number('REV_IGNORE', phone_number)

	return "Successfully updated Phone Number"

@app.route('/nutshell/parkingspot', methods = ['POST', 'GET'])
def parking_spot():
	spot_type 		= request.form.get('parking_type')
	new_lead_id		= request.form.get('lead_id')
	
	nut.UpdateLead(new_lead_id).spot_type("REV_IGNORE", spot_type)

	return "Successfully added parking type."

@app.route('/nutshell/existingcustomer', methods=['POST', 'GET'])
def is_existing_customer():
	cust_status = request.form.get('building_customer')
	new_lead_id	= request.form.get('lead_id')

	nut.UpdateLead(new_lead_id).bldg_customer_status("REV_IGNORE", cust_status)

	return "Successfully added building's customer status."

@app.route('/nutshell/parkingspotnumber', methods = ['POST', 'GET'])
def parking_spot_number():
	parking 	= request.form.get('parking_spot')
	new_lead_id	= request.form.get('lead_id')
	
	nut.UpdateLead(new_lead_id).parking_spot("REV_IGNORE", parking)

	return "Successfully added parking spot number."

@app.route('/nutshell/numberofspots', methods = ['POST', 'GET'])
def approximate_number_spots():
	approx_bldg_size	= request.form.get('number_of_spots')
	new_lead_id			= request.form.get('lead_id')

	nut.UpdateLead(new_lead_id).approx_bldg_size("REV_IGNORE", approx_bldg_size)

	return "Successfully added number of spots."

@app.route('/nutshell/reference', methods = ['POST', 'GET'])
def referred_customer():
	reference 		= request.form.get('reference')
	new_lead_id		= request.form.get('lead_id')

	nut.UpdateLead(new_lead_id).lead_reference("REV_IGNORE", reference)

	return "Successfully added reference to EverCharge."

@app.route('/nutshell/teslacontact', methods = ['POST', 'GET'])
def tesla_contact():
	tesla_contact 	= request.form.get('tesla_contact')
	new_lead_id		= request.form.get('lead_id')

	nut.UpdateLead(new_lead_id).tesla_contact("REV_IGNORE", tesla_contact)

	return "Successfully added Tesla contact."

@app.route('/nutshell/evownership', methods = ['POST', 'GET'])
def ev_owner_status():
	owner_status 	= request.form.get('ev_status')
	
	dummy_date		= '1420099200'
	#dummy date to add to Nutshell is Jan 1, 2015 -- expedites Sales process
	contact_id 		= request.form.get('contact_id')
	new_lead_id		= request.form.get('lead_id')

	nut.UpdateContact(contact_id).ev_ownership_status("REV_IGNORE", owner_status)
	
	if owner_status == 'Already have an EV':
		nut.UpdateContact(contact_id).car_delivery_date("REV_IGNORE", dummy_date)
		nut.UpdateLead(new_lead_id).ev_delivery_date("REV_IGNORE", dummy_date)

	return "Successfully added EV ownership status."


@app.route('/nutshell/evdeliverydate', methods=['POST', 'GET'])
def ev_delivery_date():
	delivery_date 	= request.form.get('delivery_date')
	contact_id 		= request.form.get('contact_id')
	new_lead_id		= request.form.get('lead_id')

	if delivery_date:
		date = time.mktime(datetime.strptime(delivery_date, "%Y-%m-%d").timetuple())
		delivery_date = str(int(date))

	nut.UpdateContact(contact_id).car_delivery_date("REV_IGNORE", delivery_date)
	nut.UpdateLead(new_lead_id).ev_delivery_date("REV_IGNORE", delivery_date)

	return "Successfully added delivery date."

@app.route('/nutshell/commute', methods = ['POST', 'GET'])
def avg_commute():
	daily_commute 	= request.form.get('daily_commute')
	new_lead_id		= request.form.get('lead_id')

	nut.UpdateLead(new_lead_id).miles("REV_IGNORE", daily_commute)

	return "Succesfully added daily commute."

@app.route('/nutshell/submit', methods = ['POST', 'GET'])
def follow_up():
	new_lead_id		= request.form.get('lead_id')
	contact_id 		= request.form.get('contact_id')
	print new_lead_id
	print contact_id

	return render_template('about-us.html')

@app.route('/blog', methods=['GET'])
def display_blog():
	return redirect('http://blog.evercharge.net')

@app.route('/memberkeyterms', methods=['GET'])
def display_key_terms():
	return render_template('keyterms.html')


################################################################################

if __name__ == '__main__':
	PORT = int(os.environ.get("PORT",5000))
	DEBUG = "NO_DEBUG" not in os.environ

	app.run(debug=DEBUG, host="0.0.0.0", port=PORT)