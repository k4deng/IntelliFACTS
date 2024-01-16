# IntelliFACTS
IntelliFACTS is a program you can spin up to check the grades of someone using FACTS (RenWeb) at their school and update them of changes.

The program can
* check your grades and show them to you (`/grades/overview`)
* show you the full grade sheet for a class (`/grades/class/{classID}`)
* show a grid of your classes homework (`/homework`)

<br />

## TODO:

There are many improvements to be made to IntelliFACTS before 1.0.0 release, my list is below.

* Finish updater
  * cron job to run updater
  * send notifications when ran

* Notifications
  * cannot do native notifications, discord is the best option atm
  * discord bot:
      * link to user with code entered on website
      * creates category for user on public server with channels with options to send specific events to specific channels

* admin
  * delete user

* PWA
  * Add install popups

* API
  * manually trigger updater
  * get user information
  * get logs
  * send notifications
  * get grades / interact with facts api via IntelliFACTS methods

* Add homework grid

* Release oriented
  * discord server for IntelliFACTS
  * update readme with setup instructions
  * use semantic versioning
  * github tags and releases
  * dockerify stack
  * host locally