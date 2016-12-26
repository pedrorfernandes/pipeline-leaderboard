FROM postgres:9.6.1

ADD setup-remote-connections.sh /docker-entrypoint-initdb.d/setup-remote-connections.sh
RUN chmod 755 /docker-entrypoint-initdb.d/setup-remote-connections.sh