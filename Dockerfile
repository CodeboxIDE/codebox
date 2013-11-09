FROM ubuntu:12.10

# Install utilities
RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install curl wget
RUN apt-get -y install build-essential

# Language runtimes
RUN apt-get -y install python
RUN apt-get -y install golang-go

# Install nodejs (for codebox and as a language runtime)
RUN wget -O - http://nodejs.org/dist/v0.8.23/node-v0.8.23-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv

# Command line extras
RUN apt-get -y install vim

# Install pip/virtualenv
RUN apt-get -y install python-virtualenv python-pip

# Install ruby (1.8)
RUN apt-get -y install ruby1.8

# Install php (5.4)
RUN apt-get -y install php5-cli

# Configure a local user
# Prepare user and directories
RUN adduser --shell /bin/bash --gecos 'codebox workspace user' --disabled-password --home /home/codebox codebox

# Default init command
CMD su codebox /opt/codebox/init.sh

# Needed Volumes
VOLUME ["/opt/codebox"]
