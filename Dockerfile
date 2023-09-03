# Use a base image that has both CUDA and Node
FROM tensorflow/tensorflow:latest-gpu

# Install Node.js and Yarn
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install yarn

# Create and define the node_modules layer
WORKDIR /app

# Make port 3001 available to the outside world
EXPOSE 3001
