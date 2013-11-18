FROM ubuntu:12.10

# Install utilities
RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install curl wget
RUN apt-get -y install build-essential

# Command line extras
RUN apt-get -y install vim nano

# Language runtimes
RUN apt-get -y install python
RUN apt-get -y install golang-go

# Install "add-apt-repository and others"
RUN apt-get install -y -q software-properties-common


# Install nodejs (for codebox and as a language runtime)
RUN wget -O - http://nodejs.org/dist/v0.8.23/node-v0.8.23-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv

# Install ruby (1.8)
RUN apt-get -y install ruby1.8

# Install php (5.4)
RUN apt-get -y install php5-cli

# Configure a local user
# Prepare user and directories
RUN adduser --shell /bin/bash --gecos 'codebox workspace user' --disabled-password --home /home/codebox codebox

# Add codebox's source code to the container
# "./buildstack.sh base" will generate a local source folder for this
# That is clean of temporary folders and node_moudles
ADD ./src /opt/codebox

# Install node modules
RUN cd /opt/codebox; npm install

# Build client
RUN cd /opt/codebox; node_modules/.bin/hr.js -d client build

# Default init command
CMD su codebox /opt/codebox/init.sh
