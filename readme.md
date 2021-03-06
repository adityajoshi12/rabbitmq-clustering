Read the full [article here](https://adityaajoshi.medium.com/setting-up-rabbitmq-cluster-c247d61385ed)

## Setup

1. Stating rabbit-1

    ```
    docker run -d --rm --net rabbits \  
    -v ${PWD}/config/rabbit-1/:/config/ \
    -e RABBITMQ_CONFIG_FILE=/config/rabbitmq \
    -e RABBITMQ_ERLANG_COOKIE=ETOBVBEFXUPGETFECHSQ \
    --hostname rabbit-1 \
    --name rabbit-1 \
    -p 8081:15672 \
    rabbitmq:3.8-management
    ```

2. Stating rabbit-2

    ```
    docker run -d --rm --net rabbits \  
    -v ${PWD}/config/rabbit-2/:/config/ \
    -e RABBITMQ_CONFIG_FILE=/config/rabbitmq \
    -e RABBITMQ_ERLANG_COOKIE=ETOBVBEFXUPGETFECHSQ \
    --hostname rabbit-2 \
    --name rabbit-2 \
    -p 8082:15672 \
    rabbitmq:3.8-management
    ```

3. Stating rabbit-3

    ```
    docker run -d --rm --net rabbits \  
    -v ${PWD}/config/rabbit-3/:/config/ \
    -e RABBITMQ_CONFIG_FILE=/config/rabbitmq \
    -e RABBITMQ_ERLANG_COOKIE=ETOBVBEFXUPGETFECHSQ \
    --hostname rabbit-3 \
    --name rabbit-3 \
    -p 8083:15672 \
    rabbitmq:3.8-management
    ```

4. enabling federation plugin

    ```
    docker exec -it rabbit-1 rabbitmq-plugins enable rabbitmq_federation
    docker exec -it rabbit-2 rabbitmq-plugins enable rabbitmq_federation
    docker exec -it rabbit-3 rabbitmq-plugins enable rabbitmq_federation
    ```
5. Setting up Mirroring and auto syncing

    ```
    docker exec -it rabbit-1 bash
    rabbitmqctl set_policy ha-fed \
    ".\*" '{"federation-upstream-set":"all", "ha-sync-mode":"automatic", "ha-mode":"nodes", "ha-params":["rabbit@rabbit-1","rabbit@rabbit-2","rabbit@rabbit-3"]}' \
    --priority 1 \
    --apply-to queues
    ```

6. Creating Publisher Image

    ```
    docker build ./applications/publisher -t aditya/rabbitmq-publisher:v1.0.0
    ```
7. Starting Publisher
    ```
    docker run -it --rm --net rabbits -e RABBIT_HOST=rabbit-1 -e RABBIT_PORT=5672 -e RABBIT_USERNAME=guest -e RABBIT_PASSWORD=guest -p 80:80 aditya/rabbitmq-publisher:v1.0.0
    ```

8. Creating Consumer Image on new terminal
    ```
    docker build ./applications/consumer -t aditya/rabbitmq-consumer:v1.0.0
    ```
9. Starting Publisher
    ```
    docker run -it --rm --net rabbits -e RABBIT_HOST=rabbit-1 -e RABBIT_PORT=5672 -e RABBIT_USERNAME=guest -e RABBIT_PASSWORD=guest aditya/rabbitmq-consumer:v1.0.0
    ```

10. Feeding messages to the queue on new terminal
    ```
    curl -X POST localhost:80/publish/hello
    ```


Management Dashboard can be accessed from browser by these endpoint `http://localhost:8081`, `http://localhost:8082`, `http://localhost:8083`.