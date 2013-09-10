FROM ubuntu:12.10

# Install utilities
run apt-get -y install git
run apt-get -y install curl wget
run apt-get -y install build-essential

# Language runtimes
run apt-get -y install python
run apt-get -y install golang-go

# Install nodejs (for codebox and as a language runtime)
run wget -O - http://nodejs.org/dist/v0.8.23/node-v0.8.23-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv

# Command line extras
run apt-get -y install vim
