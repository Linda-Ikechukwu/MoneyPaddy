<img src="screenshoot.PNG" alt="Ui screenshot of the Money Paddy app">

<h1 align="center">
  Money Paddy : Income and Expense Tracker
</h1>

Money paddy is a PWA that leverages on the power of indexed db, local storage, service workers and the manifest to function fully offline. It is a web app for tracking and logging income and expenses.

## App Features

1. User can log an income or expense.
2. Inputs are saved in indexeddb objectstores to persit data offline.
3. User can delete logged income or expense.
4. User can select a currency of their choice to log income or expense in.
5. Users can opt in to receive push notifications or not.
6. If users opt for push notifications, a push notification prompting the user to log an input is sent every 24     hours that the user goes without logging an expense.


##  To Clone

1. Fork the reposistory
2. Install dependencies `npm install`
3. Start app `npm run start`

N.B : Remember to change firebase settings to your on account specifics at `functions/index.js`, and generate new VAPID keys. Didnt hide them cos i thought the code might be of help to understand.
