import os
import multiprocessing

port = os.getenv('PORT')
if port is None:
    bind = "0.0.0.0:9000"
else:
    bind = "0.0.0.0:" + str(port)
worker_class = 'gevent'
workers = 4
threads = workers * 2
max_requests = 1000
timeout = 300
