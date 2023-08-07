# Use a base image with Deno installed
FROM hayd/deno:latest

ARG size_of_game 

ENV SIZE_OF_GAME $size_of_game


ARG http_port
ENV HTTP_PORT $http_port

ARG ws_port
ENV WS_PORT $ws_port

# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_17.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy your Node.js application files to the container
COPY package.json /app/

# Install Node.js dependencies
RUN npm install

# Copy your Deno application files to the container
COPY . /app/

# Expose the ports for Deno and Node.js (adjust if your applications use different ports)
EXPOSE $http_port $ws_port



# Start both Deno and Node.js applications using environment variables
CMD npm start