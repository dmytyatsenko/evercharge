from NutshellCrumpy import Nutshell

n = Nutshell('kate@evercharge.net', '91bd928f9b1cf611b758d15e44849227c7d46389')

def search_contacts(query):
	return n.searchContacts(query)


# Original Form
def add_new_contact(name, email, phone, source, address=None):
	new_contact = n.newContact(name=name, email=email, phone=phone, address=address)

	return new_contact

def add_new_lead(primary_id):
	new_lead = n.newLead(primary_id)

	return new_lead
# Follow-up Form

def update_parking_spot(lead_id, rev, parking_spot):
	edited_lead = n.editLead(lead_id, rev, customFields=
		{'Parking Spot #': parking_spot})

	return edited_lead

def update_tesla_contact(lead_id, rev, tesla_contact):
	edited_lead = n.editLead(lead_id, rev, customFields=
		{'Tesla Contact': tesla_contact})

	return edited_lead


# test_edit = n.getLead(24501)
# print test_edit

# # hoa_meeting = request.form.get('hoa_meeting')

# edited_lead = n.editLead(24501, 'REV_IGNORE', 
# 	customFields={'Parking Spot #': 255, 'Tesla Contact': "Johnny Testla"})
# print edited_lead
