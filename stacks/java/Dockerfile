FROM codebox/codebox.base:latest

# OpenJDK and JRE runtime
RUN apt-get install -y openjdk-7-jre-headless

# Fake a fuse install
RUN apt-get install -y --no-install-recommends libfuse2; \
cd /tmp ; apt-get download fuse; \
cd /tmp ; dpkg-deb -x fuse_* .; \
cd /tmp ; dpkg-deb -e fuse_*; \
cd /tmp ; rm fuse_*.deb; \
cd /tmp ; echo -en '#!/bin/bash\nexit 0\n' > DEBIAN/postinst; \
cd /tmp ; dpkg-deb -b . /fuse.deb; \
cd /tmp ; dpkg -i /fuse.deb;

# Install JDK
RUN apt-get install -y --no-install-recommends openjdk-7-jdk

# Install Maven
RUN apt-get install -y maven


