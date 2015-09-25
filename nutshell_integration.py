from NutshellCrumpy import Nutshell

n = Nutshell('kate@evercharge.net', '91bd928f9b1cf611b758d15e44849227c7d46389')

def search_contacts(query):
	return n.getContact(query)

def get_lead(query):
	return n.getLead(query)

def search_sources(query):
	return n.searchSources(query)

# Original Form
def add_new_contact(name, email, phone, address1, 
	city, state, zipcode, country, vehicleType=None):
	new_contact = n.newContact(name=name, email=email, phone=phone,
		address=[{'address_1': address1, 'city': city,
		'state': state, 'postalCode' : zipcode, 'country': country}],
		customFields={'Vehicle': vehicleType,})

	return new_contact

def add_new_lead(contact_id, source, note=None, buildingSize=None):
	new_lead = n.newLead(contacts=[{'id': contact_id}], sources=[{'id': source}],
	note=note, customFields={'Approximate Bldg Size': buildingSize})

	return new_lead

# Follow-up Form

class UpdateLead(object):
	"""Update lead after initial quote request"""
	def __init__(self, lead_id):
		super(UpdateLead, self).__init__()
		self.lead_id = lead_id

	def parking_spot(self, rev, parking_spot):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Parking Spot #': parking_spot})

		return edited_lead

	def tesla_contact(self, rev, tesla_contact):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Tesla Contact': tesla_contact})

		return edited_lead

	def approx_bldg_size(self, rev, approx_bldg_size):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Approximate Bldg Size': approx_bldg_size})

		return edited_lead

	def miles(self, rev, daily_commute):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Average Daily Commute': daily_commute})

		return edited_lead

	def spot_type(self, rev, spot_type):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Parking Spots Type': spot_type})

		return edited_lead

	def lead_reference(self, rev, reference):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Reference to EverCharge': reference})

		return edited_lead

	def bldg_customer_status(self, rev, cust_status):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'Building already customer?': cust_status})

		return edited_lead

	def ev_delivery_date(self, rev, delivery_date):
		edited_lead = n.editLead(self.lead_id, rev, customFields=
			{'EV Delivery Date': delivery_date})

		return edited_lead

class UpdateContact(object):
	"""Update account after initial quote request"""
	def __init__(self, contact_id):
		super(UpdateContact, self).__init__()
		self.contact_id = contact_id

	def car_delivery_date(self, rev, delivery_date):
		edited_contact = n.editContact(self.contact_id, rev, customFields=
			{'Car Delivery Date': {'timestamp' : delivery_date}})
		
		return edited_contact

	def ev_ownership_status(self, rev, ownership_status):
		edited_contact = n.editContact(self.contact_id, rev, customFields=
			{'EV Owner': ownership_status})

		return edited_contact

	def phone_number(self, rev, phone_number):
		edited_contact = n.editContact(self.contact_id, rev, phone=phone_number)
		
		return edited_contact

	def address(self, rev, address=None, city=None):
		if address:
			edited_contact = n.editContact(self.contact_id, rev, address=address)

		if city:
			edited_contact = n.editContact(self.contact_id, rev, city=city)

		return edited_contact
		















