#!/bin/bash

set -v

gcloud compute instances create myawesomebot-instance --machine-type=g1-small --image=debian-8 --scopes userinfo-email,cloud-platform --metadata-from-file startup-script=startup-script.sh --zone us-central1-c --tags http-server