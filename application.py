# -*- encoding: utf-8 -*-
import os
from flask import Flask, render_template, request, redirect, url_for
from flask_assets import Environment, Bundle
import geoip2.database
from itsdangerous import want_bytes, Signer, BadData
from nutshell import NutshellAPI
from six.moves.urllib.parse import urlparse
import requests


geoip2_reader = geoip2.database.Reader('GeoIP2-Country.mmdb')


class GuessCountryFromIP(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        environ['country'] = None
        try:
            ip = environ['HTTP_X_FORWARDED_FOR'].split(',')[-1].strip()
            environ['country'] = geoip2_reader.country(ip).country.iso_code
        except:
            pass
        return self.app(environ, start_response)

application = Flask(__name__, static_url_path='')
app = application
app.wsgi_app = GuessCountryFromIP(app.wsgi_app)

# Put 'country' into every template.
old_render_template = render_template
def render_template_wrapper(*args, **kwargs):
    kwargs['country'] = request.environ['country']
    return old_render_template(*args, **kwargs)
render_template = render_template_wrapper

app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY", 'testingkey')
singer = Signer(app.config['SECRET_KEY'])

assets = Environment(app)
sass = Bundle('sass/all.sass', filters='sass', output='css/sass.css')
css_all = Bundle(sass, filters='cssmin', output='css/css_all.css')
assets.register('css_all', css_all)

js = Bundle('js/bootstrap-formhelpers-phone.js',
            # 'js/jquery.main.js',
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


WEB_SIGNUP_SOURCE = NUTSHELL_SOURCES['Web Signup']
EV_OWNER_SOURCE_ID = NUTSHELL_SOURCES['Web - EV Owner']
HOA_SOURCE_ID = NUTSHELL_SOURCES['Web - HOA/PM']
LETS_CHARGE_CAMPAIGN = NUTSHELL_SOURCES['Adwords Campaign /letscharge']
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
ADWORDS_COOKIE = '_adwords_cookie'

# Google Recaptcha
app.config['RECAPTCHA_SITE_KEY'] = RECAPTCHA_SITE_KEY = '6LcZ5h8UAAAAAK1C4CuWYWvNC-Up5c2O-i1hS0mj'
app.config['RECAPTCHA_SECRET_KEY'] = RECAPTCHA_SECRET_KEY = '6LcZ5h8UAAAAABShpha6eS9KWaVuDekFAskme_6K'


@app.before_request
def redirect_www_to_non_www():
    if request.headers.get('Host', '') == 'www.evercharge.net':
        return redirect('https://evercharge.net' + request.path, code=301)


@app.after_request
def check_referrer(response):
    source_cookie = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    if source_cookie is None:
        if request.referrer:
            if not request.referrer.startswith('https://evercharge.net'):
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


@app.after_request
def check_adwords(response):
    adwords_cookie = request.cookies.get(ADWORDS_COOKIE)
    if adwords_cookie is None and request.referrer:
        if not request.referrer.startswith('https://evercharge.net'):
            url = urlparse(request.referrer)
            if 'www.googleadservices.com' in url.hostname:
                response.set_cookie(ADWORDS_COOKIE, value='1')
            else:
                response.set_cookie(ADWORDS_COOKIE, value='0')
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
    if request.environ['country'] == 'CA':
        return app.send_static_file('doc-company-overview-2017-0713-CA.pdf')
    else:
        return app.send_static_file('doc-company-overview-2017-0713-US.pdf')


@app.route('/connectortypes')
def connector_types():
    return app.send_static_file('EverCharge-Connector-Types.pdf')


@app.route('/smartpower-overview')
def smartpower_overview():
    return redirect('/smartpower')


@app.route('/200brannan-case-study')
def brannan_case_study():
    return app.send_static_file('MUD_Brannan_final.pdf')


@app.route('/corporate-campus-case-study')
def corp_campus_case_study():
    return app.send_static_file('EverCharge-Property-Case-Study-CorporateCampus.pdf')


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


@app.route('/evercharge-case-study-7')
def property_case_study_seven():
    return app.send_static_file('EverCharge-Property-Case-Study-7.pdf')


@app.route('/evercharge-case-study-8')
def property_case_study_eight():
    return app.send_static_file('EverCharge-Property-Case-Study-8.pdf')


@app.route('/evercharge-case-study-9')
def property_case_study_nine():
    return app.send_static_file('EverCharge-Property-Case-Study-9.pdf')


@app.route('/datasheet')
def data_sheet():
    return app.send_static_file('doc-evercharge-accharger-datasheet.pdf')


@app.route('/install')
def install_info():
    return app.send_static_file('InstallSpecsShort.pdf')


@app.route('/preferred')
def preferred_electricians():
    return app.send_static_file('preferred.pdf')


@app.route('/tesla-marketing')
def tesla_marketing_sheet():
    return app.send_static_file('EverCharge-Tesla-Marketing-Handout.pdf')


@app.route('/device')
def device_breakdown():
    return app.send_static_file('EverCharge-Device-Breakdown.pdf')


@app.route('/userguide')
def user_guide():
    return app.send_static_file('EverCharge-User-Guide.pdf')


@app.route('/gm-user')
def gm_user():
    return app.send_static_file('EverCharge-GM-User-Guide.pdf')

@app.route('/signupsteps')
def signupsteps():
    return app.send_static_file('EverCharge-sheet-signup-3steps.pdf')


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


@app.route('/electrician/thank-you', methods=['POST', 'GET'])
def electrician_thank_you():
    if request.method == 'GET' or not is_human():
        return redirect('/')
    name = request.form.get('quote_name')
    if name.lower() == 'electrician test':
        return render_template("thank_you.html")
    company = request.form.get('quote_company_name')
    area = request.form.get('quote_area')
    phone = request.form.get('quote_phone', None)
    email = request.form.get('quote_email')
    tag = request.form.get('adwordsField', None)
    gran = request.form.get('granularField')

    contact = dict(name=name, email=email)
    if phone:
        contact['phone'] = phone

    account = nutshell_client.newAccount(
        account=dict(name=company, address=[{'address_1': area, 'country': 'US'}]))
    new_contact = nutshell_client.newContact(contact=contact)
    contact_id = new_contact['id']

    external_source = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    external_source = NUTSHELL_SOURCES.get(external_source)
    sources = [{'id': WEB_SIGNUP_SOURCE}]
    if external_source is not None:
        sources.append({'id': external_source})
    new_lead = nutshell_client.newLead(
        lead=dict(contacts=[{'id': contact_id}],
                  primaryAccount={'id': account['id']},
                  sources=sources))
    new_lead_id = new_lead['id']
    lead_tags = []
    if tag:
        lead_tags.append(tag)
        lead_tags.append(gran)
    adwords_cookie = request.cookies.get(ADWORDS_COOKIE)
    if adwords_cookie == '1':
        lead_tags.append('Adwords')
    if lead_tags:
        nutshell_client.editLead(lead_id=new_lead_id, lead=dict(tags=lead_tags), rev="REV")
    signed_lead_id = singer.sign(str(new_lead_id))
    return render_template("thank_you.html", newLeadId=signed_lead_id, contactId=contact_id)


@app.route('/electrician')
def electrician_lead():
    return render_template("electrician.html")


@app.route('/smartpower', methods=['POST', 'GET'])
def smart_power():
    return render_template("smartpower.html")


@app.route('/faqs', methods=['POST', 'GET'])
def faqs():
    return render_template("faqs.html")


@app.route('/commercial', methods=['POST', 'GET'])
def commercial():
    return render_template("commercial.html")


@app.route('/multifamily', methods=['POST', 'GET'])
def multifamily():
    return render_template('multifamily.html')


@app.route('/hardware', methods=['POST', 'GET'])
def hardware():
    return render_template('hardware.html')


@app.route('/tech', methods=['POST', 'GET'])
def tech():
    return render_template('technology.html')


@app.route('/letscharge', methods=['POST', 'GET'])
def campaign_letscharge():
    return render_template('campaign-letscharge.html')


@app.route('/press', methods=['POST', 'GET'])
def press_page():
    return render_template('press.html')


@app.route('/properties')
def evercharge_properties():
    return render_template('properties.html')


@app.route('/signup')
@app.route('/Signup')
@app.route('/atwater')
@app.route('/akoya')
@app.route('/bristol')
@app.route('/lumina')
@app.route('/mainstreetvillage')
@app.route('/mandalayonthehudson')
@app.route('/oceanpark')
@app.route('/optima')
@app.route('/thepierce')
def evercharge_signup():
    return render_template('signup.html')


@app.route('/dell')
def dell_signup():
    return render_template('dell_signup.html')


@app.route('/tesla', methods=['POST', 'GET'])
def tesla_page():
    return render_template('tesla.html')


@app.route('/thankyou', methods=['POST', 'GET'])
def thank_you():
    return _thank_you(request.form)


@app.route('/dell-thankyou', methods=['POST', 'GET'])
def dell_thank_you():
    request_form = request.form.copy()

    first_name = request_form.pop('quote_first_name', '')
    last_name = request_form.pop('quote_last_name', '')
    request_form['quote_name'] = '{} {}'.format(first_name, last_name)

    address = request_form.pop('quote_address', '')
    city = request_form.pop('quote_city', '')
    zip = request_form.pop('quote_zip', '')
    request_form['quote_mailing_address'] = '{}\n{} {}'.format(address, city, zip)

    return _thank_you(request_form)


def _thank_you(request_form):
    if request.method == 'GET' or not is_human():
        return redirect('/')
    name = request_form.get('quote_name')
    if name.lower() in ('driver test', 'pm test'):
        return render_template("thank_you.html")
    phone = request_form.get('quote_phone', None)
    email = request_form.get('quote_email')
    lead_notes = []
    note = ''

    if request.args.get('form') == 'quote':
        note = request_form.get('quote_notes')
        lead_notes = [note if note else "No Customer Note"]
        customer_type = request_form.get('customer_type')
        source = EV_OWNER_SOURCE_ID if customer_type == 'EV Driver' else HOA_SOURCE_ID
    else:
        source = EV_OWNER_SOURCE_ID

    mailing_address = request_form.get('quote_mailing_address')
    parking_spot = request_form.get('quote_parking_space', '')
    if mailing_address:
        lead_notes.append(mailing_address)
    building_name = request_form.get('quote_building_name', '')
    if building_name:
        lead_notes.append(building_name)
    phone = phone if phone else None

    tag = request_form.get('adwordsField', None)
    gran = request_form.get('granularField')
    no_final_form = bool(request_form.get('no_final_form'))

    new_contact = nutshell_client.newContact(contact=dict(name=name, email=email, phone=phone))
    contact_id = new_contact['id']

    external_source = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    external_source = NUTSHELL_SOURCES.get(external_source)
    if external_source is not None:
        sources = [{'id': x} for x in (source, external_source)]
    elif request_form.get('lead_source') == 'campaign-letscharge':
        sources = [{'id': LETS_CHARGE_CAMPAIGN}]
    else:
        sources = [{'id': source}]

    # Parking Spot #
    lead = dict(contacts=[{'id': contact_id}],
                sources=sources,
                note=lead_notes)
    if parking_spot:
        # Lead custom field
        # List of all custom fields name can be retrieved using client
        # nutshell_client.findCustomFields()
        lead['customFields'] = {}
        lead['customFields']['Parking Spot #'] = parking_spot
    new_lead = nutshell_client.newLead(lead=lead)
    new_lead_id = new_lead['id']
    lead_tags = []
    if tag:
        lead_tags.append(tag)
        lead_tags.append(gran)
    adwords_cookie = request.cookies.get(ADWORDS_COOKIE)
    if adwords_cookie == '1':
        lead_tags.append('Adwords')
    if lead_tags:
        nutshell_client.editLead(lead_id=new_lead_id, lead=dict(tags=lead_tags), rev="REV")
    signed_lead_id = singer.sign(want_bytes(str(new_lead_id)))

    return render_template("thank_you.html",
                           newLeadId=signed_lead_id,
                           contactId=contact_id,
                           note=note,
                           phone=phone,
                           no_final_form=no_final_form)


def is_human():
    if app.config.get('DEBUG') is True:
        return True
    recaptcha_token = request.form.get('g-recaptcha-response')
    if recaptcha_token:
        data = {
            "secret": RECAPTCHA_SECRET_KEY,
            "response": recaptcha_token,
        }
        r = requests.get('https://www.google.com/recaptcha/api/siteverify', params=data)
        return r.json()['success'] if r.status_code == 200 else False
    return False


##########################
# BUILDING SIGNUP ROUTES #
##########################

@app.route('/customerguide', methods=['POST', 'GET'])
def signup_customerguide():
    return render_template("signup-customerguide.html")


@app.route('/gm-signup', methods=['POST', 'GET'])
def signup_gm():
    return render_template("signup-gm.html")


@app.route('/pilot', methods=['POST', 'GET'])
def survey_pilot():
    return redirect('https://goo.gl/forms/jScpBjvC6QNpeIfr1')

###################
# Nutshell Routes #
###################

def _get_lead_id(form_key='lead_id'):
    encrypted_lead_id = request.form.get(form_key)
    if encrypted_lead_id:
        try:
            lead_id = singer.unsign(encrypted_lead_id)
            return lead_id
        except BadData as exc:
            print('[!] Cannot verify lead {0} because {1}'.format(encrypted_lead_id, exc))


@app.route('/nutshell/reference', methods=['POST'])
def referred_customer():
    lead_id = _get_lead_id()
    if lead_id:
        reference = request.form.get('reference')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(customFields={'Additional Notes': reference}))
    return "OK"


@app.route('/nutshell/auto-dealer-contact', methods=['POST'])
def auto_dealer_contact():
    lead_id = _get_lead_id()
    if lead_id:
        current_auto_dealer_contact = request.form.get('auto_dealer_contact')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(customFields={'Auto Dealer Contact': current_auto_dealer_contact}))
    return "OK"


@app.route('/nutshell/lead-notes', methods=['POST'])
def update_lead_notes():
    lead_id = _get_lead_id()
    if lead_id:
        notes = request.form.get('notes')
        nutshell_client.editLead(leadId=lead_id,
                                 rev='REV_IGNORE',
                                 lead=dict(note=notes))
    return "OK"


@app.route('/nutshell/submit', methods=['POST', 'GET'])
def follow_up():
    return render_template('about-us.html')


@app.route('/nutshell/more-about-you', methods=['POST'])
def more_about_you():
    lead_id = _get_lead_id()
    contact_id = request.form.get('contact_id')

    contact = {
        'phone': request.form.get('phone'),
        'address': [{
            'name': request.form.get('building_name'),
            'address_1': request.form.get('address'),
            'city': request.form.get('city'),
            'state': request.form.get('state'),
            'postalCode': request.form.get('zip'),
        }],
    }

    if contact_id:
        nutshell_client.editContact(contactId=contact_id, rev='REV_IGNORE', contact=contact)

    if lead_id:
        notes = request.form.get('notes') + '\n\n' + '|'.join([':'.join((key, request.form.get(key))) for key in ('property_type', 'reference', 'unit_number')])
        nutshell_client.editLead(leadId=lead_id, rev='REV_IGNORE', lead=dict(note=notes))

        custom_fields = {}
        parking_space = request.form.get('parking_space')
        if parking_space:
            custom_fields['Parking Spot #'] = parking_space

        nutshell_client.editLead(
            leadId=lead_id,
            rev='REV_IGNORE',
            lead=dict(customFields=custom_fields))

    return "OK"


if __name__ == '__main__':
    PORT = int(os.environ.get("PORT", 9000))
    DEBUG = True  # os.environ.get("FLASK_DEBUG", False)
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)
