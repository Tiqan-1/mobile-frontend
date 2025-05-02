# Install the cli
curl -sL https://sentry.io/get-cli/ | bash

# Setup configuration values
SENTRY_AUTH_TOKEN=<click-here-for-your-token>
SENTRY_ORG=binaa
SENTRY_PROJECT=binaa
VERSION=`sentry-cli releases propose-version`

# Workflow to create releases
sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"