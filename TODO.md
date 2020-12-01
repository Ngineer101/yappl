# TODO's

- Post saving fails on publish - already active connection error
- Add published date on post page and tiles
- line breaks in WYSIWYG editor not working
- Add page to preview posts
- Coloring text not working
- Set cover images on post tiles
- Make unauthorized and authorized container for both types of pages
- Increase width of editor slightly on 13" screens
- subscribe input on home page - make full width on mobile screens
- scroll editor down automatically when cursor moves out of view
- Check authentication per route
- Increase line heigth and font size for paragraphs for easier reading
- Newsletter identity - logo and color / theme
- add page to create verification / welcome email
- Add dark mode option
- run lighthouse audit and fix issues
- Analytics on newsletter
- Analytics for emails - open rates / link clicks etc.
- Paid memberships
- Import paid memberships Substack
- Social media optimization
- Set max width of headline and description on home page
- Reset password functionality

Test:

- Slug not generated correctly
- listen for key combinations (ctrl+s) on edit post page
- From email default

### Some basic mobile SEO rules:

- no zoom allowed
- no fonts below 11px
- buttons with a min 48px height
- 16px between elements
- 100% width inputs

## Go live steps

- Fork repo
- Deploy to vercel.com
- setup db on ElephantSQL
- Add domain to Mailgun
- Add all environment variables
- Connect domain
- Test mail sending

## Launching steps

- Create landing page and deploy to yappl.xyz - steps with setting up yappl
- Update README with similar copy
- Create license file
- Remove Notes and TODO markdown files
- Update twitter, Ycombinator, IH profile


"new-migration-usage": "e.g. npm run new-migration -- -n InitialMigration (Don't use this command)"
git pull alt-origin master
git push
