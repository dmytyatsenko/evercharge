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

def add_new_lead(contact_id, source, buildingSize=None):
	new_lead = n.newLead(contacts=[{'id': contact_id}], sources=[{'id': source}],
	 customFields={'Building Size': buildingSize})
	
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

