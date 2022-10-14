FROM python:3.8-bullseye

WORKDIR /opt/web
COPY . /opt/web

ENV FLASK_DEBUG=yes

RUN pip install -r requirements.txt

# support both m1 macs and intel macs
# could use buildx instead but minor overhead
RUN cd dart-sass; ln -s x64 amd64
RUN ln -s /opt/web/dart-sass/$(dpkg --print-architecture)/sass /usr/local/bin/sass

EXPOSE 9000

ENTRYPOINT [ "python" ]

CMD [ "application.py" ]
