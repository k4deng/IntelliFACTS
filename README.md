# IntelliFACTS
IntelliFACTS is a program you can spin up to check the grades of someone using FACTS (RenWeb) at their school and update them of changes.

The program can
* check your grades and show them to you (`/grades/overview`)
* show you the full grade sheet for a class (`/grades/class/{classID}`)
* show a grid of your classes homework (`/homework`)

<br />

## TODO:

There are many improvements to be made to IntelliFACTS before 1.0.0 release, my list is below.

* notifications system revamp
  * allow user to choose discord/pwa/both
  * pwa notifications
    * prompt to add pwa (send popup when opened on ios/android)
    * when pwa added, send to link page
    * user has to accept notifications
    * send generated keys to server and add to user settings
    * send user back to homepage
    * update updater to also send pwa notifications if configured

* API
  * get user information
  * get logs
  * send notifications
  * get grades / interact with facts api via IntelliFACTS methods

* Release oriented
  * update readme with setup instructions
  * use semantic versioning
  * github tags and releases