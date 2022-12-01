FROM python:3.8-bullseye

WORKDIR /opt/web
COPY . /opt/web

ENV FLASK_DEBUG=yes

RUN pip install -r requirements.txt

RUN curl -s https://api.github.com/repos/sass/dart-sass/releases/latest \
    | grep "browser_download_url.*linux-$(dpkg --print-architecture).tar.gz" \
    | cut -d : -f 2,3 \
    | tr -d '"' \
    | wget -qi - -O sass.tar.gz \
    && tar -xzf sass.tar.gz \
    && mv dart-sass/sass /usr/local/bin/sass \
    && rm sass.tar.gz \
    && rm -rf dart-sass

# support both m1 macs and intel macs
# could use buildx instead but minor overhead
# RUN cd dart-sass; ln -s x64 amd64
# RUN ln -s /opt/web/dart-sass/$(dpkg --print-architecture)/sass /usr/local/bin/sass

EXPOSE 9000

ENTRYPOINT [ "python" ]

CMD [ "application.py" ]
