import os
from datetime import datetime
from six.moves.urllib.parse import urlparse
from flask import Flask, render_template, request, redirect, url_for
from flask_assets import Environment, Bundle
from nutshell import NutshellAPI


NUTSHELL_USERNAME = 'jason@evercharge.net'
NUTSHELL_API_KEY = '91bd928f9b1cf611b758d15e44849227c7d46389'
nutshell_client = NutshellAPI(NUTSHELL_USERNAME, NUTSHELL_API_KEY)

NUTSHELL_SOURCES = {source['name']: source['id'] for source in nutshell_client.findSources()}

EV_OWNER_SOURCE = NUTSHELL_SOURCES['Web - EV Owner']
HOA_SOURCE = NUTSHELL_SOURCES['Web - HOA/PM']
GOOGLE_SOURCE = 'Google'
ONLINE_PUBLICATION_SOURCE = 'Online Publications'

application = Flask(__name__, static_url_path='')
app = application

app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY", 'testingkey')
assets = Environment(app)
sass = Bundle('sass/all.sass', filters='sass', output='css/sass.css')
css_all = Bundle(sass, filters='cssmin', output='css/css_all.css')
assets.register('css_all', css_all)


HOSTNAME_TO_SOURCE = {
    'bing.com': 'Bing',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'linkedin.com': 'LinkedIn',
    'reddit.com': 'Reddit',
    'cleantechnica.com': ONLINE_PUBLICATION_SOURCE,
    'www.1776.vc': ONLINE_PUBLICATION_SOURCE
}

REFERRER_SOURCES = {
    "google": 55555,
    "bing": 6666,
    "facebook": 3333,
    "twitter": 444,
    "linkedin": 2312321,
    "reddit": 5555
}

SOCIAL_SOURCE_COOKIE = '_social_source'


@app.after_request
def check_referrer(response):
    source_cookie = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    if source_cookie is None:
        if request.referrer:
            if not request.referrer.startswith('http://evercharge.net'):
                url = urlparse(request.referrer)
                if 'google.com' in url.hostname and 'plus.google.com' not in url.hostname:
                    response.set_cookie(SOCIAL_SOURCE_COOKIE, value=GOOGLE_SOURCE)
                else:
                    for source_hostname in HOSTNAME_TO_SOURCE.keys():
                        if source_hostname in url.hostname:
                            source = HOSTNAME_TO_SOURCE[source_hostname]
                            response.set_cookie(SOCIAL_SOURCE_COOKIE, value=source)
    return response


################
# STATIC FILES #
################
@app.route('/robots.txt')
def root():
    return app.send_static_file('robots.txt')


@app.route('/installspecsfull')
def install_specs():
    return app.send_static_file('InstallSpecsFull.pdf')


@app.route('/installspecsshort')
def install_specs_short():
    return app.send_static_file('InstallSpecsShort.pdf')


@app.route('/co')
def company_overview():
    return app.send_static_file('doc-company-overview.pdf')


@app.route('/smartpower-overview')
def smartpower_overview():
    return redirect('/smartpower')


@app.route('/potrero-case-study')
def potrero_case_study():
    return app.send_static_file('EverCharge-Property-Case-Study-Potrero.pdf')


@app.route('/datasheet')
def data_sheet():
    return app.send_static_file('evercharge_data_sheet.pdf')


@app.route('/install')
def install_info():
    return app.send_static_file('InstallSpecsShort.pdf')


@app.route('/preferred')
def preferred_electricians():
    return app.send_static_file('preferred.pdf')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


################
# ADMIN ROUTES #
################
@app.route('/login', methods=['GET', 'POST'])
def customer_login():
    error = None
    if request.method == 'POST':
        error = "User not recognized. If you are an existing EverCharge customer," \
                " and have not yet received your login information, EverCharge will contact you shortly."

    return render_template('login.html', error=error)


##################
# WEBSITE ROUTES #
##################
@app.route('/', methods=['POST', 'GET'])
def evercharge():
    return render_template("index.html")


@app.route('/why-evercharge', methods=['GET'])
def why_evercharge():
    return render_template('learn-more.html')


@app.route('/learnmore', methods=['GET'])
def learn_more():
    return redirect(url_for('why_evercharge'), 302)


@app.route('/ev-owner', methods=['POST', 'GET'])
def ev_owner():
    return redirect('/')


@app.route('/building-management', methods=['POST', 'GET'])
def hoa_property_manager():
    # print  nut.search_sources('Web')
    return redirect('/')


@app.route('/aboutus', methods=['POST', 'GET'])
def about_us():
    # print nut.search_contacts(50169)
    return render_template("about-us.html")


@app.route('/smartpower', methods=['POST', 'GET'])
def smart_power():
    return render_template("smartpower.html")


@app.route('/faqs', methods=['POST', 'GET'])
def faqs():
    return render_template("faqs.html")


@app.route('/press', methods=['POST', 'GET'])
def press_page():
    return render_template('press.html')


@app.route('/thankyou', methods=['POST', 'GET'])
def thank_you():
    if request.method == 'GET':
        return redirect('/')
    name = request.form.get('quote_name')
    phone = request.form.get('quote_phone', None)
    email = request.form.get('quote_email')
    note = request.form.get('quote_notes')
    note = note if note else "No Customer Note"
    phone = phone if phone else None

    customer_type = request.form.get('customer_type')
    tag = request.form.get('adwordsField', None)
    gran = request.form.get('granularField')

    new_contact = nutshell_client.newContact(contact=dict(name=name, email=email, phone=phone))
    contact_id = new_contact['id']

    source = EV_OWNER_SOURCE if customer_type == 'EV Driver' else HOA_SOURCE
    external_source = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    external_source = NUTSHELL_SOURCES.get(external_source)
    if external_source is not None:
        sources = [{'id': x} for x in (source, external_source)]
    else:
        sources = [{'id': source}]

    new_lead = nutshell_client.newLead(lead=dict(contacts=[{'id': contact_id}],
                                                 sources=sources,
                                                 note=note))
    new_lead_id = new_lead['id']
    if tag:
        nutshell_client.editLead(lead_id=new_lead_id, lead=dict(tags=[tag, gran]), rev="REV")

    return render_template("thank_you.html",
                           newLeadId=new_lead_id,
                           contactId=contact_id)


###################
# Nutshell Routes #
###################
@app.route('/nutshell/address', methods=['POST', 'GET'])
def update_address_in_nutshell():
    address = request.form.get('address')
    city = request.form.get('city')
    state = request.form.get('state')
    contact_id = request.form.get('contact_id')
    nutshell_client.editContact(contactId=contact_id, rev='REV_IGNORE', contact={"address": address, "city": city,
                                                                                 "state": state})


@app.route('/nutshell/phonenumber', methods=['POST', 'GET'])
def phone_number():
    cc_phone_number = request.form.get('phone_number')
    contact_id = request.form.get('contact_id')
    nutshell_client.editContact(contactId=contact_id, rev='REV_IGNORE', contact=dict(phone={"work": cc_phone_number}))
    return "Successfully updated Phone Number"


@app.route('/nutshell/parkingspot', methods=['POST'])
def parking_spot_type():
    current_parking_spot_type = request.form.get('parking_type')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Parking Spots Type': current_parking_spot_type}))
    return "Successfully added parking type."


@app.route('/nutshell/existingcustomer', methods=['POST', 'GET'])
def is_existing_customer():
    cust_status = request.form.get('building_customer')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Building already customer?': cust_status}))

    return "Successfully added building's customer status."


@app.route('/nutshell/parkingspotnumber', methods=['POST', 'GET'])
def parking_spot_number():
    parking_spot = request.form.get('parking_spot')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Parking Spot #': parking_spot}))
    return "Successfully added parking spot number."


# TODO: WTF? what the difference with parking_spot_number? Why it updates approx building size?
@app.route('/nutshell/numberofspots', methods=['POST'])
def approximate_number_spots():
    approx_bldg_size = request.form.get('number_of_spots')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Approximate Bldg Size': approx_bldg_size}))
    return "Successfully added number of spots."


@app.route('/nutshell/reference', methods=['POST'])
def referred_customer():
    reference = request.form.get('reference')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Additional Notes': reference}))
    return "Successfully added reference to EverCharge."


@app.route('/nutshell/auto-dealer-contact', methods=['POST'])
def auto_dealer_contact():
    current_auto_dealer_contact = request.form.get('auto_dealer_contact')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Auto Dealer Contact': current_auto_dealer_contact}))
    return "Successfully added Tesla contact."


@app.route('/nutshell/evownership', methods=['POST', 'GET'])
def ev_owner_status():
    owner_status = request.form.get('ev_status')
    # dummy date to add to Nutshell is Jan 1, 2015 -- expedites Sales process
    dummy_date = '1420099200'
    contact_id = request.form.get('contact_id')
    new_lead_id = request.form.get('lead_id')
    contact_custom_fields = {'EV Owner': owner_status}
    if owner_status == 'Already have an EV':
        contact_custom_fields['Car Delivery Date'] = {'timestamp': dummy_date}
        nutshell_client.editLead(leadId=new_lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(customFields={'EV Delivery Date': dummy_date}))
    nutshell_client.editContact(contactId=contact_id,
                                rev='REV_IGNORE',
                                contact=dict(customFields=contact_custom_fields))
    return "Successfully added EV ownership status."


@app.route('/nutshell/evdeliverydate', methods=['POST', 'GET'])
def ev_delivery_date():
    delivery_date = request.form.get('delivery_date')
    contact_id = request.form.get('contact_id')
    new_lead_id = request.form.get('lead_id')

    if delivery_date:
        delivery_date = datetime.strptime(delivery_date, "%Y-%m-%d").strftime('%s')

    nutshell_client.editContact(contactId=contact_id,
                                rev='REV_IGNORE',
                                contact=dict(customFields={'Car Delivery Date': {'timestamp': delivery_date}}))
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Car Delivery Date': {'timestamp': delivery_date}}))
    return "Successfully added delivery date."


@app.route('/nutshell/commute', methods=['POST', 'GET'])
def avg_commute():
    daily_commute = request.form.get('daily_commute')
    new_lead_id = request.form.get('lead_id')
    nutshell_client.editLead(leadId=new_lead_id,
                             rev='REV_IGNORE',
                             lead=dict(customFields={'Average Daily Commute': daily_commute}))

    return "Successfully added daily commute."


# TODO: What is this? What is purpose of this? There is reference to this in thank_you.html
@app.route('/nutshell/submit', methods=['POST', 'GET'])
def follow_up():
    new_lead_id = request.form.get('lead_id')
    contact_id = request.form.get('contact_id')

    return render_template('about-us.html')


@app.route('/blog', methods=['GET'])
def display_blog():
    return redirect('http://blog.evercharge.net')


@app.route('/schneider-partnership')
def schneider_partnership():
    return render_template('partnership.html')


@app.route('/properties')
def evercharge_properties():
    return render_template('properties.html')


@app.route('/wattson')
def device_wattson():
    return render_template('wattson.html')


################################################################################

if __name__ == '__main__':

    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", False)
    # DEBUG = "NO_DEBUG" not in os.environ
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)
