# Yet Another Publishing Platform

![Yappl logo](https://raw.githubusercontent.com/getyappl/landingpage/main/public/assets/design/dark/logo.png?token=AFBXYSYYV5TGDVQ2TURUOA27YN3IW)

## Host your own publication in 5 simple steps

---

## Step 1

### Go to this repository (done)

---

## Step 2

### Click this button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fgetyappl%2Fpublication&env=SITE_URL,NEXTAUTH_URL,POSTGRES_DATABASE,APP_SECRET,JWT_SECRET,MAILGUN_API_KEY,MAILGUN_DOMAIN,MAILGUN_HOST,DEFAULT_EMAIL)

---

## Step 3

### Add these environment variables to your app on Vercel

| Name                         | Description                       | Example                                                                                                                                                           |
| ---------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SITE_URL (required)          | Your publication URL              | [https://yappl.xyz](https://yappl.xyz/)                                                                                                                           |
| NEXTAUTH_URL (required)      | Your publication URL              | [https://yappl.xyz](https://yappl.xyz/)                                                                                                                           |
| POSTGRES_DATABASE (required) | Your PostgreSQL connection string | postgres://username:password@server-address:port/database                                                                                                         |
| APP_SECRET (required)        | A random string                   | [Or copy this one](https://yappl.xyz/#appSecret)                                                                                                                  |
| JWT_SECRET (required)        | A random string                   | [Or copy this one](https://yappl.xyz/#jwtSecret)                                                                                                                  |
| MAILGUN_API_KEY (required)   | Your Mailgun API key              | key-1ds434a8b56b0131fsdfgd17ca516acc8asdf                                                                                                                         |
| MAILGUN_DOMAIN (required)    | Your Mailgun domain               | mail.yappl.xyz                                                                                                                                                    |
| MAILGUN_HOST (optional)      | Your Mailgun host                 | If you are using the Mailgun US region - leave empty <br> If you are using the Mailgun EU region - __api.eu.mailgun.net__                                         |
| DEFAULT_EMAIL (optional)     | Your default domain email         | If left empty __noreply@yourdomain.com__ will be used <br> * this does not have to be an existing email address if you don't want to receive mail on this address |

---

## Step 4

### Connect your domain on Vercel ([read more](https://vercel.com/docs/custom-domains))

---

## Step 5

### Go to yourdomain.com/signup and set up your publication

---

## Start writing

🖊️💻🎂

---

This project is still under development

Want to help make it __EVEN__ easier to set up your own publication?

Fork this repository and submit your pull request.
