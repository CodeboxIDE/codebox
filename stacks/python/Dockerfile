FROM codebox.base:latest

# Install pip/virtualenv
RUN apt-get -y install python-virtualenv python-pip

# Create new virtualenv
RUN virtualenv /opt/virtualenv; chown -R codebox:codebox /opt/virtualenv

# Change path so we use the virtualenv's python interpreter
# Install IPython
RUN PATH=/opt/virtualenv/bin:$PATH pip install ipython
