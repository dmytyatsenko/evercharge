# -*- encoding: utf-8 -*-
import os
from six.moves.urllib.parse import urlparse
from flask import Flask, render_template, request, redirect, url_for
from flask_assets import Environment, Bundle
from nutshell import NutshellAPI

application = Flask(__name__, static_url_path='')
app = application

app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY", 'testingkey')
assets = Environment(app)
sass = Bundle('sass/all.sass', filters='sass', output='css/sass.css')
css_all = Bundle(sass, filters='cssmin', output='css/css_all.css')
assets.register('css_all', css_all)

js = Bundle('js/bootstrap-formhelpers-phone.js',
            'js/jquery.main.js',
            'js/scroll_fade.js',
            'js/transition.js',
            'js/difficulties.js',
            'js/parallax.js',
            'js/smoothscroll.js',
            'js/nutshell-adwords.js',
            filters='jsmin', output='js/gen/packed.js')
assets.register('js_all', js)


# Nutshell client configuration
NUTSHELL_USERNAME = 'jason@evercharge.net'
NUTSHELL_API_KEY = '91bd928f9b1cf611b758d15e44849227c7d46389'
nutshell_client = NutshellAPI(NUTSHELL_USERNAME, NUTSHELL_API_KEY)

NUTSHELL_SOURCES = {source['name']: source['id'] for source in nutshell_client.findSources()}

EV_OWNER_SOURCE_ID = NUTSHELL_SOURCES['Web - EV Owner']
HOA_SOURCE_ID = NUTSHELL_SOURCES['Web - HOA/PM']
GOOGLE_SOURCE = 'Google'
TWITTER_SOURCE = 'Twitter'
ONLINE_PUBLICATION_SOURCE = 'Online Publications'
HOSTNAME_TO_SOURCE = {
    'bing.com': 'Bing',
    'facebook.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'reddit.com': 'Reddit',
    'cleantechnica.com': ONLINE_PUBLICATION_SOURCE,
    'www.1776.vc': ONLINE_PUBLICATION_SOURCE
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
                if 'twitter.com' in url.hostname or 't.co' in url.hostname:
                    response.set_cookie(SOCIAL_SOURCE_COOKIE, value=TWITTER_SOURCE)
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


@app.route('/evercharge-case-study-1')
def property_case_study_one():
    return app.send_static_file('EverCharge-Property-Case-Study-1.pdf')


@app.route('/evercharge-case-study-2')
def property_case_study_two():
    return app.send_static_file('EverCharge-Property-Case-Study-2.pdf')


@app.route('/evercharge-case-study-3')
def property_case_study_three():
    return app.send_static_file('EverCharge-Property-Case-Study-3.pdf')


@app.route('/evercharge-case-study-4')
def property_case_study_four():
    return app.send_static_file('EverCharge-Property-Case-Study-4.pdf')


@app.route('/evercharge-case-study-5')
def property_case_study_five():
    return app.send_static_file('EverCharge-Property-Case-Study-5.pdf')


@app.route('/evercharge-case-study-6')
def property_case_study_six():
    return app.send_static_file('EverCharge-Property-Case-Study-6.pdf')


@app.route('/datasheet')
def data_sheet():
    return app.send_static_file('evercharge_data_sheet.pdf')


@app.route('/install')
def install_info():
    return app.send_static_file('InstallSpecsShort.pdf')


@app.route('/preferred')
def preferred_electricians():
    return app.send_static_file('preferred.pdf')


@app.route('/tesla-marketing')
def tesla_marketing_sheet():
    return app.send_static_file('EverCharge-Tesla-Marketing-Handout.pdf')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


################
# ADMIN ROUTES #
################
@app.route('/login')
def customer_login():
    return redirect('https://dashboard.evercharge.net/login')


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
    return redirect('/')


@app.route('/aboutus', methods=['POST', 'GET'])
def about_us():
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


@app.route('/tesla', methods=['POST', 'GET'])
def tesla_page():
    return render_template('tesla.html')


@app.route('/thankyou', methods=['POST', 'GET'])
def thank_you():
    if request.method == 'GET':
        return redirect('/')
    name = request.form.get('quote_name')
    if name.lower() in ('driver test', 'pm test'):
        return render_template("thank_you.html")
    phone = request.form.get('quote_phone', None)
    email = request.form.get('quote_email')
    note = request.form.get('quote_notes')
    lead_note = note if note else "No Customer Note"
    phone = phone if phone else None

    customer_type = request.form.get('customer_type')
    tag = request.form.get('adwordsField', None)
    gran = request.form.get('granularField')

    new_contact = nutshell_client.newContact(contact=dict(name=name, email=email, phone=phone))
    contact_id = new_contact['id']

    source = EV_OWNER_SOURCE_ID if customer_type == 'EV Driver' else HOA_SOURCE_ID
    external_source = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    external_source = NUTSHELL_SOURCES.get(external_source)
    if external_source is not None:
        sources = [{'id': x} for x in (source, external_source)]
    else:
        sources = [{'id': source}]

    new_lead = nutshell_client.newLead(lead=dict(contacts=[{'id': contact_id}],
                                                 sources=sources,
                                                 note=lead_note))
    new_lead_id = new_lead['id']
    if tag:
        nutshell_client.editLead(lead_id=new_lead_id, lead=dict(tags=[tag, gran]), rev="REV")

    return render_template("thank_you.html", newLeadId=new_lead_id, contactId=contact_id, note=note)


##########################
# BUILDING SIGNUP ROUTES #
##########################
@app.route('/lumina', methods=['POST', 'GET'])
def signup_lumina():
    return render_template("signup-lumina.html")


###################
# Nutshell Routes #
###################
@app.route('/nutshell/reference', methods=['POST'])
def referred_customer():
    lead_id = request.form.get('lead_id')
    if lead_id:
        reference = request.form.get('reference')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(customFields={'Additional Notes': reference}))
    return "OK"


@app.route('/nutshell/auto-dealer-contact', methods=['POST'])
def auto_dealer_contact():
    lead_id = request.form.get('lead_id')
    if lead_id:
        current_auto_dealer_contact = request.form.get('auto_dealer_contact')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(customFields={'Auto Dealer Contact': current_auto_dealer_contact}))
    return "OK"


@app.route('/nutshell/lead-notes', methods=['POST'])
def update_lead_notes():
    lead_id = request.form.get('lead_id')
    if lead_id:
        notes = request.form.get('notes')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(note=notes))
    return "OK"


@app.route('/nutshell/submit', methods=['POST', 'GET'])
def follow_up():
    return render_template('about-us.html')


@app.route('/schneider-partnership')
def schneider_partnership():
    return render_template('partnership.html')


@app.route('/properties')
def evercharge_properties():
    return render_template('properties.html')


@app.route('/w')
def device_wattson():
    return render_template('wattson.html')


if __name__ == '__main__':
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", False)
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)
