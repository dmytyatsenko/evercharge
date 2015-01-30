from NutshellCrumpy import Nutshell

n = Nutshell('kate@evercharge.net', '91bd928f9b1cf611b758d15e44849227c7d46389')

def search_contacts(query):
	return n.searchContacts(query)


# Original Form
def add_new_contact(name, email, phone, address1, city, state, zipcode, country):
	new_contact = n.newContact(name=name, email=email, phone=phone,
		address=[{'address_1': address1, 'city': city,
		'state': state, 'postalCode' : zipcode, 'country': country}])


	return new_contact

def add_new_lead(contact_id):
	new_lead = n.newLead(contacts=[{'id': contact_id}])

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

