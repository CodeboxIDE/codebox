FROM codebox/codebox.base:latest

RUN add-apt-repository ppa:hachre/dart
RUN apt-get -y update

RUN apt-get install -y dartsdk

# Default init command
CMD su codebox /opt/codebox/init.sh
