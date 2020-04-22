# Google Form to Trello Card

This is a Google Script that creates new cards in Trello for any form submissions that come into our mutual aid network. It was inspired by [this blog post](https://www.labnol.org/code/20115-trello-google-forms), sent to us by friends in our Lowell mutual aid network.

Mutual Aid Medford and Somerville (MAMAS) uses a google form to take in requests for support. In order to ensure we're making connections between specific requests for support and offers for support, we use Trello. This script enables the connection between our form and our trello board.

In order to use a script like this, follow the following steps:

1. Go to your google from, click on the 3 vertical dots, and click on **Script Editor**
2. Copy/paste the code here into your script editor.
3. Create a new api token for you Trello account. Follow the steps here. Once you have it, go to your script, and copy/paste the token inside the quotation marks, replacing where it says `[TRELLO API TOKEN]`.
4. Create a new api key for your Trello account. Follow the steps here. Onc eyou have it, go to your script, and copy/paste the token inside the quotation marks where it says `[TRELLO API KEY]`.
5. Go to the Trello board you plan to use. Go to the URL bar. Replace the name at the end of the url with `/reports.json`. This will return a bunch of text.
5a. Find the place where it says `id`, and copy the (not so) random string of letters and numbers from there into the quotation marks in your script where it says `[ID FOR THE TRELLO BOARD]`.
5b. Use `ctrl-f` or `cmd-f` to search the `reports.json` URL for the name of the list you want to put new cards into. Once you find the name, you should see a field next to it called `id` again. Copy the (not so) random string of letters and numbers you see in THAT id, which should be different from the one before, and paste it into your script where it says `[ID FOR THE LIST IN WHICH TO PUT THE CARD]`.
6. Now that you have all of the info you need in the script, go to `Run` in the navigation, and run the `init` function. This will create the **trigger** for your form. Now, any time your form gets a new submission, it will run the script that says `submitToTrello`.
7. Ok it should be up and running! Feel free to celebrate with a pastry, or a self hi-five, or whatever other way you like to acknowledge achievements :).
8. If it's not up and running, feel free to email [askyourtechmamas](mailto:askyourtechmamas@gmail.com) for more help.
