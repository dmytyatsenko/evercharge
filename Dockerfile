FROM python:3.10-alpine

WORKDIR /opt/web
COPY website/ /opt/web/

RUN apk add -U --no-cache curl jq tar nginx supervisor
RUN apk add -U --no-cache --virtual .build-deps build-base libffi-dev openssl-dev

COPY configs/nginx/site.conf /etc/nginx/http.d/default.conf
COPY configs/supervisord/supervisord.conf /etc/supervisord.conf
COPY configs/gunicorn /opt/web/

ENV FLASK_DEBUG=yes
RUN python -m venv venv
RUN . venv/bin/activate
RUN pip3 install -r requirements.txt
RUN pip3 install gunicorn

RUN TAGNAME=$(curl -L https://api.github.com/repos/sass/dart-sass/releases/latest | jq -r ".tag_name"); \
    curl -L https://github.com/sass/dart-sass/releases/download/${TAGNAME}/dart-sass-${TAGNAME}-linux-`uname -m | sed 's/aarch64/arm64/g'`.tar.gz \
    | tar -xvzf - -C /usr/local/bin --strip-components=1

RUN apk del .build-deps
RUN chmod 777 -R /opt/web/static/.webassets-cache
RUN chmod 777 /opt/web
RUN mkdir -p /var/lib/nginx || exit 0 # ignore error if dir exists
RUN chmod 777 /var/lib/nginx

EXPOSE 80

CMD [ "/usr/bin/supervisord" ]
