ARG DENO_VERSION=1.36.0
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


RUN addgroup --gid 1000 deno \
  && adduser --uid 1000 --disabled-password deno --ingroup deno \
  && mkdir /deno-dir/ \
  && chown deno:deno /deno-dir/

RUN curl -fsSL https://github.com/denoland/deno/releases/download/v${DENO_VERSION}/deno-x86_64-unknown-linux-gnu.zip \
    --output deno.zip \
  && unzip deno.zip \
  && rm deno.zip \
  && chmod 755 deno

ENV DENO_DIR /deno-dir/
ENV DENO_INSTALL_ROOT /usr/local

COPY --from=bin /deno /bin/deno

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
