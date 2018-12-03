# in-deploy
Simple deployment utility.

Deploy any type of software archive via Amazon S3. Convenient if the build machine and the deployment target can communicate directly because of NAT etc.

in-deploy is an interactive utility with a number of commands.
* login
* add
* push
* pull

## AWS setup

Create an IAM user. Save the access key id and the secret access key.

Create an S3 bucket. Add the following profile:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::328748916495:user/IAM_USER_NAME"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::BUCKET_NAME",
                "arn:aws:s3:::BUCKET_NAME/*"
            ]
        }
    ]
}
```
