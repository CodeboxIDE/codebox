FROM codebox/codebox.base:latest

# Install lua interpreter
RUN apt-get install -y luajit

# Install luvit
RUN curl -0 http://luvit.io/dist/latest/luvit-0.7.0.tar.gz curl | tar -zx && cd luvit-0.7.0 && make && make install && cd .. && rm -rf ./luvit-0.7.0

