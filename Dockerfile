FROM python:3.8-bullseye

WORKDIR /opt/web
COPY . /opt/web

ENV FLASK_DEBUG=yes

RUN pip install -r requirements.txt

# RUN pip install sass
RUN
RUN ln -s /opt/web/dart-sass/sass /usr/local/bin/sass

ENTRYPOINT [ "python" ]

CMD [ "application.py" ]
