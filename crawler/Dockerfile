FROM app-base

CMD dockerize -wait tcp://db:5432 && \
    knex migrate:latest --env production --knexfile ./config/knexfile.js && \
    pm2 start --no-daemon  ./crawler/process.json