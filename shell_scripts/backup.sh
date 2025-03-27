#!/bin/sh

# To run before
# Don't forget to check for the correct key permissions with 'chmod 600 /config/.ssh/id_rsa' before
# And don't forget to add the id_rsa.pub key to ypur github account
# The repo origin must be cloned with 'ssh' rather than with 'https' for this to work!
git config core.sshCommand "ssh -i /config/.ssh/id_rsa -o 'StrictHostKeyChecking=no' -F /dev/null"

HA_VERSION=`cat .HA_VERSION`
COMMIT_CURRENT_DATE=$(date +'%d-%m-%Y %H:%M:%S')
COMMIT_MESSAGE="[$HA_VERSION]: $COMMIT_CURRENT_DATE"

echo "$COMMIT_MESSAGE"

git add .
git commit -m "$COMMIT_MESSAGE" --no-verify
git push
