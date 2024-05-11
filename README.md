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
  * pwa notifications
    * https://github.com/andreinwald/webpush-ios-example/blob/main/backend-sender.js
    * implement pushsubscriptionchange event

* fix hotlinking profile pictures
* remove updater enabled setting (if there are channels set up it is enabled and if there are none it is disabled)

* API
  * get user information
  * get logs
  * send notifications
  * get grades / interact with facts api via IntelliFACTS methods

* Release oriented
  * update readme with setup instructions
  * use semantic versioning
  * github tags and releases