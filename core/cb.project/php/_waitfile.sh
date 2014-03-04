#!/bin/bash

filename=$1
timeout=$2

CMD="
while [ ! -f ${filename} ]
do
    echo -n .
    sleep 0.2
done
echo
"

# Return when file exists with timeout
bash -c "${CMD}" & \
sleep ${timeout};

# Try killning bash shell
kill $! &> /dev/null
RES=$?

# If killing succeeds then fail,
# succeed if killing fails (process already dead)
if [ ${RES} = 0 ]; then
    exit 1
else
    exit 0
fi
