// Credit: https://gist.github.com/jezhou/

// Fire off this function in the script editor to enable.
function init() {

  var triggers = ScriptApp.getProjectTriggers();
  var form = FormApp.getActiveForm();

  // Delete all triggers before making a brand new one.
  //for(var i in triggers) {
  //  ScriptApp.deleteTrigger(triggers[i]);
  //}

  // Set up a new trigger
  ScriptApp.newTrigger('submitToTrello')
           .forForm(form)
           .onFormSubmit()
           .create();

  Logger.log('Successful creation of new submitToTrello trigger.');

}

function submitToTrello(e) {

  var form = FormApp.getActiveForm();
  var latestItem = form.getResponses().pop();
  var timestamp = latestItem.getTimestamp(); // get the timestamp for later in the description
  var latestItemResponses = latestItem.getItemResponses();
  
  Logger.log(MailApp.getRemainingDailyQuota());
  
  if (MailApp.getRemainingDailyQuota() > 0) {

    // Trello email address goes here
    var email = "[TRELLO EMAIL ADDRESS]";

    // Subject line will be the title of the event on Trello card
    // subject is: [name] + [pronouns] + [city]
    var subject = latestItemResponses[1].getResponse() + ' (' + latestItemResponses[2].getResponse() + '), ' + latestItemResponses[3].getResponse();
    subject = subject.concat(' #English');
    
    // This is the beginning of the description in trello. Later we'll add request details.
    // To start, we add contact info, neighborhood if desired, and degree of comfort sharing the need
    var body = "";
    var timeString = Utilities.formatDate(timestamp, "EST", "EEE, d MMM yyyy HH:mm:ss z") // format the timestamp for the description
    body = body.concat(Utilities.formatString(
      '**Timestamp:** %s\n**I am filling this out:** %s\n**Contact Info:** %s\n',
      timeString, latestItemResponses[0].getResponse(), latestItemResponses[5].getResponse()
    ));
    
    // add neighborhood if the person is a "yes" or a "maybe" for getting connected
    if (latestItemResponses[6].getResponse() != 'No') {
      body = body.concat(Utilities.formatString(
        '**Connect to neighborhood?** %s\n**Neighborhood:** %s\n',
        latestItemResponses[6].getResponse(), latestItemResponses[7].getResponse()
      ));
    }
    
    // add the details that are collected at the end of the form – personal info, sharing desire
    var responseLength = latestItemResponses.length;
    body = body.concat(Utilities.formatString(
      '**Personal info:** %s\n**Level of sharing I am ok with:** %s\n**What information I am ok with sharing:** %s\n\n',
      latestItemResponses[responseLength - 3].getResponse(), latestItemResponses[responseLength - 2].getResponse(),latestItemResponses[responseLength - 1].getResponse()
    ));
    
    // add labels and descriptions based on what type of help is requested
    // labels are added to the "subject" of the email as hastags, descriptions are added to the body of the email.
    // for each request from the form, create a separate trello card.
    var localSubj = "";
    var localBody = "";
    for (var i = 8; i < latestItemResponses.length; i++) {
      
      // check for $$$ requests first
      if (latestItemResponses[i].getItem().getTitle() == 'Do you need financial resources?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #$$$');
        localBody = localBody.concat('##Money Requests##\n');
        for (var j = 1; j < 9; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 8;
      }
      
      // check for supplies/errands
      if (latestItemResponses[i].getItem().getTitle() == 'Do you need help getting supplies or running errands?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Supplies/Errands');
        localBody = localBody.concat('##Supplies/Errands##\n');
        for (var j = 1; j < 8; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 7;
      }
      
      // check for transportation/ridesharing requests
      if (latestItemResponses[i].getItem().getTitle() == 'Do you need help with transportation or ridesharing?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Transportation/Rideshare');
        localBody = localBody.concat('##Rideshare##\n');
        for (var j = 1; j < 6; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 5;
      }
      
      // check for housing/storage requests
      if (latestItemResponses[i].getItem().getTitle() == 'Do you need help with housing and/or storage?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Housing/Storage');
        localBody = localBody.concat('##Housing & Storage##\n');
        for (var j = 1; j < 15; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 14;
      }
      
      // check for childcare or petcare requests
      if (latestItemResponses[i].getItem().getTitle() == 'Are you looking for in person childcare and/or online activities for kids and/or petcare?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Childcare/Petcare');
        localBody = localBody.concat('##Childcare & Petcare##\n');
        for (var j = 1; j < 12; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 11;
      }
      
      // check for emotional or spiritual support requests
      if (latestItemResponses[i].getItem().getTitle() == 'Are you looking for emotional or spiritual support?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Emotional/Spiritual');
        localBody = localBody.concat('##Emotional/Spiritual Support##\n');
        for (var j = 1; j < 2; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 1;
      }
      
      // check for requests for support with resources
      if (latestItemResponses[i].getItem().getTitle() == 'Do you need resource support?' && latestItemResponses[i].getResponse() == 'Yes') {
        localSubj = subject.slice(0);
        localBody = body.slice(0);
        
        localSubj = localSubj.concat(' #Resources');
        localBody = localBody.concat('##Resources##\n');
        for (var j = 1; j < 3; j++) {
          var formatted = Utilities.formatString("**%s**\n %s\n\n", latestItemResponses[i+j].getItem().getTitle(), latestItemResponses[i+j].getResponse());
          formatted = formatted.concat('\n');
          localBody = localBody.concat(formatted);
        }
        
        MailApp.sendEmail(email, localSubj, localBody);
        
        i = i + 2;
      }
    }
  }
}
