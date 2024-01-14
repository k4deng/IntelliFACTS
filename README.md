# IntelliFACTS
IntelliFACTS is a program you can spin up to check the grades of someone using FACTS (RenWeb) at their school and update them of changes.

The program can
* check your grades and show them to you (`/grades/overview`)
* show you the full grade sheet for a class (`/grades/class/{classID}`)
* show a grid of your classes homework (`/homework`)

<br />

## TODO:

There are many improvements to be made to this program before 1.0.0 release, my full list is below.

* Finish updater
  * Settings
    * make settings page look nice => rows and columns
    * Multiple notification channels
    * How often to run updater 5/15/60 minutes
  * cron job to run updater

* Notifications
  * Add notification service using https://novu.co/
    * Priority: In app, discord, and push (using onesignal)
    * after comes email, and making android push work

* PWA
  * Make it a PWA
  * Add manifest.json
  * Add install popups

* Add homework grid

* Release oriented
  * discord server for IntelliFACTS
  * update readme with setup instructions
  * use semantic versioning
  * github tags and releases
  * dockerify stack
  * host locally