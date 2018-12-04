# in-deploy
Simple deployment utility.

Deploy any type of software archive via Amazon S3. Convenient if the build machine and the deployment target can communicate directly because of NAT etc.

in-deploy is an interactive utility with a number of commands.
* login
* add
* push
* pull

## AWS setup

### Create IAM user
Go to IAM -> Users.
Press "Add user".
Enter user name.
Enable "Programmatic access".
Press "Next" a few times and then "Create user".

### Create access key
Select the new user in the user overview and select the "Security credentials" tab.
Press "Create access key".
Click on "Show" and save the Access key ID and Secret access key in a safe place.

### Create bucket
Go to S3.
Press "Create bucket".
Enter bucket name.
Select a region. Find the corresponding region id here (e.g. eu-west-1) and write it down:
https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html
Press "Next" a few times and then "Create bucket".

### Configure bucket access
Select the bucket in the bucket overview.
Select the "Permissions" tab.
Press "Bucket policy".
Enter the policy below.
Replace IAM_USER_NAME with the username of the user create above.
Replace BUCKET_NAME with the name of the bucket.

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
