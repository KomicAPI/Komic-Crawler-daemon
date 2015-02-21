# KomicAPI-crawler
KomicAPI's backend for crawler daemon and worker. Daemon manages the period to trigger worker using RabbitMQ; Workers listen request from RabbitMQ and trigger crawler-script to fetch data.
