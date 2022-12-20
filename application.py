# -*- encoding: utf-8 -*-
from datetime import datetime
import pytz
import os
import requests

import geoip2.database
from itsdangerous import want_bytes, Signer, BadData
from six.moves.urllib.parse import urlparse
from netsuitesdk import NetSuiteConnection as BaseNetSuiteConnection

from flask import Flask, render_template, request, redirect, url_for, jsonify, json
from flask_assets import Environment, Bundle

geoip2_reader = geoip2.database.Reader('GeoIP2-Country.mmdb')

DASHBOARD_URL = 'https://dashboard.evercharge.com'

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

DEFAULT_TIMEZONE = pytz.timezone('America/Los_Angeles')

def localize_timestamp(timestamp, timezone=DEFAULT_TIMEZONE):
    """
    Localizes given timestamp to the given timezone
    :param datetime timestamp:
    :param pytz.timezone timezone:
    :return: datetime Localized timestamp
    """
    if timestamp and timezone:
        if timestamp.tzinfo is None:
            timestamp = timezone.localize(timestamp)
        else:
            timestamp = timestamp.astimezone(tz=timezone)

    return timestamp

application = Flask(__name__, static_url_path='')
app = application
app.jinja_env.globals.update({
    'now': lambda: localize_timestamp(datetime.utcnow().replace(tzinfo=pytz.utc)),
})
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
sass = Bundle(
        'sass/all.sass',
        'sass/new.sass',
        filters='sass',
        output='css/sass.css')
css_all = Bundle(sass, filters='cssmin', output='css/css_all.css')
assets.register('css_all', css_all)

js = Bundle('js/bootstrap-formhelpers-phone.js',
            # 'js/jquery.main.js',
            'js/scroll_fade.js',
            'js/transition.js',
            'js/difficulties.js',
            'js/parallax.js',
            'js/smoothscroll.js',
            filters='jsmin', output='js/gen/packed.js')
assets.register('js_all', js)

GOOGLE_SOURCE = 'Google'
TWITTER_SOURCE = 'Twitter'
ONLINE_PUBLICATION_SOURCE = 'Online Publications'
HOSTNAME_TO_SOURCE = {
    'bing.com': 'Bing',
    'facebook.com': 'Facebook',
    'linkedin.com': 'LinkedIn',
    'reddit.com': 'Reddit',
    'cleantechnica.com': ONLINE_PUBLICATION_SOURCE,
}
SOCIAL_SOURCE_COOKIE = '_social_source'
ADWORDS_COOKIE = '_adwords_cookie'

# Google Recaptcha
app.config['RECAPTCHA_SITE_KEY'] = RECAPTCHA_SITE_KEY = '6Lcnk4YeAAAAAKbZ58F1hXrCpn7QXF8tmwsNX4DM'
app.config['RECAPTCHA_SECRET_KEY'] = RECAPTCHA_SECRET_KEY = '6Lcnk4YeAAAAAJvHbAttuU4SL4h87jKQF4G1X-6m'

NS_ACCOUNT = os.environ.get('NS_ACCOUNT', '')
NS_CONSUMER_KEY = os.environ.get('NS_CONSUMER_KEY', '')
NS_CONSUMER_SECRET = os.environ.get('NS_CONSUMER_SECRET', '')
NS_TOKEN_KEY = os.environ.get('NS_TOKEN_KEY', '')
NS_TOKEN_SECRET = os.environ.get('NS_TOKEN_SECRET', '')

class NetSuiteConnection(BaseNetSuiteConnection):
    LEAD_SOURCES = {
        'get_your_quote': {
            'name': '"Get Your Quote" evercharge.net',
            'internalId': '10430',
        },
        'connect_with': {
            'name': '"Connect with" evercharge.net',
            'internalId': '10431',
        },
        'electrician': {
            'name': 'evercharge.net/electrician',
            'internalId': '10432',
        },
        'new_customer': {
            'name': 'dashboard.evercharge.net/signup/new-cust',
            'internalId': '10433',
        },
        'building_contact': {
            'name': '	dashboard.evercharge.net/building',
            'internalId': '10434',
        },
    }

    @staticmethod
    def connect():
        return NetSuiteConnection(
            account=NS_ACCOUNT,
            consumer_key=NS_CONSUMER_KEY,
            consumer_secret=NS_CONSUMER_SECRET,
            token_key=NS_TOKEN_KEY,
            token_secret=NS_TOKEN_SECRET,
            caching=False,
            page_size=1000,
        )

    @staticmethod
    def new_lead(name='', phone='', email='', address=None, is_person=True, lead_source=None, stage='lead'):
        if is_person:
            company_name = '-'
            split_name = name.strip().rsplit(' ', 1)
            first_name, last_name = split_name if len(split_name) > 1 else (split_name[0], '-')
        else:
            company_name = name
            first_name = '-'
            last_name = '-'

        address_book_list = {}
        if address is not None:
            address_book_list = {
                'addressbook': [{
                    'addressbookAddress': address,
                }],
            }

        output = {
            'companyName': company_name,
            'phone': phone,
            'email': email,
            'addressbookList': address_book_list,
            'externalId': 'New Lead {}'.format(email),
            'isPerson': is_person,
            'customForm': {
                'name': 'Standard Customer Form',
                'internalId': '-2',
            },
            # 'entityStatus': {
            #     'name': 'LEAD-0 Open',
            #     'internalId': '19',
            # },
            # 'entityStatus': {
            #     'name': 'PROSPECT-3 In Discussion',
            #     'internalId': '8',
            # },
            'isInactive': False,
            'subsidiary': {
                'name': 'Evercharge, Inc.',
                'internalId': '1',
            },
            'currency': {
                'name': 'USD',
                'internalId': '1',
            },
            'shipComplete': False,
            'taxable': True,
            'giveAccess': False,
            'accessRole': {
                'name': 'Customer Center',
                'internalId': '14',
            },
            'receivablesAccount': {
                'name': 'Use System Preference',
                'internalId': '-10',
            },
            # 'stage': '_lead',
            # 'stage': '_prospect',
            'representingSubsidiary': {},
            'monthlyClosing': {},
            'leadSource': NetSuiteConnection.LEAD_SOURCES.get(lead_source, None),
        }

        if is_person:
            output.update({
                'firstName': first_name,
                'lastName': last_name,
            })

        if stage == 'lead':
            output['stage'] = '_lead'
            output['entityStatus'] = {
                'name': 'LEAD-0 Open',
                'internalId': '19',
            }
        elif stage == 'prospect':
            output['stage'] = '_prospect'
            output['entityStatus'] = {
                'name': 'PROSPECT-3 In Discussion',
                'internalId': '8',
            }
        else:
            output['stage'] = '_customer'
            output['entityStatus'] = {
                'name': 'CUSTOMER-9 Closed Won',
                'internalId': '13',
            }
        return output

    def get_lead(self, lead_id):
        output = self.customers._serialize(self.customers.get(internalId=lead_id))
        new_lead_keys = self.new_lead().keys()
        return {key: output[key] for key in new_lead_keys}

    def save_lead(self, lead):
        lead['customForm'] = {
            'name': 'Standard Customer Form',
            'internalId': '-2',
        }
        lead['representingSubsidiary'] = {}
        lead['monthlyClosing'] = {}
        netsuite_response = self.customers.post(lead)
        if netsuite_response:
            return netsuite_response.get('internalId', None)

    @staticmethod
    def append_to_comments(lead_id, more_comments):
        nc = NetSuiteConnection.connect()
        lead = nc.get_lead(lead_id)
        lead['comments'] = ' | '.join([lead.get('comments', ''), more_comments])
        nc.save_lead(lead)

@app.before_request
def redirect_www_to_non_www():
    host = request.headers.get('Host', '')
    if host == 'www.evercharge.net' or host == 'www.evercharge.com':
        return redirect('https://evercharge.com' + request.path, code=301)

@app.after_request
def check_referrer(response):
    source_cookie = request.cookies.get(SOCIAL_SOURCE_COOKIE)
    if source_cookie is None:
        if request.referrer:
            if not request.referrer.startswith('https://evercharge.com'):
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
        if not request.referrer.startswith('https://evercharge.com'):
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

@app.route('/101')
def webinar():
    return redirect("https://youtu.be/IXNT-nvTJYI")

@app.route('/careers')
def careers():
    return render_template('careers.html')

@app.route('/installspecsev001')
def install_specs_ev001():
    return app.send_static_file('InstallSpecsFullev001.pdf')

@app.route('/installspecsfull')
@app.route('/installspecsev002')
def install_specs_ev002():
    return app.send_static_file('E140-1018.pdf')

@app.route('/co')
def company_overview():
    return app.send_static_file('doc-company-overview.pdf')

@app.route('/fo')
def fleet_overview():
    return app.send_static_file('doc-fleet-overview.pdf')

@app.route('/connectortypes')
def connector_types():
    return app.send_static_file('EverCharge-Connector-Types.pdf')

@app.route('/smartpower-overview')
def smartpower_overview():
    return redirect('/smartpower')

@app.route('/soma-case-study')
def soma_case_study():
    return app.send_static_file('soma-case-study.pdf')

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

@app.route('/datasheet-ctep')
def ctep_data_sheet():
    return app.send_static_file('doc-evercharge-accharger-ctep-datasheet.pdf')

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

@app.route('/gm-user')
@app.route('/userguideev001')
def user_guide_ev001():
    return app.send_static_file('EverCharge-User-Guide.pdf')

@app.route('/userguide')
@app.route('/userguideev002')
def user_guide_ev002():
    return app.send_static_file('userguide-ev002.pdf')

@app.route('/userguideev002cardless')
def user_guide_ev002_cardless():
    return app.send_static_file('userguide-cardless-ev002.pdf')

@app.route('/signupsteps')
def signupsteps():
    return app.send_static_file('EverCharge-sheet-signup-3steps.pdf')

@app.route('/install-ev002')
def ev002_installation_manual():
    return app.send_static_file('InstallSpecsEV002.pdf')

@app.route('/install-ev002-80A')
def ev002_80A_installation_manual():
    return app.send_static_file('InstallSpecsEV002-80A.pdf')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

################
# ADMIN ROUTES #
################
@app.route('/login')
def customer_login():
    return redirect(f'{DASHBOARD_URL}/login')

##################
# WEBSITE ROUTES #
##################
@app.route('/', methods=['POST', 'GET'])
def evercharge():
    url = True
    return render_template("index.html", url=url)

@app.route('/why-evercharge', methods=['GET'])
def why_evercharge():
    return redirect('tech')

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
    company_name = request.form.get('quote_company_name')
    area = request.form.get('quote_area')
    phone = request.form.get('quote_phone', None)
    email = request.form.get('quote_email')

    # tag = request.form.get('adwordsField', None)
    # gran = request.form.get('granularField')

    return render_template("thank_you.html",
                           is_person=False,
                           lead_source='electrician',
                           name=company_name,
                           phone=phone,
                           email=email,
                           prev_notes=f'Company Address: {area} | Submitter Name: {name}',
                           company_name=company_name,
                           )

@app.route('/electrician')
def electrician_lead():
    return render_template("electrician.html")

@app.route('/smartpower', methods=['POST', 'GET'])
def smart_power():
    return render_template("smartpower.html")

@app.route('/faqs', methods=['POST', 'GET'])
def faqs():
    return render_template("faqs.html")

@app.route('/privacy', methods=['POST', 'GET'])
def privacy():
    return render_template("privacy.html")

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
    return redirect('tech')

@app.route('/press', methods=['POST', 'GET'])
def press_page():
    return render_template('press.html')

@app.route('/properties')
def evercharge_properties():
    return render_template('properties.html')

@app.route('/atwater')
@app.route('/akoya')
@app.route('/bristol')
@app.route('/lumina')
@app.route('/mainstreetvillage')
@app.route('/mandalayonthehudson')
@app.route('/oceanpark')
@app.route('/optima')
@app.route('/thepierce')
@app.route('/Signup')
@app.route('/signup')
def evercharge_signup():
    route_endpoint = request.path
    if route_endpoint in ['/Signup', '/signup']:
        route_endpoint = '/new-customer-signup'
    return redirect(f'{DASHBOARD_URL}/signup{route_endpoint}')

@app.route('/dell')
def dell_signup():
    return redirect(f'{DASHBOARD_URL}/signup/dell')

@app.route('/tesla', methods=['POST', 'GET'])
def tesla_page():
    return redirect(url_for('tech'))

@app.route('/thankyou', methods=['POST', 'GET'])
def thank_you():
    return _thank_you(request.form, lead_source='get_your_quote')

@app.route('/signup-thankyou', methods=['POST', 'GET'])
def thank_you_from_dashboard():
    return _thank_you(request.form, dashboard_redirect=True, lead_source='new_customer')

def _thank_you(request_form, dashboard_redirect=False, lead_source=None):
    note = None
    phone = None
    email = None
    is_person = None
    name = None
    if not dashboard_redirect:
        if request.method == 'GET' or not is_human():
            return redirect('/')

        name = request_form.get('quote_name', '')
        phone = request_form.get('quote_phone', None)
        email = request_form.get('quote_email', '')
        note = ''

        if request.args.get('form') == 'quote':
            note = request_form.get('quote_notes')
            customer_type = request_form.get('customer_type')
            is_person = customer_type == 'EV Driver'
        else:
            is_person = True

        phone = phone if phone else None

        # tag = request_form.get('adwordsField', None)
        # gran = request_form.get('granularField')

    return render_template(
        "thank_you.html",
        is_person=is_person,
        lead_source=lead_source,
        name=name,
        note=note,
        phone=phone,
        email=email,
        dashboard_redirect=dashboard_redirect,
        prev_notes=note,
    )

@app.route('/insert-netsuite-lead', methods=['POST', 'GET'])
def insert_netsuite_lead():
    is_person = request.form.get('is_person') in ['true', 'True', True]
    lead_source = request.form.get('lead_source')
    submitted_name = request.form.get('name')
    email = request.form.get('email')
    notes = request.form.get('notes')
    phone = request.form.get('phone', None)

    lead_notes = []
    if notes:
        lead_notes.append(notes)

    name = submitted_name

    nc = NetSuiteConnection.connect()
    new_lead = nc.new_lead(name=name, phone=phone, email=email, is_person=is_person, lead_source=lead_source)

    new_lead['comments'] = ' | '.join(lead_notes)

    new_lead_id = nc.save_lead(new_lead)
    signed_lead_id = singer.sign(want_bytes(str(new_lead_id))) if new_lead_id else None

    if signed_lead_id:
        signed_lead_id = signed_lead_id.decode('utf-8')  # decode bytes for jsonify

    return jsonify({'new_lead_id': signed_lead_id})


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
    if encrypted_lead_id and encrypted_lead_id.startswith("b'"):
        encrypted_lead_id = encrypted_lead_id[2:-1]
    if encrypted_lead_id:
        try:
            lead_id = singer.unsign(encrypted_lead_id)
            return lead_id
        except BadData as exc:
            print('[!] Cannot verify lead {0} because {1}'.format(encrypted_lead_id, exc))

@app.route('/netsuite/submit', methods=['POST', 'GET'])
def follow_up():
    return render_template('about-us.html')

@app.route('/netsuite/more-about-you', methods=['POST'])
def more_about_you():
    lead_id = _get_lead_id()

    phone = request.form.get('phone')
    building_name = request.form.get('building_name')
    address = {
        'addressee': building_name,
        'addr1': request.form.get('address'),
        'city': request.form.get('city'),
        'state': request.form.get('state'),
        'zip': request.form.get('zip'),
    }
    if lead_id:
        notes = []
        prev_notes = request.form.get('prev_notes', '')
        if prev_notes:
            notes.append(prev_notes)
        submitted_notes = request.form.get('notes')
        if submitted_notes:
            notes.append(submitted_notes)

        if building_name:
            notes.append(f'Site Name: {building_name}')

        for key in ('property_type', 'reference', 'unit_number'):
            value = request.form.get(key)
            if value:
                notes.append(f'{key}: {value}')

        parking_space = request.form.get('parking_space')
        if parking_space:
            notes.append(f'Parking Spot #: {parking_space}')

        nc = NetSuiteConnection.connect()

        lead = nc.get_lead(lead_id)

        if phone:
            lead['phone'] = phone
        lead['addressbookList'] = {
            'addressbook': [{
                'addressbookAddress': address,
            }]
        }

        lead['comments'] = ' | '.join(notes)

        nc.save_lead(lead)

    return "OK"

@app.route('/charge', methods=['GET'])
def redirect_to_dashboard_charge():
    return redirect(f'{DASHBOARD_URL}/charge')

@app.route('/charge/<connector_code>', methods=['GET'])
def redirect_to_dashboard_charge_connector(connector_code):
    return redirect(f'{DASHBOARD_URL}/charge/{connector_code}')

@app.route('/charge/<connector_code>/charging-stats', methods=['GET'])
def redirect_to_dashboard_charging_stats(connector_code):
    return redirect(f'{DASHBOARD_URL}/charge/{connector_code}/charging-stats')

if __name__ == '__main__':
    PORT = int(os.environ.get("PORT", 9000))
    DEBUG = os.environ.get("FLASK_DEBUG", False)
    app.run(debug=DEBUG, host="0.0.0.0", port=PORT)
