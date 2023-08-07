
# Use an Alpine-based Node.js image
FROM node:18-alpine

ARG size_of_game 

ENV SIZE_OF_GAME $size_of_game


ARG http_port
ENV HTTP_PORT $http_port

ARG ws_port
ENV WS_PORT $ws_port


# Set working directory
WORKDIR /app

# Install Deno
RUN apk add --no-cache curl && \
    curl -fsSL https://deno.land/x/install/install.sh | sh

# Add Deno to the PATH
ENV DENO_INSTALL="/root/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Copy your Node.js application files to the container
COPY package.json /app/

# Install Node.js dependencies
RUN yarn

# Copy your Deno application files to the container
COPY . /app/

# Expose the ports for Deno and Node.js (adjust if your applications use different ports)
EXPOSE $http_port $ws_port

# Start both Deno and Node.js applications using environment variables
CMD yarn start
