const cron = require('node-cron');
const Contact = require("./models/contact");
const email = require("./email-template");


console.log("THIS SHIT IS ON");

/* ---- THE PLAN ---- */
// Search all contacts for EVERYONE
// save it to a list
// forEach contact in contacts
// get today's date
// find out what stage the contact is in
// if the date for the corresponding stage is less than or equal to today, send an email
// update the current stage to the next (unless in repeating stage, in which case just update it by the original value submitted)

const scheduler = async () => {
    const today = await new Date();
    const currentDate = new Date(today.getFullYear(),today.getMonth(),today.getDate())
    // check all the contacts
    const allContacts = await Contact.find();
    for(let i=0; i<allContacts.length; i++){
        // let contact = allContacts[i]; // Refactor this as necessary for readability
        let currentStage = allContacts[i].stage;
        let dateToCheck;
        if((currentStage == 3 && allContacts[i]["thirdReminder"] == undefined) || (currentStage == 4 && allContacts[i]["fourthReminder"] == undefined)) {
            currentStage = 5
        }
        switch(currentStage){
            case 1:
                dateToCheck = allContacts[i]["firstReminder"];
                break;
            case 2:
                dateToCheck = allContacts[i]["secondReminder"];
                break;
            case 3:
                dateToCheck = allContacts[i]["thirdReminder"];
                break;
            case 4:
                dateToCheck = allContacts[i]["fourthReminder"];
                break;
            default:
                dateToCheck = allContacts[i]["repeatingReminder"];
        }
        console.log("test shit: ", allContacts[i], dateToCheck);
        if(dateToCheck <= currentDate){ // if today is the day to email on each contact
            console.log("great timing");
            console.log("what kind of user info we got? ", allContacts[i])
            console.log(allContacts[i].user, " or ", allContacts[i].email)
            try{
                email(allContacts[i].user, allContacts[i].contactEmail, allContacts[i].contactName, allContacts[i].contactSummary);
                
                // if(allContacts[i].stage < 5 || allContacts[i].contactStage < 5) {
                    try{
                        let nextStage = allContacts[i].stage;
                        ++nextStage; // this is ugly but for some reason putting ++ on the line above wasn't working
                        allContacts[i].stage = nextStage;
                        const updatedContact = await Contact.findByIdAndUpdate(allContacts[i]._id, allContacts[i]);
                        await updateContactReminderDate(allContacts[i]);
                        await console.log("this the updated contact, but less than 5: ", updatedContact);
                    } catch(err){
                        console.log("the less than 5 shit didn't update. Also here's the error: ", err);
                    }
                // }
                
                // else if(allContacts[i].stage == 5 || allContacts[i].contactStage == 5){
                //     updateContactReminderDate(allContacts[i]);
                // }
            } catch(err) {
                console.log(err)
            }
        }
    }
    // send email to $OWNER about $CONTACT reminding them of $TOPIC and that this should be email follow-up number $STAGE
    console.log('running a task every sec');
}


const updateContactReminderDate = async (contact) => {
    try{
        const today = new Date();
        projectedDate = async (addedTime) => {
            return new Date(today.getFullYear(),today.getMonth(),today.getDate()+ addedTime);
        }
        console.log("this is the contact BEFORE updating: ", contact)
        contact.repeatingReminder = await projectedDate(parseInt(contact.repeatingReminderRhythm));
        const updatedContact = await Contact.findByIdAndUpdate(contact._id,contact);
        await updatedContact.save();
        await console.log("this is the contact AFTER updating: ", updatedContact);
    } catch(err) {
        console.log("Could not update contact");
        console.log(err);
    }
}

//  ┌────────────── second (optional)
//  │ ┌──────────── minute
//  │ │ ┌────────── hour
//  │ │ │ ┌──────── day of month
//  │ │ │ │ ┌────── month
//  │ │ │ │ │ ┌──── day of week
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *

// This runs the task every day:
// cron.schedule('0 0 * * *', () => {

// This runs the task every minute:
// cron.schedule('* * * * *', () => {

// This runs the task every hour:
cron.schedule('* * * * *', () => {
    console.log(" ------------------ RUNNING ONCE ------------------ ");
    scheduler();
});

module.exports = scheduler;