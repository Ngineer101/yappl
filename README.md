![Yappl logo](https://res.cloudinary.com/djhmkzcnv/image/upload/v1606508421/yappl-landing-page/twitter_header_photo_2_ms8kaq.png)

# Yet Another Publishing Platform

## Host your own publication in 5 simple steps

__A PostgreSQL database is required__

*and*

__A Mailgun account is required if you want to send emails__

## Step 1

Fork this repository

## Step 2

Create an account on [Vercel](https://vercel.com) and import your forked repository (more details [here](https://vercel.com/docs/git#deploying-a-git-repository))

## Step 3

Add these environment variables to your Vercel app

| Name | Description | Example |
| ---- | ----------- | ------- |
| SITE_URL (required) | Your publication URL | [https://yappl.xyz](https://yappl.xyz/) |
| NEXTAUTH_URL (required) | Your publication URL | [https://yappl.xyz](https://yappl.xyz/) |
| POSTGRES_DATABASE (required) | Your PostgreSQL connection string | postgres://username:password@server-address:port/database |
| APP_SECRET (required) | A random string | [Or copy this one](https://yappl.xyz/#appSecret) |
| JWT_SECRET (required) | A random string | [Or copy this one](https://yappl.xyz/#jwtSecret) |

## Step 4

Connect your domain on Vercel (more details [here](https://vercel.com/docs/custom-domains))

## Step 5

Go to yourdomain.com/signup and set up your publication

## Start writing

🖊️💻🎂

---

This project is still under development

Want to help make it __EVEN__ easier to set up your own publication?

Fork this repository and submit your pull request.
