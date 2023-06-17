#!/bin/zsh

SECRETJSON=$( cat secret.json )
CDKOUTJSON=$( cat cdk-outputs.json )
AWSEXPORTS=$( cat src/aws-exports.js )

aws secretsmanager create-secret --name oslynstudio/secret \
--description "Third Party Secrets for Oslyn Studio" \
--secret-string "$SECRETJSON" --region us-east-1 --profile a1

aws secretsmanager create-secret --name oslynstudio/cdk \
--description "AWS Infrastructure for Oslyn Studio" \
--secret-string "$CDKOUTJSON" --region us-east-1 --profile a1

aws secretsmanager create-secret --name oslynstudio/awsexports \
--description "AWS Infrastructure for Oslyn Studio" \
--secret-string "$AWSEXPORTS" --region us-east-1 --profile a1