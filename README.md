![Yappl logo](https://res.cloudinary.com/djhmkzcnv/image/upload/v1607100015/yappl-landing-page/logo_zokuy3.png)

# Yet Another Publishing Platform

## Host your own publication in 4 simple steps

__A PostgreSQL database is required__

*and*

__A Mailgun account is required if you want to send emails__

## Step 1

### Click this button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FNgineer101%2Fyappl&env=SITE_URL,NEXTAUTH_URL,POSTGRES_DATABASE,APP_SECRET,JWT_SECRET)

## Step 2

### Add these environment variables to your Vercel app

| Name | Description | Example |
| ---- | ----------- | ------- |
| SITE_URL (required) | Your publication URL | [https://yappl.xyz](https://yappl.xyz/) |
| NEXTAUTH_URL (required) | Your publication URL | [https://yappl.xyz](https://yappl.xyz/) |
| POSTGRES_DATABASE (required) | Your PostgreSQL connection string | postgres://username:password@server-address:port/database |
| APP_SECRET (required) | A random string | [Or copy this one](https://yappl.xyz/#appSecret) |
| JWT_SECRET (required) | A random string | [Or copy this one](https://yappl.xyz/#jwtSecret) |

## Step 3

### Connect your domain on Vercel ([read more](https://vercel.com/docs/custom-domains))

## Step 4

### Go to yourdomain.com/signup and set up your publication

## Start writing

🖊️💻🎂

---

This project is still under development

Want to help make it __EVEN__ easier to set up your own publication?

Fork this repository and submit your pull request.
