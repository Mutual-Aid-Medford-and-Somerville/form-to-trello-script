# Google Form to Trello Card

This is a Google Script that creates new cards in Trello for any form submissions that come into our mutual aid network. It was inspired by [this blog post](https://www.labnol.org/code/20115-trello-google-forms), sent to us by friends in our Lowell mutual aid network.

Mutual Aid Medford and Somerville (MAMAS) uses a google form to take in requests for support. In order to ensure we're making connections between specific requests for support and offers for support, we use Trello. This script enables the connectiono between our form and our trello board.

In order to use a script like this:

1. Go to your google from, click on the 3 vertical dots, and click on **Script Editor**
2. Copy/paste the code here into your script editor.
3. Go to the trello board you want to use for your form submissions, and grab the unique email address associated with that board. Copy/past the email address into the script where it says `[TRELLO EMAIL ADDRESS]`, in between the qutoation marks.
4. Go to `Run` in the navigation, and run the `init` function. This will create the **trigger** for your form. Now, any time your form gets a new submission, it will run the script that says `submitToTrello`.
