# Use an Alpine-based Node.js image
FROM node:18-alpine

# Install Deno
ARG DENO_VERSION=1.36.0
RUN apk add --no-cache curl unzip \
    && curl -fsSL https://github.com/denoland/deno/releases/download/v${DENO_VERSION}/deno-x86_64-unknown-linux-gnu.zip \
    --output deno.zip \
    && unzip deno.zip \
    && rm deno.zip \
    && chmod 755 deno \
    && mv deno /usr/local/bin/

# Set working directory
WORKDIR /app

# Copy your Node.js application files to the container
COPY package.json /app/

# Install Node.js dependencies
RUN yarn

# Copy your Deno application files to the container
COPY . /app/

# Expose the ports for Deno and Node.js (adjust if your applications use different ports)
ARG http_port
ENV HTTP_PORT $http_port

ARG ws_port
ENV WS_PORT $ws_port
EXPOSE $http_port $ws_port

# Set Deno environment variables
ENV DENO_DIR /deno-dir/
ENV DENO_INSTALL_ROOT /usr/local

# Add Deno to the PATH
ENV PATH /usr/local/bin:/deno-dir/bin:$PATH

CMD yarn start
