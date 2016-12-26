FROM app-base

ARG server_name

#add self link
RUN echo "127.0.0.1 $server_name" | cat >> /etc/hosts

EXPOSE 6379

CMD dockerize -wait tcp://db:5432 && \
    pm2 start --no-daemon  ./src/server/process.json