FROM codebox/codebox.base:latest

# Install pip/virtualenv
RUN apt-get -y install python-virtualenv python-pip

# Install python dev headers
RUN apt-get -y install python-dev

# Create new virtualenv
RUN virtualenv /opt/virtualenv; chown -R codebox:codebox /opt/virtualenv

# Change path so we use the virtualenv's python interpreter
# Install IPython
RUN bash -c "su codebox bash -c 'source /opt/virtualenv/bin/activate && pip install ipython'"

