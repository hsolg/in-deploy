# in-deploy
Simple deployment utility.

Deploy any type of software archive via Amazon S3. Convenient if the build machine and the deployment target cannot communicate directly because of NAT etc.

in-deploy is an interactive utility with a number of commands.
* login
* add
* push
* pull

## AWS setup

### Create IAM user
1. Go to IAM -> Users.
2. Press "Add user".
3. Enter user name.
4. Enable "Programmatic access".
5. Press "Next" a few times and then "Create user".

### Create access key
1. Select the new user in the user overview and select the "Security credentials" tab.
2. Press "Create access key".
3. Click on "Show" and save the Access key ID and Secret access key in a safe place.

### Create bucket
1. Go to S3.
2. Press "Create bucket".
3. Enter bucket name.
4. Select a region. Find the corresponding region id here (e.g. eu-west-1) and write it down: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html
6. Press "Next" a few times and then "Create bucket".

### Configure bucket access
1. Select the bucket in the bucket overview.
2. Select the "Permissions" tab.
3. Press "Bucket policy".
4. Enter the policy below.
   * Replace IAM_USER_NAME with the username of the user created above.
   * Replace BUCKET_NAME with the name of the bucket.

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
