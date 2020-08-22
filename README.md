# MAMAS Google Form to Trello Card

## Context

This is a Google Script that creates new cards in Trello for any form submissions that come into our mutual aid network. It was inspired by [this blog post](https://www.labnol.org/code/20115-trello-google-forms), sent to us by friends in our Lowell Mutual Aid Network.

Mutual Aid Medford and Somerville (MAMAS) uses a Google Form (called the "Needs Form") to take in requests for support. In order to ensure we're making connections between specific requests for support and offers for support, we use Trello. This script enables the connection between the Needs Form and associated Trello board. [Google Scripts](https://www.google.com/script/start/) such as this one connect to Google Apps, like Forms, to deliver additional functionality.

Importantly, the script in this repository **is not** currently driving the functionality in the live Needs Form. Instead, **making changes to the live script requires a specific and manual deployment process. That process is described below.**

At present, the most frequent use cases for changing this script are as follows:
  1. A major section is added to or removed from the Needs Form.
  2. A new Needs Form is created, requiring a script to be added.
  3. A translation to the section titles needs to be added or updated. This is frequently required alongside use case 2.

## Deployment

1. Navigate to the Google Form that requires the script to be attached or an update. Once there, click on the three vertical dots, then click on **Script Editor**.
2. You should now see an editor. Copy/paste the code from the `script.gs` file into the editor.
3. In the following steps, you will establish the constants used in this form's instance of the script. First, create a new API token and key for your Trello account by following the steps [provided by Trello](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/#boards). Once you have them, return to the editor and copy/paste the token inside the quotation marks, replacing where it says `[TRELLO API TOKEN]`. Next, copy/paste the key inside the quotation marks where it says `[TRELLO API KEY]`.
4. In the following steps, you will get the identifiers for the Trello board to which the Form responses are added.
    1.  Go to the Trello board to which Needs Form responses will be sent and navigate to the URL bar. Replace the name at the end of the URL (such as `/tech-team-tasks`) with `/reports.json`. This will return a bunch of `JSON` text.
    2. Find the place in the text where it says `id` (this should be fairly early in the text), and copy the (not so) random string of letters and numbers from there into the quotation marks in the Form script where it says `[ID FOR THE TRELLO BOARD]`.
    3. Use `CTRL-F` or `CMD-F` to search the `reports.json` text content for the name of the Trello column into which you want to add new cards. Once you find the name, you should see a field next to it called `id` again. Copy the (not so) random string of letters and numbers for this `id` (which should be different from the one before) and paste it into your script where it says `[ID FOR THE LIST IN WHICH TO PUT THE CARD]`.
5. In this step, you will create the constants that we use to delinate the different sections. Search the script for the `cardStartHeaders` object variable. For each of the sections (`"money"`, `"supplies"`, etc.), find the associated "Section Start" question in the Needs Form. Copy that "Section Start" text in to the key string of the `cardStartHeaders` object. Once all the keys are populated with the appropriate language's questions, you are done with this step.
    * If you need help with this step, reach out to the `#wg-translation` team liasion (currently Sam L.).
6. Now that all the script constants are filled in, go to `Run` in the navigation bar and run the `init()` function. This will create the **trigger** for the Needs Form to which the script is attached. Now, any time your form gets a new submission, it will run the `submitToTrello()` function.
7. Once `init()` has been run, the Form should be up and running! Feel free to celebrate with a pastry, or a self hi-five, or whatever other way you like to acknowledge achievements. 😄
    * If it's not up and running, feel free to email [askyourtechmamas@gmail.com](mailto:askyourtechmamas@gmail.com) or ask in the `#tech-team` Slack channel for help!